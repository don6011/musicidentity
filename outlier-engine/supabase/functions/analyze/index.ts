import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.27.0'

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('authorization')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data: { user }, error: authErr } = await createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
      .auth.getUser(authHeader?.replace('Bearer ', '') ?? '')
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

    const { video_id, user_context = '' } = await req.json()

    // Fetch video data
    const { data: video, error: vErr } = await supabase
      .from('videos')
      .select('*')
      .eq('id', video_id)
      .single()
    if (vErr || !video) return json({ error: 'Video not found' }, 404)

    const claude = new Anthropic({ apiKey: ANTHROPIC_KEY })

    const now = Date.now()
    const ageDays = Math.max(1, (now - new Date(video.published_at).getTime()) / 86400000)
    const vpd = (video.view_count ?? 0) / ageDays
    const baselineVpd = video.vps ?? vpd
    const outlierMultiple = baselineVpd > 0 ? vpd / baselineVpd : 1

    // Prompt 9a: Why it won
    const teardownJson = await callClaude(claude, {
      system: `You are a YouTube strategy analyst. You are given data about a video that is significantly OUTPERFORMING its channel's baseline (an algorithmic outlier). Explain WHY it is winning, concretely. Do not be generic.
Return ONLY valid JSON, no markdown, no preamble:
{
  "core_reason": "one sharp sentence — the single biggest driver",
  "topic_angle": "what specific angle/promise the title makes",
  "packaging_read": "what the title + thumbnail combo does to earn the click",
  "timing_or_trend": "is this riding a trend, a season, a news moment, or evergreen?",
  "replicability": "high | medium | low — can a smaller creator copy this format?",
  "what_to_steal": "the specific transferable element a user should replicate"
}`,
      user: `Title: "${video.title}"
Channel subs: ${video.channel_sub_count?.toLocaleString()}
Video views: ${video.view_count?.toLocaleString()} in ${Math.round(ageDays)} days (vpd ${Math.round(vpd)})
Channel baseline vpd: ${Math.round(baselineVpd)} → outlier multiple: ${outlierMultiple.toFixed(1)}x
Niche: (infer from title)`,
    })

    // Prompt 9b: Packaging generation
    const packagingJson = await callClaude(claude, {
      system: `You are a YouTube packaging strategist. Given a proven outlier in a niche, generate packaging for a NEW video the user will make on the same transferable format. Titles must create a curiosity gap WITHOUT clickbait that the video can't pay off. Thumbnails are described for a designer/AI image tool: composition, focal subject, facial expression if any, text overlay (≤4 words), color/contrast strategy.
Return ONLY valid JSON:
{
  "title_concepts": ["", "", "", "", ""],
  "thumbnail_concepts": [
    {"composition":"", "focal":"", "text_overlay":"", "color_strategy":"", "why":""}
  ]
}`,
      user: `Proven outlier title: "${video.title}"
What made it win: ${teardownJson.core_reason} / ${teardownJson.what_to_steal}
The user's video idea / channel context: ${user_context || '(not provided — make titles adaptable)'}
Niche: (infer from title)`,
    })

    // Prompt 9d: Hook skeleton (v1 — no transcript)
    const hookJson = await callClaude(claude, {
      system: `You write retention-engineered video hook skeletons. The first 30 seconds decide whether YouTube keeps distributing a video. Produce a beat-by-beat skeleton: cold open, the promise, the open loop, why-stay tension, then the roadmap. No fluff intros, no "hey guys welcome back."
Return ONLY valid JSON:
{
  "cold_open": "first spoken line + visual",
  "the_promise": "the payoff stated in the first 15s",
  "open_loop": "the unresolved question that keeps them watching",
  "first_60s_beats": ["", "", "", ""],
  "retention_risk": "where viewers will most likely drop, and the fix"
}`,
      user: `Video the user is making: based on outlier format
Proven outlier format it's based on: ${teardownJson.what_to_steal}
Outlier title: "${video.title}"`,
    })

    const hookText = `COLD OPEN: ${hookJson.cold_open}\n\nTHE PROMISE: ${hookJson.the_promise}\n\nOPEN LOOP: ${hookJson.open_loop}\n\nFIRST 60s BEATS:\n${hookJson.first_60s_beats.map((b: string, i: number) => `${i + 1}. ${b}`).join('\n')}\n\nRETENTION RISK: ${hookJson.retention_risk}`

    // Save analysis
    const { data: analysis } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        video_id,
        why_it_won: teardownJson,
        title_concepts: packagingJson.title_concepts,
        thumbnail_concepts: packagingJson.thumbnail_concepts,
        hook_skeleton: hookText,
      })
      .select()
      .single()

    return json(analysis)
  } catch (err: any) {
    console.error(err)
    return json({ error: err.message }, 500)
  }
})

async function callClaude(client: Anthropic, { system, user }: { system: string; user: string }) {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: user }],
  })

  const raw = (msg.content[0] as any).text as string
  const cleaned = raw.replace(/^```json\s*/m, '').replace(/```\s*$/m, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    // Re-prompt once
    const retry = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system,
      messages: [
        { role: 'user', content: user },
        { role: 'assistant', content: raw },
        { role: 'user', content: 'Your last output was not valid JSON. Return only the JSON object, no markdown fences.' },
      ],
    })
    const retryText = (retry.content[0] as any).text as string
    return JSON.parse(retryText.replace(/^```json\s*/m, '').replace(/```\s*$/m, '').trim())
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

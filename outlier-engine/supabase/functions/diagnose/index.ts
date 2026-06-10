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

  const authHeader = req.headers.get('authorization')
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { data: { user } } = await createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    .auth.getUser(authHeader?.replace('Bearer ', '') ?? '')
  if (!user) return json({ error: 'Unauthorized' }, 401)

  const { tracked_video_id } = await req.json()

  // Fetch history
  const { data: history } = await supabase
    .from('tracking_history')
    .select('*')
    .eq('tracked_video_id', tracked_video_id)
    .order('checked_at', { ascending: true })

  if (!history?.length) return json({ diagnosis: 'Not enough data yet — check back after the first poll.' })

  const first = history[0]
  const last = history[history.length - 1]
  const daysBetween = Math.max(1, (new Date(last.checked_at).getTime() - new Date(first.checked_at).getTime()) / 86400000)
  const vpd = (last.view_count - first.view_count) / daysBetween

  const claude = new Anthropic({ apiKey: ANTHROPIC_KEY })

  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `A creator published a YouTube video and we've been tracking it. Give an honest diagnosis.

Tracking data:
- First check: ${first.view_count?.toLocaleString()} views (${new Date(first.checked_at).toDateString()})
- Latest check: ${last.view_count?.toLocaleString()} views (${new Date(last.checked_at).toDateString()})
- Days tracked: ${Math.round(daysBetween)}
- Views per day over tracking period: ${Math.round(vpd)}

In 2-3 sentences: is this video gaining traction or stalling? What's the most likely reason based on the data? Be honest and specific.`,
    }],
  })

  return json({ diagnosis: (msg.content[0] as any).text })
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

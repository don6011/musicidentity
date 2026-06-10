// Cron-triggered: polls tracked videos and writes tracking_history
// Schedule: every 24h via Supabase cron (pg_cron)
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const YT_KEY = Deno.env.get('YOUTUBE_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (_req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Get all tracked videos not checked in last 20h
  const cutoff = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
  const { data: tracked } = await supabase
    .from('tracked_videos')
    .select('id, yt_video_id')

  if (!tracked?.length) return new Response('ok')

  // Exclude videos checked recently
  const { data: recentChecks } = await supabase
    .from('tracking_history')
    .select('tracked_video_id')
    .gte('checked_at', cutoff)

  const recentIds = new Set(recentChecks?.map(r => r.tracked_video_id) ?? [])
  const toCheck = tracked.filter(t => !recentIds.has(t.id))

  if (!toCheck.length) return new Response('ok - all recent')

  // Batch fetch stats
  const ytIds = toCheck.map(t => t.yt_video_id)
  const statsMap: Record<string, { views: number; likes: number; comments: number }> = {}

  for (let i = 0; i < ytIds.length; i += 50) {
    const chunk = ytIds.slice(i, i + 50)
    const url = new URL('https://www.googleapis.com/youtube/v3/videos')
    url.searchParams.set('key', YT_KEY)
    url.searchParams.set('part', 'statistics')
    url.searchParams.set('id', chunk.join(','))
    const res = await fetch(url)
    const data = await res.json()
    for (const item of data.items ?? []) {
      statsMap[item.id] = {
        views: parseInt(item.statistics?.viewCount ?? '0'),
        likes: parseInt(item.statistics?.likeCount ?? '0'),
        comments: parseInt(item.statistics?.commentCount ?? '0'),
      }
    }
  }

  const historyRows = toCheck
    .filter(t => statsMap[t.yt_video_id])
    .map(t => ({
      tracked_video_id: t.id,
      view_count: statsMap[t.yt_video_id].views,
      like_count: statsMap[t.yt_video_id].likes,
      comment_count: statsMap[t.yt_video_id].comments,
    }))

  if (historyRows.length) {
    await supabase.from('tracking_history').insert(historyRows)
  }

  return new Response(`Checked ${historyRows.length} videos`)
})

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const YT_KEY = Deno.env.get('YOUTUBE_API_KEY')!
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

    // Verify user
    const { data: { user }, error: authErr } = await createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
      .auth.getUser(authHeader?.replace('Bearer ', '') ?? '')
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

    const { query, scan_type } = await req.json() as { query: string; scan_type: 'niche' | 'channel' }

    // Cache check: same query within 36h
    const cutoff = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
    const { data: cached } = await supabase
      .from('snapshots')
      .select('id')
      .eq('user_id', user.id)
      .eq('query', query)
      .eq('scan_type', scan_type)
      .gte('fetched_at', cutoff)
      .limit(1)
      .single()

    if (cached) {
      const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .eq('snapshot_id', cached.id)
        .order('outlier_score', { ascending: false })
        .limit(20)
      return json({ snapshot_id: cached.id, outliers: enrichVideos(videos ?? []) })
    }

    // Fetch video IDs from YouTube
    let videoIds: string[] = []
    let channelIds: string[] = []

    if (scan_type === 'channel') {
      // Resolve channel → uploads playlist → recent video IDs
      const channelId = await resolveChannelId(query)
      const uploadsPlaylistId = await getUploadsPlaylist(channelId)
      const items = await getPlaylistItems(uploadsPlaylistId, 50)
      videoIds = items.map(i => i.contentDetails.videoId)
      channelIds = [channelId]
    } else {
      // Niche scan: one search.list call (100 units)
      const searchRes = await ytGet('search', {
        part: 'id',
        q: query,
        type: 'video',
        maxResults: '50',
        publishedAfter: daysAgo(90),
        videoDuration: 'medium', // exclude shorts (< 4 min shown as short)
      })
      videoIds = searchRes.items?.map((i: any) => i.id.videoId).filter(Boolean) ?? []
    }

    if (!videoIds.length) return json({ snapshot_id: null, outliers: [] })

    // Batch fetch video stats (1 unit per 50)
    const videoDetails = await batchVideos(videoIds)

    // Extract unique channel IDs
    const uniqueChannelIds = [...new Set([
      ...channelIds,
      ...videoDetails.map((v: any) => v.snippet?.channelId).filter(Boolean),
    ])]

    // Batch fetch channel stats (1 unit per 50)
    const channelMap = await batchChannels(uniqueChannelIds)

    // For each channel, get their recent uploads to compute baseline
    const baselineMap = await computeBaselines(uniqueChannelIds, videoDetails)

    // Build and score videos
    const now = Date.now()
    const scoredVideos = videoDetails
      .filter((v: any) => {
        const published = new Date(v.snippet?.publishedAt).getTime()
        const ageDays = (now - published) / 86400000
        return ageDays >= 3 // filter < 72h old
      })
      .map((v: any) => {
        const channelId = v.snippet?.channelId
        const stats = v.statistics ?? {}
        const published = new Date(v.snippet?.publishedAt).getTime()
        const ageDays = Math.max(1, (now - published) / 86400000)
        const viewCount = parseInt(stats.viewCount ?? '0')
        const vpd = viewCount / ageDays
        const subCount = channelMap[channelId]?.subCount ?? 1
        const baselineVpd = baselineMap[channelId] ?? vpd
        const outlierMultiple = baselineVpd > 0 ? vpd / baselineVpd : 1
        const viewToSub = viewCount / Math.max(1, subCount)

        // Blend score: 0.6 * normalized outlier_multiple + 0.4 * normalized view_to_sub
        const outlierScore = outlierMultiple * 0.6 + viewToSub * 0.4

        return {
          yt_video_id: v.id,
          yt_channel_id: channelId,
          title: v.snippet?.title ?? '',
          published_at: v.snippet?.publishedAt,
          view_count: viewCount,
          like_count: parseInt(stats.likeCount ?? '0'),
          comment_count: parseInt(stats.commentCount ?? '0'),
          duration_seconds: parseDuration(v.contentDetails?.duration ?? ''),
          thumbnail_url: v.snippet?.thumbnails?.high?.url ?? v.snippet?.thumbnails?.default?.url ?? '',
          channel_sub_count: subCount,
          channel_median_views: channelMap[channelId]?.medianViews ?? 0,
          outlier_score: outlierScore,
          vps: vpd,
          // for filtering
          _outlier_multiple: outlierMultiple,
          _view_to_sub: viewToSub,
          _age_days: ageDays,
        }
      })
      .filter((v: any) => v._outlier_multiple >= 2) // only meaningful outliers
      .sort((a: any, b: any) => b.outlier_score - a.outlier_score)
      .slice(0, 20)

    // Write snapshot
    const { data: snapshot } = await supabase
      .from('snapshots')
      .insert({ user_id: user.id, query, scan_type })
      .select('id')
      .single()

    if (snapshot && scoredVideos.length) {
      const rows = scoredVideos.map(({ _outlier_multiple, _view_to_sub, _age_days, ...v }: any) => ({
        ...v,
        snapshot_id: snapshot.id,
      }))
      await supabase.from('videos').insert(rows)
    }

    const { data: videos } = await supabase
      .from('videos')
      .select('*')
      .eq('snapshot_id', snapshot?.id)
      .order('outlier_score', { ascending: false })

    return json({ snapshot_id: snapshot?.id, outliers: enrichVideos(videos ?? []) })
  } catch (err: any) {
    console.error(err)
    return json({ error: err.message }, 500)
  }
})

// --- helpers ---

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString()
}

async function ytGet(resource: string, params: Record<string, string>) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${resource}`)
  url.searchParams.set('key', YT_KEY)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`YouTube API error: ${res.status} ${await res.text()}`)
  return res.json()
}

async function resolveChannelId(query: string): Promise<string> {
  // Handle @handle or full URL
  const handleMatch = query.match(/@([\w-]+)/)
  const handle = handleMatch ? handleMatch[1] : null
  const urlChannelMatch = query.match(/\/channel\/(UC[\w-]+)/)

  if (urlChannelMatch) return urlChannelMatch[1]

  const searchParam = handle ? `@${handle}` : query
  const res = await ytGet('channels', { part: 'id', forHandle: searchParam.replace('@', '') })
  if (res.items?.[0]?.id) return res.items[0].id

  // Fallback: search for channel
  const searchRes = await ytGet('search', { part: 'id', q: searchParam, type: 'channel', maxResults: '1' })
  return searchRes.items?.[0]?.id?.channelId ?? ''
}

async function getUploadsPlaylist(channelId: string): Promise<string> {
  const res = await ytGet('channels', { part: 'contentDetails', id: channelId })
  return res.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? ''
}

async function getPlaylistItems(playlistId: string, maxResults: number): Promise<any[]> {
  const res = await ytGet('playlistItems', {
    part: 'contentDetails',
    playlistId,
    maxResults: String(maxResults),
  })
  return res.items ?? []
}

async function batchVideos(ids: string[]): Promise<any[]> {
  const results: any[] = []
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50)
    const res = await ytGet('videos', {
      part: 'snippet,statistics,contentDetails',
      id: chunk.join(','),
    })
    results.push(...(res.items ?? []))
  }
  return results
}

async function batchChannels(ids: string[]): Promise<Record<string, { subCount: number; medianViews: number }>> {
  const map: Record<string, { subCount: number; medianViews: number }> = {}
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50)
    const res = await ytGet('channels', { part: 'statistics', id: chunk.join(',') })
    for (const item of res.items ?? []) {
      map[item.id] = {
        subCount: parseInt(item.statistics?.subscriberCount ?? '0'),
        medianViews: parseInt(item.statistics?.viewCount ?? '0') / Math.max(1, parseInt(item.statistics?.videoCount ?? '1')),
      }
    }
  }
  return map
}

async function computeBaselines(channelIds: string[], allVideos: any[]): Promise<Record<string, number>> {
  // Group known videos by channel to estimate baseline vpd (median)
  const byChannel: Record<string, number[]> = {}
  const now = Date.now()
  for (const v of allVideos) {
    const cid = v.snippet?.channelId
    if (!cid) continue
    const published = new Date(v.snippet?.publishedAt).getTime()
    const ageDays = Math.max(1, (now - published) / 86400000)
    const vpd = parseInt(v.statistics?.viewCount ?? '0') / ageDays
    if (!byChannel[cid]) byChannel[cid] = []
    byChannel[cid].push(vpd)
  }

  const baselines: Record<string, number> = {}
  for (const cid of channelIds) {
    const vpds = (byChannel[cid] ?? []).sort((a, b) => a - b)
    if (vpds.length === 0) { baselines[cid] = 1; continue }
    const mid = Math.floor(vpds.length / 2)
    baselines[cid] = vpds.length % 2 === 0 ? (vpds[mid - 1] + vpds[mid]) / 2 : vpds[mid]
  }
  return baselines
}

function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return (parseInt(m[1] ?? '0') * 3600) + (parseInt(m[2] ?? '0') * 60) + parseInt(m[3] ?? '0')
}

function enrichVideos(videos: any[]) {
  const now = Date.now()
  return videos.map(v => {
    const ageDays = Math.max(1, (now - new Date(v.published_at).getTime()) / 86400000)
    const vpd = (v.view_count ?? 0) / ageDays
    const baselineVpd = v.vps ?? vpd
    return {
      ...v,
      age_days: Math.round(ageDays),
      vpd,
      outlier_multiple: baselineVpd > 0 ? vpd / baselineVpd : 1,
      view_to_sub: (v.view_count ?? 0) / Math.max(1, v.channel_sub_count ?? 1),
    }
  })
}

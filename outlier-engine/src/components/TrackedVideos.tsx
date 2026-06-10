import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { TrendingUp, Minus } from 'lucide-react'

interface TrackedVideo {
  id: string
  yt_video_id: string
  created_at: string
  latest_views: number | null
  diagnosis: string | null
}

export default function TrackedVideos({ userId }: { userId: string }) {
  const [videos, setVideos] = useState<TrackedVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tracked_videos')
        .select(`
          id, yt_video_id, created_at,
          tracking_history(view_count, checked_at)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (data) {
        setVideos(data.map((v: any) => {
          const history = (v.tracking_history ?? []).sort(
            (a: any, b: any) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime()
          )
          return {
            id: v.id,
            yt_video_id: v.yt_video_id,
            created_at: v.created_at,
            latest_views: history[0]?.view_count ?? null,
            diagnosis: null,
          }
        }))
      }
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) return <div className="text-gray-400 text-sm">Loading…</div>

  if (!videos.length) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center space-y-2">
        <p className="font-medium">No tracked videos yet</p>
        <p className="text-gray-400 text-sm">
          After you publish a video inspired by an outlier, click "Track my version" on the analysis.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Tracked Videos</h2>
      <div className="space-y-3">
        {videos.map(v => (
          <div key={v.id} className="rounded-xl border border-gray-800 bg-gray-900 p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <a
                href={`https://youtube.com/watch?v=${v.yt_video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-400 hover:underline font-medium"
              >
                {v.yt_video_id}
              </a>
              <p className="text-xs text-gray-500 mt-0.5">
                Tracking since {new Date(v.created_at).toLocaleDateString()}
              </p>
            </div>
            {v.latest_views !== null ? (
              <div className="text-right">
                <p className="font-medium">{v.latest_views.toLocaleString()} views</p>
                <div className="flex items-center justify-end gap-1 text-xs text-gray-400">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span>Tracking</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Minus className="w-3 h-3" />
                Awaiting first check
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

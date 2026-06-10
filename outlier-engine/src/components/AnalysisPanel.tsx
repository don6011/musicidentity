import type { OutlierVideo, Analysis } from '../types'
import { useState } from 'react'
import { Lightbulb, Image, BookOpen, Plus, Check } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  video: OutlierVideo | null
  analysis: Analysis | null
  loading: boolean
  onTrack: (ytVideoId: string, analysisId: string) => void
}

type Tab = 'teardown' | 'titles' | 'thumbnails' | 'hook'

export default function AnalysisPanel({ video, analysis, loading, onTrack }: Props) {
  const [tab, setTab] = useState<Tab>('teardown')
  const [tracked, setTracked] = useState(false)

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'teardown', label: 'Why it won', icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { key: 'titles', label: 'Titles', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: 'thumbnails', label: 'Thumbnails', icon: <Image className="w-3.5 h-3.5" /> },
    { key: 'hook', label: 'Hook', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ]

  const handleTrack = () => {
    if (!video || !analysis) return
    onTrack(video.yt_video_id, analysis.id)
    setTracked(true)
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 flex flex-col">
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Claude is analyzing…</p>
        </div>
      )}

      {!loading && analysis && video && (
        <>
          <div className="p-4 border-b border-gray-800 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium line-clamp-2">{video.title}</p>
            </div>
            <button
              onClick={handleTrack}
              disabled={tracked}
              className={clsx(
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                tracked
                  ? 'bg-green-900/50 text-green-400 border border-green-800'
                  : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
              )}
            >
              {tracked ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {tracked ? 'Tracking' : 'Track my version'}
            </button>
          </div>

          <div className="flex gap-1 p-3 border-b border-gray-800">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors',
                  tab === t.key ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 flex-1 overflow-y-auto max-h-[520px]">
            {tab === 'teardown' && (
              <div className="space-y-4">
                <TeardownField label="Core reason" value={analysis.why_it_won.core_reason} highlight />
                <TeardownField label="Topic angle" value={analysis.why_it_won.topic_angle} />
                <TeardownField label="Packaging read" value={analysis.why_it_won.packaging_read} />
                <TeardownField label="Timing / trend" value={analysis.why_it_won.timing_or_trend} />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Replicability</span>
                  <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', {
                    'bg-green-900/50 text-green-400': analysis.why_it_won.replicability === 'high',
                    'bg-yellow-900/50 text-yellow-400': analysis.why_it_won.replicability === 'medium',
                    'bg-red-900/50 text-red-400': analysis.why_it_won.replicability === 'low',
                  })}>
                    {analysis.why_it_won.replicability}
                  </span>
                </div>
                <TeardownField label="What to steal" value={analysis.why_it_won.what_to_steal} highlight />
              </div>
            )}

            {tab === 'titles' && (
              <ol className="space-y-2">
                {analysis.title_concepts.map((title, i) => (
                  <li key={i} className="flex gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                    <span className="text-brand-500 font-bold text-sm flex-shrink-0">{i + 1}</span>
                    <span className="text-sm">{title}</span>
                  </li>
                ))}
              </ol>
            )}

            {tab === 'thumbnails' && (
              <div className="space-y-3">
                {analysis.thumbnail_concepts.map((thumb, i) => (
                  <div key={i} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-500 font-bold text-sm">{i + 1}</span>
                      <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
                        "{thumb.text_overlay}"
                      </span>
                    </div>
                    <p className="text-sm"><span className="text-gray-400">Composition:</span> {thumb.composition}</p>
                    <p className="text-sm"><span className="text-gray-400">Focal:</span> {thumb.focal}</p>
                    <p className="text-sm"><span className="text-gray-400">Color:</span> {thumb.color_strategy}</p>
                    <p className="text-xs text-gray-400 italic">{thumb.why}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'hook' && (
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {analysis.hook_skeleton}
              </pre>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function TeardownField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={clsx('text-sm leading-relaxed', highlight ? 'text-white' : 'text-gray-300')}>{value}</p>
    </div>
  )
}

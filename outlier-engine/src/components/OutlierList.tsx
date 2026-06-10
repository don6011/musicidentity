import type { OutlierVideo } from '../types'
import clsx from 'clsx'
import { TrendingUp, Users } from 'lucide-react'

interface Props {
  outliers: OutlierVideo[]
  selectedId?: string
  onSelect: (v: OutlierVideo) => void
}

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function ScoreBadge({ multiple }: { multiple: number }) {
  const color = multiple >= 10 ? 'text-green-400 bg-green-400/10' :
    multiple >= 5 ? 'text-yellow-400 bg-yellow-400/10' : 'text-orange-400 bg-orange-400/10'
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', color)}>
      <TrendingUp className="w-3 h-3" />
      {multiple.toFixed(1)}x
    </span>
  )
}

export default function OutlierList({ outliers, selectedId, onSelect }: Props) {
  if (!outliers.length) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
        No outliers found. Try a different keyword.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Outliers <span className="text-gray-400 font-normal text-sm">({outliers.length})</span></h2>
        <span className="text-xs text-gray-500">Ranked by outlier score</span>
      </div>
      <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
        {outliers.map(v => (
          <button
            key={v.id}
            onClick={() => onSelect(v)}
            className={clsx(
              'w-full text-left rounded-xl border p-3 transition-all flex gap-3',
              selectedId === v.id
                ? 'border-brand-500 bg-brand-500/5'
                : 'border-gray-800 bg-gray-900 hover:border-gray-600'
            )}
          >
            {v.thumbnail_url && (
              <img
                src={v.thumbnail_url}
                alt={v.title ?? ''}
                className="w-28 h-16 rounded-md object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-sm font-medium line-clamp-2 leading-snug">{v.title}</p>
              <div className="flex flex-wrap gap-2">
                <ScoreBadge multiple={v.outlier_multiple} />
                {v.view_to_sub >= 5 && v.channel_sub_count < 50_000 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-purple-400 bg-purple-400/10">
                    <Users className="w-3 h-3" />
                    Breakout
                  </span>
                )}
              </div>
              <div className="flex gap-3 text-xs text-gray-400">
                <span>{formatNum(v.view_count)} views</span>
                <span>{v.age_days}d old</span>
                <span>{formatNum(v.channel_sub_count)} subs</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

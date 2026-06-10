import { useState } from 'react'
import { Search, Youtube } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  onScan: (query: string, scanType: 'niche' | 'channel') => void
  scanning: boolean
}

export default function ScanForm({ onScan, scanning }: Props) {
  const [query, setQuery] = useState('')
  const [scanType, setScanType] = useState<'niche' | 'channel'>('niche')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) onScan(query.trim(), scanType)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Find Outliers</h1>
        <p className="text-gray-400 text-sm mt-1">
          Enter a niche keyword or competitor channel URL to surface what the algorithm is pushing right now.
        </p>
      </div>

      <div className="flex gap-2">
        {(['niche', 'channel'] as const).map(t => (
          <button
            key={t}
            onClick={() => setScanType(t)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors',
              scanType === t
                ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                : 'border-gray-700 text-gray-400 hover:border-gray-500'
            )}
          >
            {t === 'niche' ? <Search className="w-3.5 h-3.5" /> : <Youtube className="w-3.5 h-3.5" />}
            {t === 'niche' ? 'Niche keyword' : 'Channel URL'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={scanType === 'niche' ? 'e.g. "budget travel Europe"' : 'e.g. https://youtube.com/@mkbhd'}
          className="flex-1 rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors"
        />
        <button
          type="submit"
          disabled={scanning || !query.trim()}
          className="rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 px-5 py-2.5 text-sm font-medium transition-colors flex items-center gap-2"
        >
          {scanning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Scan
            </>
          )}
        </button>
      </form>
    </div>
  )
}

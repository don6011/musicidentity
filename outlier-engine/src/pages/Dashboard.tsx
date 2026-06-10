import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import ScanForm from '../components/ScanForm'
import OutlierList from '../components/OutlierList'
import AnalysisPanel from '../components/AnalysisPanel'
import TrackedVideos from '../components/TrackedVideos'
import type { OutlierVideo, Analysis, ScanResult } from '../types'
import { Zap, LogOut, BarChart2 } from 'lucide-react'

type View = 'scan' | 'tracked'

export default function Dashboard({ session }: { session: Session }) {
  const [view, setView] = useState<View>('scan')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<OutlierVideo | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [scanning, setScanning] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const handleScan = async (query: string, scanType: 'niche' | 'channel') => {
    setScanning(true)
    setError('')
    setScanResult(null)
    setSelectedVideo(null)
    setAnalysis(null)

    const { data, error } = await supabase.functions.invoke('niche-scan', {
      body: { query, scan_type: scanType },
    })

    if (error) {
      setError(error.message)
    } else {
      setScanResult(data as ScanResult)
    }
    setScanning(false)
  }

  const handleSelectVideo = async (video: OutlierVideo) => {
    setSelectedVideo(video)
    setAnalysis(null)
    setAnalyzing(true)
    setError('')

    const { data, error } = await supabase.functions.invoke('analyze', {
      body: { video_id: video.id, user_context: '' },
    })

    if (error) {
      setError(error.message)
    } else {
      setAnalysis(data as Analysis)
    }
    setAnalyzing(false)
  }

  const handleTrack = async (ytVideoId: string, analysisId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('tracked_videos') as any).insert({
      user_id: session.user.id,
      yt_video_id: ytVideoId,
      source_analysis_id: analysisId,
    })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-500" />
              <span className="font-bold tracking-tight">Outlier Engine</span>
            </div>
            <nav className="flex gap-1">
              <button
                onClick={() => setView('scan')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'scan' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Scan
              </button>
              <button
                onClick={() => setView('tracked')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'tracked' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Tracking
              </button>
            </nav>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'scan' && (
          <div className="space-y-8">
            <ScanForm onScan={handleScan} scanning={scanning} />

            {error && (
              <div className="rounded-lg bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {scanResult && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OutlierList
                  outliers={scanResult.outliers}
                  selectedId={selectedVideo?.id}
                  onSelect={handleSelectVideo}
                />
                {(selectedVideo || analyzing) && (
                  <AnalysisPanel
                    video={selectedVideo}
                    analysis={analysis}
                    loading={analyzing}
                    onTrack={handleTrack}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {view === 'tracked' && (
          <TrackedVideos userId={session.user.id} />
        )}
      </main>
    </div>
  )
}

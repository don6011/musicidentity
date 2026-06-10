export interface OutlierVideo {
  id: string
  yt_video_id: string
  yt_channel_id: string
  title: string
  published_at: string
  view_count: number
  like_count: number
  comment_count: number
  duration_seconds: number
  thumbnail_url: string
  channel_sub_count: number
  channel_median_views: number
  outlier_score: number
  vps: number
  // derived
  age_days: number
  vpd: number
  outlier_multiple: number
  view_to_sub: number
}

export interface WhyItWon {
  core_reason: string
  topic_angle: string
  packaging_read: string
  timing_or_trend: string
  replicability: 'high' | 'medium' | 'low'
  what_to_steal: string
}

export interface ThumbnailConcept {
  composition: string
  focal: string
  text_overlay: string
  color_strategy: string
  why: string
}

export interface Analysis {
  id: string
  video_id: string
  why_it_won: WhyItWon
  title_concepts: string[]
  thumbnail_concepts: ThumbnailConcept[]
  hook_skeleton: string
  created_at: string
}

export interface ScanResult {
  snapshot_id: string
  outliers: OutlierVideo[]
}

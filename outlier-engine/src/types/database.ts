export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      snapshots: {
        Row: {
          id: string
          user_id: string
          query: string
          scan_type: 'niche' | 'channel'
          fetched_at: string
          ttl_hours: number
        }
        Insert: Omit<Database['public']['Tables']['snapshots']['Row'], 'id' | 'fetched_at'>
        Update: Partial<Database['public']['Tables']['snapshots']['Insert']>
      }
      videos: {
        Row: {
          id: string
          snapshot_id: string
          yt_video_id: string
          yt_channel_id: string
          title: string | null
          published_at: string | null
          view_count: number | null
          like_count: number | null
          comment_count: number | null
          duration_seconds: number | null
          thumbnail_url: string | null
          channel_sub_count: number | null
          channel_median_views: number | null
          outlier_score: number | null
          vps: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['videos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['videos']['Insert']>
      }
      analyses: {
        Row: {
          id: string
          user_id: string
          video_id: string | null
          why_it_won: Json | null
          title_concepts: Json | null
          thumbnail_concepts: Json | null
          hook_skeleton: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['analyses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['analyses']['Insert']>
      }
      tracked_videos: {
        Row: {
          id: string
          user_id: string
          yt_video_id: string
          source_analysis_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tracked_videos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tracked_videos']['Insert']>
      }
      tracking_history: {
        Row: {
          id: string
          tracked_video_id: string
          checked_at: string
          view_count: number | null
          like_count: number | null
          comment_count: number | null
        }
        Insert: Omit<Database['public']['Tables']['tracking_history']['Row'], 'id' | 'checked_at'>
        Update: Partial<Database['public']['Tables']['tracking_history']['Insert']>
      }
    }
  }
}

export type PostCategory = 'business_insight' | 'leadership' | 'personal';
export type PostStatus = 'suggested' | 'saved' | 'scheduled' | 'published' | 'rejected' | 'failed';
export type ReplyStatus = 'pending' | 'approved' | 'posted' | 'skipped';
export type TargetTag = 'investor' | 'partner' | 'acquirer' | 'peer' | 'other';
export type RelationshipStatus = 'cold' | 'warming' | 'active';
export type VoiceAction = 'approved' | 'edited' | 'rejected';

export interface ClientProfile {
  id: string;
  name: string;
  linkedin_user_id: string | null;
  oauth_token_vault_id: string | null;
  bio: string | null;
  company: string;
  role: string;
  interests: string[];
  topic_mix: { business: number; leadership: number; personal: number };
  tone_preferences: string[];
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  client_id: string;
  content: string;
  category: PostCategory;
  status: PostStatus;
  source_context: string | null;
  source_url: string | null;
  media_urls: string[];
  scheduled_time: string | null;
  published_time: string | null;
  linkedin_post_id: string | null;
  ai_model_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostMetrics {
  id: string;
  post_id: string;
  impressions: number;
  likes: number;
  comments_count: number;
  shares: number;
  engagement_rate: number;
  fetched_at: string;
}

export interface Target {
  id: string;
  client_id: string;
  name: string;
  linkedin_url: string | null;
  company: string | null;
  tag: TargetTag;
  relationship_status: RelationshipStatus;
  last_engaged_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoiceSignal {
  id: string;
  client_id: string;
  post_id: string;
  action: VoiceAction;
  original_draft: string;
  edited_version: string | null;
  time_spent_ms: number | null;
  created_at: string;
}

export interface ContentSource {
  id: string;
  client_id: string;
  name: string;
  type: 'rss' | 'api' | 'manual';
  url: string;
  category: string | null;
  active: boolean;
  last_fetched_at: string | null;
  fetch_status: 'ok' | 'failing' | 'disabled';
}

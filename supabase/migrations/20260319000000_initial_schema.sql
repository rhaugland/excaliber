-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Enum types
create type post_category as enum ('business_insight', 'leadership', 'personal');
create type post_status as enum ('suggested', 'saved', 'scheduled', 'published', 'rejected', 'failed');
create type reply_status as enum ('pending', 'approved', 'posted', 'skipped');
create type target_tag as enum ('investor', 'partner', 'acquirer', 'peer', 'other');
create type relationship_status as enum ('cold', 'warming', 'active');
create type voice_action as enum ('approved', 'edited', 'rejected');
create type source_type as enum ('rss', 'api', 'manual');
create type fetch_status as enum ('ok', 'failing', 'disabled');

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- client_profile
create table client_profile (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  linkedin_user_id text unique,
  oauth_token_vault_id text,
  bio text,
  company text default 'Ottera TV',
  role text default 'CEO & Founder',
  interests text[] default '{}',
  topic_mix jsonb default '{"business": 70, "leadership": 20, "personal": 10}',
  tone_preferences text[] default '{}',
  onboarded_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger client_profile_updated_at
  before update on client_profile
  for each row execute function update_updated_at();

-- posts
create table posts (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references client_profile(id) on delete cascade,
  content text not null,
  category post_category not null,
  status post_status not null default 'suggested',
  source_context text,
  source_url text,
  media_urls text[] default '{}',
  scheduled_time timestamptz,
  published_time timestamptz,
  linkedin_post_id text,
  ai_model_version text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_posts_client_status on posts(client_id, status);
create index idx_posts_scheduled on posts(scheduled_time) where status = 'scheduled';

create trigger posts_updated_at
  before update on posts
  for each row execute function update_updated_at();

-- post_metrics
create table post_metrics (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references posts(id) on delete cascade unique,
  impressions int default 0,
  likes int default 0,
  comments_count int default 0,
  shares int default 0,
  engagement_rate float default 0,
  fetched_at timestamptz default now()
);

-- comments (Phase 2 but schema ready)
create table comments (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references client_profile(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  linkedin_comment_id text,
  author_name text not null,
  author_linkedin_url text,
  content text not null,
  ai_draft_reply text,
  final_reply text,
  reply_status reply_status not null default 'pending',
  replied_at timestamptz,
  is_target_contact boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger comments_updated_at
  before update on comments
  for each row execute function update_updated_at();

-- targets
create table targets (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references client_profile(id) on delete cascade,
  name text not null,
  linkedin_url text,
  company text,
  tag target_tag not null default 'other',
  relationship_status relationship_status not null default 'cold',
  last_engaged_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger targets_updated_at
  before update on targets
  for each row execute function update_updated_at();

-- target_activity (Phase 2 but schema ready)
create table target_activity (
  id uuid primary key default uuid_generate_v4(),
  target_id uuid not null references targets(id) on delete cascade,
  linkedin_post_url text,
  content_preview text,
  posted_at timestamptz,
  engaged boolean default false,
  engagement_type text,
  engaged_at timestamptz
);

-- voice_signals
create table voice_signals (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references client_profile(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  action voice_action not null,
  original_draft text not null,
  edited_version text,
  time_spent_ms int,
  created_at timestamptz default now()
);

create index idx_voice_signals_client on voice_signals(client_id, created_at desc);

-- content_sources
create table content_sources (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references client_profile(id) on delete cascade,
  name text not null,
  type source_type not null default 'rss',
  url text not null,
  category text,
  active boolean default true,
  last_fetched_at timestamptz,
  fetch_status fetch_status default 'ok',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger content_sources_updated_at
  before update on content_sources
  for each row execute function update_updated_at();

-- RLS policies (permissive for single-client, scoped by client_id)
alter table client_profile enable row level security;
alter table posts enable row level security;
alter table post_metrics enable row level security;
alter table comments enable row level security;
alter table targets enable row level security;
alter table target_activity enable row level security;
alter table voice_signals enable row level security;
alter table content_sources enable row level security;

-- Allow all operations for authenticated users (single client app)
create policy "Allow all for authenticated" on client_profile for all using (true);
create policy "Allow all for authenticated" on posts for all using (true);
create policy "Allow all for authenticated" on post_metrics for all using (true);
create policy "Allow all for authenticated" on comments for all using (true);
create policy "Allow all for authenticated" on targets for all using (true);
create policy "Allow all for authenticated" on target_activity for all using (true);
create policy "Allow all for authenticated" on voice_signals for all using (true);
create policy "Allow all for authenticated" on content_sources for all using (true);

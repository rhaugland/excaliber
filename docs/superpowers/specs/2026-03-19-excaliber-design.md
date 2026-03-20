# Excaliber — LinkedIn Content Engine for Ottera TV

**Date:** 2026-03-19
**Client:** CEO of Ottera TV (https://www.ottera.tv)
**Repository:** https://github.com/rhaugland/excaliber.git

---

## 1. Overview

Excaliber is a mobile-first PWA that generates LinkedIn posts in the client's voice, lets him swipe through suggestions and schedule them with one tap, manages comment replies, tracks target relationships, and shows post performance analytics. Built for a single client — the CEO of Ottera TV, a white-label OTT platform company specializing in FAST channels, ad monetization (AdNet+), content distribution (StreamBridge), and OEM partnerships.

The goal: he opens the app, swipes through AI-generated posts tailored to his world, drops them on a calendar, and LinkedIn does the rest. "Holy shit, this is super easy."

---

## 2. Architecture

Four core modules:

### 2.1 Content Engine
AI generates posts based on the client's profile, topic mix, and current industry news. Runs as a daily batch (overnight/early morning) producing 4-5 post suggestions.

**Pipeline:**
1. **Source scan** — Pulls latest from RSS feeds and news APIs filtered by industry keywords (streaming, OTT, advertising, capital markets, acquisitions, OEM distribution)
2. **Topic selection** — AI picks topics weighted to his configured mix (default 70/20/10)
3. **Draft generation** — Claude generates each post using topic + source material, client profile, and voice signals (past edits/approvals as few-shot examples)
4. **Queue delivery** — Posts land in his swipe feed by morning

**News sources monitored (RSS-parseable, no paid API required):**
- Streaming: Variety, Deadline, StreamTV Insider, Fierce Video, Next TV
- Advertising: AdExchanger, Digiday, AdAge
- M&A/Capital: TechCrunch, Crunchbase News

**Note:** Bloomberg and WSJ are paywalled and not available via RSS or free news APIs. Dropped from source list. If paid data feeds are budgeted later, they can be added to `content_sources`.

### 2.2 Voice Model
Learns the client's writing style through a feedback loop — no upfront training required.

**Signals:**
- Approval = "this sounds like me"
- Edit = strongest signal (diff between AI draft and client's edited version)
- Rejection = "not my style"

Stored as `voice_signals` records. Used as few-shot examples in Claude prompts. After ~20-30 interactions, the voice model gets noticeably sharper.

### 2.3 LinkedIn Integration
OAuth 2.0 connection to his LinkedIn account.

**OAuth Scopes (current as of 2026):**
- `openid` + `profile` + `email` — Authentication and profile data (via `/v2/userinfo` endpoint). Legacy `r_liteprofile` is deprecated.
- `w_member_social` — Publishing posts on his behalf (still valid).
- Community Management API access — Required for comments, reactions, and engagement metrics. **Requires separate application approval through developer.linkedin.com** (Development tier → Standard tier). This is a gating prerequisite for Phase 2.

**API Versioning:** All LinkedIn API calls require the `Linkedin-Version: YYYYMM` header (legacy unversioned `/v2/` endpoints are sunset). Pin to a recent version (e.g., `202602`) and update quarterly.

**Capabilities:**
- Publish posts via LinkedIn Posts API (Phase 1)
- Fetch comments on his posts via Community Management API (Phase 2 — requires approval)
- Pull engagement metrics via Social Metadata API (Phase 2)
- Monitor target contacts' public activity (Phase 2 — see limitations)

**Limitations:**
- No real-time webhooks — polling is the standard approach
- Cannot comment on others' posts via API — "Engage now" opens LinkedIn directly
- Replying to comments via API requires Community Management API approval. **Phase 2 fallback:** if approval is pending, deep-link to LinkedIn for reply posting (same pattern as "Engage now")
- Target activity monitoring: LinkedIn does not offer webhooks for member posts. Polling each target's public feed consumes API quota. For 20-50 targets, poll once or twice daily (not every 15-30 min) to stay within rate limits. Consider this a Phase 2 feature with explicit API budget allocation.
- Rate limits vary by endpoint and tier. Implement a simple quota tracker to prevent hitting limits during high-activity periods.

**Token Storage:** OAuth tokens stored using Supabase Vault (built-in secrets manager). Not stored as plaintext JSONB. Tokens auto-refreshed; if refresh fails, prompt re-auth on next app open.

**LinkedIn account recommendation:** LinkedIn Premium Business for profile visibility and InMail. Sales Navigator and Recruiter tiers are unnecessary for a content-first strategy.

**Prerequisite timeline:** Apply for Community Management API access during Phase 1 development so approval is in place before Phase 2 begins. Development tier access is typically granted quickly; Standard tier may take longer.

### 2.4 Relationship Tracker
A target list of companies and people the client wants to build relationships with.

**Features:**
- Alerts when target contacts post new content
- Tracks relationship warmth: Cold → Warming → Active
- Prioritizes target contacts' comments in the Reply Queue
- One-tap "Engage now" opens their LinkedIn post for direct commenting
- Engagement history log per contact

---

## 3. Mobile UX — Five Screens

Bottom tab bar navigation. Dark theme, mobile-first.

### 3.1 Post Feed (Home)
Tinder-style swipe through AI-generated posts. Each card shows:
- Post content preview
- Content category badge (Business Insight, Leadership, Personal)
- Source context (what news/trend inspired it)

**Four actions:**
- **Skip (✕)** — Swipe left or tap. Rejection signal for voice model.
- **Edit (✏️)** — Opens inline editor. Strongest voice signal.
- **Save (🔖)** — Saves to drafts for later.
- **Post (✓)** — Swipe right or tap. Opens calendar slot picker with AI-recommended time.

### 3.2 Calendar
Visual weekly/monthly view.
- AI recommends optimal time slots (highlighted)
- When approving a post, system suggests best available slot
- Client can drag posts to reschedule
- Shows scheduled (confirmed) vs. recommended (suggested) posts
- Color-coded by content category

**Scheduling intelligence:**
- Phase 1: Hardcoded best practices (Tue/Wed/Thu, 8-10am ET)
- Phase 3: Adaptive scheduling kicks in once analytics data is available — learns from actual engagement and adjusts recommended times
- Maintains 2-3 posts per week cadence

### 3.3 Reply Queue
Incoming comments with AI-drafted replies.
- Target contacts get a gold badge and float to top
- Each comment shows: author, their comment, AI draft reply
- Same swipe UX: approve reply, edit reply, skip
- Replies post to LinkedIn via Community Management API (requires approval — fallback: deep-link to LinkedIn)

### 3.4 Relationship Radar
Target companies and people dashboard.
- Cards grouped by company
- Real-time alerts when targets post
- Relationship status indicator (Cold/Warming/Active)
- "Engage now" button deep-links to their LinkedIn post
- Engagement history timeline per contact

### 3.5 Analytics
Post performance dashboard.
- Top-line metrics: impressions, engagement rate, follower growth
- Top-performing posts ranked by views/engagement
- Performance by content category (which of 70/20/10 performs best)
- Best posting times (learned from data)
- Week-over-week trends
- Data feeds back into Content Engine to improve future suggestions

---

## 4. Data Model

### `client_profile`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| name | text | Client name |
| linkedin_user_id | text | LinkedIn profile ID |
| oauth_token_vault_id | text | Reference to Supabase Vault secret (tokens NOT stored as plaintext JSONB) |
| bio | text | Professional bio |
| company | text | "Ottera TV" |
| role | text | "CEO & Founder" |
| interests | text[] | Industry keywords |
| topic_mix | jsonb | `{business: 70, leadership: 20, personal: 10}` |
| tone_preferences | text[] | e.g., professional, conversational, bold |
| onboarded_at | timestamptz | Onboarding completion time |
| updated_at | timestamptz | Auto-managed via Postgres trigger |

**Note:** All mutable tables include `updated_at` (timestamptz) auto-managed via a Postgres trigger. All tables except `client_profile` include a `client_id` (uuid FK to client_profile) for future-proofing.

### `posts`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| client_id | uuid | FK to client_profile |
| content | text | Post body text |
| category | enum | business_insight, leadership, personal |
| status | enum | suggested, saved, scheduled, published, rejected |
| source_context | text | News/trend that inspired the post |
| source_url | text | Link to source article |
| media_urls | text[] | Optional image/media URLs for the post |
| scheduled_time | timestamptz | When to publish |
| published_time | timestamptz | When actually published |
| linkedin_post_id | text | LinkedIn's post ID after publishing |
| ai_model_version | text | Claude model used |
| created_at | timestamptz | When AI generated it |
| updated_at | timestamptz | Auto-managed |

### `post_metrics`
Upsert strategy: one row per post, updated in place on each poll. Historical snapshots not needed — we only care about current totals.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| post_id | uuid | FK to posts (unique constraint) |
| impressions | int | View count |
| likes | int | Like count |
| comments_count | int | Comment count |
| shares | int | Share count |
| engagement_rate | float | Calculated engagement % |
| fetched_at | timestamptz | When metrics were last polled |

### `comments`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| client_id | uuid | FK to client_profile |
| post_id | uuid | FK to posts |
| linkedin_comment_id | text | LinkedIn's comment ID |
| author_name | text | Commenter's name |
| author_linkedin_url | text | Commenter's profile |
| content | text | Comment text |
| ai_draft_reply | text | AI-generated reply |
| final_reply | text | Actual reply posted (after client edits) |
| reply_status | enum | pending, approved, posted, skipped |
| replied_at | timestamptz | When reply was sent |
| is_target_contact | boolean | Whether author is in target list |
| created_at | timestamptz | When comment was made |
| updated_at | timestamptz | Auto-managed |

### `targets`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| client_id | uuid | FK to client_profile |
| name | text | Person or company name |
| linkedin_url | text | LinkedIn profile/company URL |
| company | text | Company name |
| tag | enum | investor, partner, acquirer, peer, other |
| relationship_status | enum | cold, warming, active |
| last_engaged_at | timestamptz | Last interaction timestamp |
| notes | text | Free-form notes |
| created_at | timestamptz | When added |
| updated_at | timestamptz | Auto-managed |

### `target_activity`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| target_id | uuid | FK to targets |
| linkedin_post_url | text | URL to their post |
| content_preview | text | First ~200 chars of their post |
| posted_at | timestamptz | When they posted |
| engaged | boolean | Whether client engaged |
| engagement_type | text | liked, commented, shared |
| engaged_at | timestamptz | When client engaged |

### `voice_signals`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| client_id | uuid | FK to client_profile |
| post_id | uuid | FK to posts |
| action | enum | approved, edited, rejected |
| original_draft | text | AI's original text |
| edited_version | text | Client's edited text (null if not edited) |
| time_spent_ms | int | Time client spent on card (for weighting signal strength) |
| created_at | timestamptz | When action was taken |

### `content_sources`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| client_id | uuid | FK to client_profile |
| name | text | Source name (e.g., "Variety") |
| type | enum | rss, api, manual |
| url | text | Feed URL or API endpoint |
| category | text | Which topic area it serves |
| active | boolean | Whether to poll this source |
| last_fetched_at | timestamptz | When source was last successfully polled |
| fetch_status | enum | ok, failing, disabled |

### Row-Level Security (RLS)
All tables use Supabase RLS policies scoped to `client_id`. Single-client now, but policies ensure data isolation if a second profile is ever added.

---

## 5. Ottera-Specific Content Framework

### Business Insights (70%)
| Topic | Example Angle |
|---|---|
| OTT/Streaming trends | "FAST channels grew 40% this year. Here's what most operators are missing..." |
| Programmatic vs. direct ads | "We built AdNet+ because programmatic alone leaves money on the table..." |
| OEM distribution moats | "Getting pre-installed on Roku, Samsung, LG isn't luck. It's a strategy..." |
| Acquisition multiple arbitrage | "When you buy a content library at 3x and distribute at 8x, the math speaks..." |
| Capital raising journey | "We just closed our seed round. Here's what I wish someone told me..." |
| StreamBridge strategy | "Why we built StreamBridge — content owners shouldn't need 6 vendors to reach every device..." |
| StreamInsights/analytics | "Data without action is just noise. Here's how we think about viewer analytics..." |

### Leadership (20%)
| Topic | Example Angle |
|---|---|
| Building a global team | "14 years, 4 continents, one mission. Leading a distributed team taught me..." |
| Conviction in hard markets | "Everyone said streaming was too crowded. We saw something different..." |
| Hiring & culture | "The best hire I ever made wasn't the most experienced person in the room..." |
| Founder lessons | "Hired, raised a seed round, and the journey to Series A begins. Here's what I've learned..." |

### Personal (10%)
| Topic | Example Angle |
|---|---|
| Faith & long-term vision | "Sunday reminder: the companies that endure are built on something deeper than metrics..." |
| Family + founder life | "My daughter asked what I do at work. Explaining OTT to a 7-year-old humbles you fast..." |
| Meaningful quotes + reflection | "A quote I keep coming back to..." |

### Post Length Guidelines
- **Standard posts:** 150-250 words (LinkedIn algorithm sweet spot)
- **Punchy takes:** 50-80 words (quick engagement drivers)
- **Long-form (occasional):** 400-600 words (deep dives, milestone posts)

### Target List Seed Categories
- OTT/streaming competitors and partners
- Ad tech companies (programmatic, CTV advertising)
- Investors in media/streaming space
- OEM partners (Roku, Samsung, LG, Vizio leadership)
- Content owners and licensors

---

## 6. Onboarding Flow

Three steps, under 5 minutes:

**Step 1: Connect LinkedIn**
- OAuth button, one tap
- Auto-pulls profile photo, headline, bio

**Step 2: Tell us about you**
- Pre-filled for Ottera: industry = streaming/OTT, role = CEO
- Topics (checkboxes + free text)
- Content mix slider (defaults to 70/20/10)
- Tone preference (multi-select: professional, conversational, bold, inspirational)

**Step 3: Set your targets**
- Add companies and people via LinkedIn URL or name search
- Tag each: investor, partner, acquirer, peer
- Minimum 5 recommended to activate Relationship Radar

**First experience:** 5 suggested posts waiting immediately. Banner: "The more you swipe and edit, the better I learn your voice."

---

## 7. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 + PWA (next-pwa) | Mobile-first swipe UI, installable |
| Styling | Tailwind CSS | Responsive mobile design |
| Database | Supabase (Postgres) | Data, auth, real-time subscriptions |
| Auth | Supabase Auth + LinkedIn OAuth 2.0 | Client login + LinkedIn API access |
| AI | Claude API (Anthropic) | Post generation, voice learning, reply drafts |
| Scheduling | Supabase Cron + Edge Functions | Timed publishing, metric polling |
| News Ingestion | Edge Functions + NewsAPI / RSS | Daily content source scanning |
| LinkedIn API | Edge Functions | Publish, fetch comments/metrics |
| Hosting | Vercel | Next.js deployment |
| SMS (Phase 2) | Twilio | Future iMessage/SMS channel |

---

## 8. Build Phases

### Phase 1 — Core MVP
- Onboarding flow (profile, LinkedIn OAuth, topics, targets)
- Content Engine (AI post generation with news sources)
- Swipe feed (approve/edit/save/reject)
- Calendar with AI-recommended times
- Auto-publish to LinkedIn
- PWA setup (installable, offline-capable shell)
- **PWA offline scope:** View cached post queue, read/edit drafts. Publishing, comments, and analytics require connectivity.
- Apply for LinkedIn Community Management API access (needed for Phase 2)

### Phase 2 — Engagement
- Comment polling + Reply Queue with AI draft replies (requires Community Management API approval — fallback: deep-link to LinkedIn for replies)
- Relationship Radar (target monitoring + alerts, polled 1-2x daily to manage API quota)
- Voice model refinement (feedback loop active after Phase 1 data)

### Phase 3 — Intelligence
- Analytics dashboard (post performance, engagement trends, follower growth)
- Schedule optimization (learn from actual engagement data)
- Content mix auto-tuning based on performance

### Phase 4 — SMS Channel
- Twilio integration
- Daily text with top post suggestion
- Reply "1" to post, "2" to skip, "3" to edit (opens PWA)

---

## 9. Error Handling

- **LinkedIn API failure:** Retry 3x with exponential backoff. If still failing, mark post as "failed" and alert client in-app.
- **OAuth token expiry:** Auto-refresh. If refresh fails, prompt re-auth on next app open.
- **News source unavailable:** Skip that source for the day. Log warning. Continue with other sources.
- **AI generation failure:** Fall back to previously saved/drafted posts. Alert if queue runs empty.
- **Polling failures:** Log and retry next cycle. Don't surface transient errors to client.

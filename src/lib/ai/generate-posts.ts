import Anthropic from '@anthropic-ai/sdk';
import { buildVoicePrompt } from './voice-model';
import type { Article } from '../rss/scanner';
import type { ClientProfile, PostCategory } from '../supabase/types';

const anthropic = new Anthropic();

interface GeneratedPost {
  content: string;
  category: PostCategory;
  sourceContext: string;
  sourceUrl: string;
}

const CATEGORY_MAP: Record<string, PostCategory> = {
  business: 'business_insight',
  leadership: 'leadership',
  personal: 'personal',
};

export async function generatePosts(
  profile: ClientProfile,
  articles: Article[],
  voiceSignals: Array<{
    action: 'approved' | 'edited' | 'rejected';
    original_draft: string;
    edited_version: string | null;
    time_spent_ms: number | null;
  }>,
  count: number = 5
): Promise<GeneratedPost[]> {
  const voicePrompt = buildVoicePrompt(voiceSignals, profile.tone_preferences);
  const mix = profile.topic_mix;

  const businessCount = Math.round((mix.business / 100) * count);
  const leadershipCount = Math.round((mix.leadership / 100) * count);
  const personalCount = count - businessCount - leadershipCount;

  const articleSummaries = articles
    .slice(0, 15)
    .map((a) => `- "${a.title}" (${a.source}): ${a.summary.slice(0, 150)}`)
    .join('\n');

  const systemPrompt = `You are a LinkedIn post ghostwriter for ${profile.name}, ${profile.role} at ${profile.company}.

${voicePrompt}

Company context: ${profile.company} is a white-label OTT platform company specializing in FAST channels, ad monetization (AdNet+), content distribution (StreamBridge), and OEM partnerships. 14 years in the streaming industry, global operations.

Interests: ${profile.interests.join(', ')}`;

  const userPrompt = `Generate ${count} LinkedIn posts:
- ${businessCount} business insights (based on recent news or industry experience)
- ${leadershipCount} leadership lessons
- ${personalCount} personal/vision posts

Recent industry news for inspiration:
${articleSummaries}

Post length: 150-250 words each (LinkedIn sweet spot). Some can be punchy (50-80 words).

For each post, respond in this exact JSON format:
[
  {
    "content": "the full post text",
    "category": "business" | "leadership" | "personal",
    "sourceContext": "brief description of what inspired this post",
    "sourceUrl": "URL of source article if applicable, or empty string"
  }
]

Return ONLY valid JSON array, no markdown formatting.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  try {
    const posts: Array<{
      content: string;
      category: string;
      sourceContext: string;
      sourceUrl: string;
    }> = JSON.parse(responseText);

    return posts.map((p) => ({
      content: p.content,
      category: CATEGORY_MAP[p.category] || 'business_insight',
      sourceContext: p.sourceContext,
      sourceUrl: p.sourceUrl,
    }));
  } catch {
    console.error('Failed to parse AI response:', responseText);
    return [];
  }
}

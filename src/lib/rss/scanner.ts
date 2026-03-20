import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Excaliber/1.0' },
});

export interface Article {
  title: string;
  link: string;
  summary: string;
  publishedAt: string;
  source: string;
}

export async function parseRssFeed(url: string, sourceName?: string): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).slice(0, 10).map((item) => ({
      title: item.title || '',
      link: item.link || '',
      summary: (item.contentSnippet || item.content || '').slice(0, 500),
      publishedAt: item.isoDate || new Date().toISOString(),
      source: sourceName || feed.title || url,
    }));
  } catch (error) {
    console.error(`Failed to parse RSS feed ${url}:`, error);
    return [];
  }
}

export async function scanAllSources(
  sources: Array<{ name: string; url: string; category: string }>
): Promise<Article[]> {
  const results = await Promise.allSettled(
    sources.map((s) => parseRssFeed(s.url, s.name))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);
}

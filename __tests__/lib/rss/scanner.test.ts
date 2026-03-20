import { parseRssFeed, scanAllSources } from '@/lib/rss/scanner';

const successFeedData = {
  title: 'Test Feed',
  items: [
    {
      title: 'Test Article',
      link: 'https://example.com/article',
      contentSnippet: 'Article summary text',
      isoDate: '2026-03-19T10:00:00Z',
    },
  ],
};

// We need a stable reference to mockParseURL that survives jest.mock hoisting.
// Define it on a plain object so the factory can close over it safely.
const mockFns = {
  parseURL: jest.fn().mockResolvedValue(successFeedData),
};

jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => ({
    parseURL: (...args: unknown[]) => mockFns.parseURL(...args),
  }));
});

describe('RSS Scanner', () => {
  beforeEach(() => {
    mockFns.parseURL.mockResolvedValue(successFeedData);
  });

  test('parseRssFeed returns articles with title, link, summary, and date', async () => {
    const articles = await parseRssFeed('https://example.com/feed', 'Test Source');
    expect(articles.length).toBe(1);
    expect(articles[0]).toEqual({
      title: 'Test Article',
      link: 'https://example.com/article',
      summary: 'Article summary text',
      publishedAt: '2026-03-19T10:00:00Z',
      source: 'Test Source',
    });
  });

  test('scanAllSources aggregates from multiple feeds', async () => {
    const sources = [
      { name: 'Feed A', url: 'https://a.com/feed', category: 'tech' },
      { name: 'Feed B', url: 'https://b.com/feed', category: 'biz' },
    ];
    const articles = await scanAllSources(sources);
    expect(articles.length).toBe(2);
  });

  test('parseRssFeed returns empty array on failure', async () => {
    mockFns.parseURL.mockRejectedValueOnce(new Error('Network error'));
    const articles = await parseRssFeed('https://bad.com/feed');
    expect(articles).toEqual([]);
  });
});

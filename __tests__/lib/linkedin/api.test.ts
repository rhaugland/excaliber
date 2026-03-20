import { publishPost } from '@/lib/linkedin/api';

describe('LinkedIn API', () => {
  test('publishPost sends correct payload structure', async () => {
    // Mock fetch
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'urn:li:share:12345' }),
    });
    global.fetch = mockFetch;

    await publishPost('test-token', 'urn:li:person:abc123', 'Test post content');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.linkedin.com/v2/posts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'LinkedIn-Version': '202602',
        }),
      })
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.author).toBe('urn:li:person:abc123');
    expect(body.commentary).toBe('Test post content');
    expect(body.lifecycleState).toBe('PUBLISHED');
  });
});

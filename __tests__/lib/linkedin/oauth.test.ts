import { buildAuthUrl, exchangeCodeForTokens } from '@/lib/linkedin/oauth';

describe('LinkedIn OAuth', () => {
  beforeEach(() => {
    process.env.LINKEDIN_CLIENT_ID = 'test-client-id';
    process.env.LINKEDIN_REDIRECT_URI = 'https://excaliber.ngrok.dev/api/auth/linkedin/callback';
  });

  test('buildAuthUrl returns valid LinkedIn authorization URL', () => {
    const url = buildAuthUrl('test-state');
    expect(url).toContain('https://www.linkedin.com/oauth/v2/authorization');
    expect(url).toContain('client_id=test-client-id');
    expect(url).toContain('scope=openid+profile+email+w_member_social');
    expect(url).toContain('state=test-state');
    expect(url).toContain('response_type=code');
  });
});

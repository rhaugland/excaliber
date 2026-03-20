const LINKEDIN_API_BASE = 'https://api.linkedin.com';
const LINKEDIN_VERSION = '202602';

interface LinkedInRequestOptions {
  method?: string;
  body?: Record<string, unknown>;
  accessToken: string;
}

async function linkedInFetch(path: string, options: LinkedInRequestOptions) {
  const { method = 'GET', body, accessToken } = options;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'LinkedIn-Version': LINKEDIN_VERSION,
    'X-Restli-Protocol-Version': '2.0.0',
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${LINKEDIN_API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn API error (${response.status}): ${error}`);
  }

  return response.json();
}

export async function getLinkedInProfile(accessToken: string) {
  return linkedInFetch('/v2/userinfo', { accessToken });
}

export async function publishPost(accessToken: string, authorUrn: string, text: string) {
  return linkedInFetch('/v2/posts', {
    method: 'POST',
    accessToken,
    body: {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      visibility: 'PUBLIC',
      commentary: text,
      distribution: {
        feedDistribution: 'MAIN_FEED',
      },
    },
  });
}

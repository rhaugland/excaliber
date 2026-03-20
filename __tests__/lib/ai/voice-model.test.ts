import { buildVoicePrompt } from '@/lib/ai/voice-model';

describe('Voice Model', () => {
  test('returns base prompt when no signals exist', () => {
    const prompt = buildVoicePrompt([], ['Professional', 'Bold']);
    expect(prompt).toContain('Professional');
    expect(prompt).toContain('Bold');
    expect(prompt).not.toContain('Example');
  });

  test('includes few-shot examples from edited signals', () => {
    const signals = [
      {
        action: 'edited' as const,
        original_draft: 'AI wrote this version',
        edited_version: 'Client rewrote it like this',
        time_spent_ms: 30000,
      },
    ];
    const prompt = buildVoicePrompt(signals, ['Conversational']);
    expect(prompt).toContain('Client rewrote it like this');
  });

  test('prioritizes recent signals over old ones', () => {
    const signals = Array.from({ length: 20 }, (_, i) => ({
      action: 'approved' as const,
      original_draft: `Post ${i}`,
      edited_version: null,
      time_spent_ms: 5000,
    }));
    const prompt = buildVoicePrompt(signals, ['Bold']);
    expect(prompt).toContain('Post 19');
    expect(prompt).not.toContain('Post 0');
  });
});

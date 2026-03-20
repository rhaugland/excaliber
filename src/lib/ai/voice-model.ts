interface VoiceSignalInput {
  action: 'approved' | 'edited' | 'rejected';
  original_draft: string;
  edited_version: string | null;
  time_spent_ms: number | null;
}

const MAX_EXAMPLES = 10;

export function buildVoicePrompt(
  signals: VoiceSignalInput[],
  tonePreferences: string[]
): string {
  const toneStr = tonePreferences.join(', ');
  let prompt = `Write in a ${toneStr} tone. `;

  const usefulSignals = signals
    .filter((s) => s.action === 'edited' || s.action === 'approved')
    .slice(-MAX_EXAMPLES);

  if (usefulSignals.length === 0) {
    prompt += 'Write as a CEO sharing genuine business insights from experience. Use first person. Be direct and specific — avoid generic advice. Include concrete examples when possible.';
    return prompt;
  }

  const editedExamples = usefulSignals.filter((s) => s.action === 'edited' && s.edited_version);
  const approvedExamples = usefulSignals.filter((s) => s.action === 'approved');

  if (editedExamples.length > 0) {
    prompt += '\n\nThe client edited these drafts to match their voice. Study the changes:\n';
    editedExamples.forEach((s, i) => {
      prompt += `\nExample ${i + 1} — AI draft: "${s.original_draft.slice(0, 200)}..."\n`;
      prompt += `Client's version: "${s.edited_version!.slice(0, 200)}..."\n`;
    });
  }

  if (approvedExamples.length > 0) {
    prompt += '\n\nThe client approved these posts as-is (they match their voice):\n';
    approvedExamples.slice(-5).forEach((s, i) => {
      prompt += `\nApproved ${i + 1}: "${s.original_draft.slice(0, 200)}..."\n`;
    });
  }

  prompt += '\n\nMatch this writing style closely. Use similar sentence structure, vocabulary, and perspective.';
  return prompt;
}

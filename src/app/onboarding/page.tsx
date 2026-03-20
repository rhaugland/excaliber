'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ConnectLinkedIn from '@/components/onboarding/ConnectLinkedIn';
import ProfileSetup from '@/components/onboarding/ProfileSetup';
import TargetSetup from '@/components/onboarding/TargetSetup';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStep = parseInt(searchParams.get('step') || '1');
  const [step, setStep] = useState(initialStep);

  const handleProfileComplete = async (data: {
    interests: string[];
    topicMix: { business: number; leadership: number; personal: number };
    tonePreferences: string[];
  }) => {
    // Save profile FIRST so the generate endpoint has the correct topic_mix/interests
    const response = await fetch('/api/onboarding/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      // Kick off initial post generation in background (non-blocking)
      fetch('/api/posts/generate', { method: 'POST' });
      setStep(3);
    }
  };

  const handleTargetsComplete = async (targets: Array<{
    name: string; linkedinUrl: string; company: string; tag: string;
  }>) => {
    const response = await fetch('/api/onboarding/targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targets }),
    });
    if (response.ok) router.push('/feed');
  };

  const steps = ['Connect', 'Profile', 'Targets'];

  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-2 px-6 pt-6 pb-4">
        {steps.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1 rounded-full transition ${i + 1 <= step ? 'bg-[var(--accent-blue)]' : 'bg-[var(--bg-elevated)]'}`} />
            <p className={`text-xs mt-1 text-center ${i + 1 === step ? 'text-white' : 'text-[var(--text-muted)]'}`}>{label}</p>
          </div>
        ))}
      </div>

      {step === 1 && <ConnectLinkedIn />}
      {step === 2 && <ProfileSetup onComplete={handleProfileComplete} />}
      {step === 3 && <TargetSetup onComplete={handleTargetsComplete} />}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <OnboardingContent />
    </Suspense>
  );
}

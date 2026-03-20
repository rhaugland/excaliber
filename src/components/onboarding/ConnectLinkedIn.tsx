'use client';

export default function ConnectLinkedIn() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="w-16 h-16 bg-[var(--accent-blue)] rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">Connect LinkedIn</h2>
      <p className="text-[var(--text-secondary)] text-center mb-8">
        One tap to connect. We&apos;ll pull your profile info automatically.
      </p>
      <a
        href="/api/auth/linkedin"
        className="w-full max-w-sm bg-[var(--accent-blue)] text-white py-4 rounded-xl text-center font-semibold text-lg hover:bg-blue-700 transition"
      >
        Connect with LinkedIn
      </a>
    </div>
  );
}

'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const LottiePlayer = dynamic(() => import('react-lottie-player'), { ssr: false });

const LOTTIE_URLS = {
  '401': 'https://assets2.lottiefiles.com/packages/lf20_3rwasyjy.json', // Unauthorized
  '403': 'https://assets2.lottiefiles.com/packages/lf20_3scbpt5c.json', // Forbidden
  '404': 'https://assets2.lottiefiles.com/packages/lf20_qh5z2fdq.json', // Not Found
  '500': 'https://assets2.lottiefiles.com/packages/lf20_j1adxtyb.json', // Server Error
};

const ERROR_CONFIG = {
  '401': {
    code: '401',
    title: 'Oops, You Need to Log In!',
    message: 'We couldn’t verify your identity. Please sign in to access this page.',
    accent: 'from-yellow-200 via-yellow-400 to-red-400',
    cta: [
      { label: 'Sign In', href: '/login', primary: true },
      { label: 'Back to Home', href: '/', primary: false },
    ],
    animation: '/assets/animations/unauthorized.json', // placeholder
  },
  '403': {
    code: '403',
    title: 'Access Denied',
    message: 'Sorry, you don’t have permission to view this page. Let’s get you to a safer spot.',
    accent: 'from-red-400 via-yellow-400 to-purple-400',
    cta: [
      { label: 'Request Access', href: '/support/request-access', primary: true },
      { label: 'Return to Homepage', href: '/', primary: false },
    ],
    animation: '/assets/animations/forbidden.json', // placeholder
  },
  '404': {
    code: '404',
    title: 'Lost in the Digital Wilderness',
    message: 'This page seems to have wandered off. Let’s find your way back!',
    accent: 'from-blue-400 via-purple-400 to-pink-400',
    cta: [
      { label: 'Search Again', href: '/search', primary: true },
      { label: 'Go Home', href: '/', primary: false },
    ],
    animation: '/assets/animations/notfound.json', // placeholder
  },
  '500': {
    code: '500',
    title: 'Our Servers Are Having a Moment',
    message: 'Something went wrong on our end. Our team is working to fix it!',
    accent: 'from-red-500 via-yellow-400 to-purple-500',
    cta: [
      { label: 'Try Again', action: 'reload', primary: true },
      { label: 'Report Issue', action: 'report', primary: false },
    ],
    animation: '/assets/animations/servererror.json', // placeholder
  },
};

function LottieErrorAnimation({ code }: { code: string }) {
  const url = LOTTIE_URLS[code] || LOTTIE_URLS['404'];
  return (
    <div className="w-64 h-64 flex items-center justify-center mb-6">
      <LottiePlayer
        loop
        play
        src={url}
        style={{ width: 256, height: 256 }}
        rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
        aria-label={`Error ${code} animation`}
      />
    </div>
  );
}

function ReportIssueModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error('Failed to submit report');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 max-w-md w-full shadow-xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close">×</button>
        <h2 className="text-xl font-bold mb-4 text-purple-600 dark:text-purple-400">Report Issue</h2>
        {submitted ? (
          <div className="text-green-600 dark:text-green-400">Thank you! Your report has been submitted.</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              className="rounded border border-gray-300 dark:border-gray-700 p-2 min-h-[80px] resize-y bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Describe the issue..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              aria-label="Describe the issue"
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button type="submit" className="futuristic-button w-full">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ErrorPage() {
  const params = useParams();
  const router = useRouter();
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const config = ERROR_CONFIG[status as keyof typeof ERROR_CONFIG] || ERROR_CONFIG['404'];
  const [showReport, setShowReport] = useState(false);

  function handleCTA(cta: any) {
    if (cta.action === 'reload') {
      router.refresh();
    } else if (cta.action === 'report') {
      setShowReport(true);
    }
  }

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br ${config.accent} dark:from-gray-900 dark:to-gray-950 transition-colors duration-500`}> 
      {/* Logo/Header */}
      <Link href="/" className="mb-8 flex items-center gap-2" aria-label="Go to homepage">
        {/* Replace with logo SVG if available */}
        <span className="text-2xl font-heading text-[var(--primary-accent)]">QuizMania</span>
      </Link>
      {/* Animation */}
      <LottieErrorAnimation code={config.code} />
      {/* Error Code & Title */}
      <h1 className="text-5xl font-bold font-heading text-[var(--primary-accent)] dark:text-purple-400 mb-2">{config.code}</h1>
      <h2 className="text-2xl font-semibold mt-2 text-gray-800 dark:text-gray-200 text-center">{config.title}</h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 text-center max-w-xl">{config.message}</p>
      {/* CTA Buttons */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        {config.cta.map((cta, i) =>
          cta.href ? (
            <Link
              key={cta.label}
              href={cta.href}
              className={`futuristic-button ${cta.primary ? 'scale-105' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'} transition-transform duration-300 focus:ring-4 focus:ring-[var(--primary-accent)]`}
              aria-label={cta.label}
            >
              {cta.label}
            </Link>
          ) : (
            <button
              key={cta.label}
              onClick={() => handleCTA(cta)}
              className={`futuristic-button ${cta.primary ? 'scale-105' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'} transition-transform duration-300 focus:ring-4 focus:ring-[var(--primary-accent)]`}
              aria-label={cta.label}
            >
              {cta.label}
            </button>
          )
        )}
      </div>
      {/* Report Issue Modal for 500 */}
      {status === '500' && <ReportIssueModal open={showReport} onClose={() => setShowReport(false)} />}
    </main>
  );
} 
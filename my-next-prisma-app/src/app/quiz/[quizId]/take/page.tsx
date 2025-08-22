'use client';
import React, { useEffect } from 'react';
import QuizContainer from '@/components/neuron-arena/QuizContainer';
import QuestionRenderer from '@/components/neuron-arena/QuestionRenderer';
import { useStaticQuiz } from '@/hooks/useQuizData';
import { useQuizStore } from '@/components/neuron-arena/state/quizStore';
import QuizInitModal from '@/components/neuron-arena/QuizInitModal';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Define TypeScript interfaces
interface SessionValidationResponse {
  valid: boolean;
  error?: string;
}

// DEV-ONLY: Violation rules toggle
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
// Development components removed for production

const QuizTakePage = () => {
  const params = useParams();
  const quizId = params?.quizId as string;
  const { quiz, loading, error } = useStaticQuiz(quizId);
  const setQuiz = useQuizStore((s) => s.setQuiz);
  const [initOpen, setInitOpen] = React.useState(true);
  const [sessionValid, setSessionValid] = React.useState(true);
  const [sessionError, setSessionError] = React.useState<string | null>(null);
  const [sessionId, setSessionId] = React.useState<string | undefined>(undefined);
  const [isValidating, setIsValidating] = React.useState(false); // New loading state
  const [hasStarted, setHasStarted] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (quiz) {
      setQuiz(quiz);
    }
  }, [quiz]); // Removed setQuiz from dependencies

  useEffect(() => {
    // Redirect to slug-based URL if quiz has a slug and current path uses cuid
    if (quiz?.slug && quiz.id !== quiz.slug && typeof window !== 'undefined') {
      const isCuid = /^cl\w{10,}$/.test(quiz.id);
      const currentPath = window.location.pathname;
      const expectedPath = `/quiz/${quiz.slug}/take`;
      if (isCuid && currentPath.includes(`/quiz/${quiz.id}/take`) && currentPath !== expectedPath) {
        router.replace(`${expectedPath}${window.location.search}`);
      }
    }
  }, [quiz, router]);

  useEffect(() => {
    // Validate session if quiz is loaded and session param exists
    const sid = searchParams ? searchParams.get('session') : undefined;
    if (sid && quiz?.id) {
      setSessionId(sid || undefined);
      setIsValidating(true);
      fetch(`/api/quiz/${quiz.id}/validate-session?session=${sid}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to validate session');
          const data: SessionValidationResponse = await res.json();
          if (!data.valid) {
            setSessionValid(false);
            setSessionError(data.error || 'Invalid or expired session.');
          } else {
            setSessionValid(true);
            setSessionError(null);
            setInitOpen(false); // Skip modal if session is valid
          }
        })
        .catch((err) => {
          setSessionValid(false);
          setSessionError(err.message || 'Failed to validate session.');
        })
        .finally(() => setIsValidating(false));
    }
  }, [quiz?.id, searchParams]);

  useEffect(() => {
    if (!initOpen && quiz && !hasStarted) {
      (async () => {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const fingerprint = result.visitorId;
        const deviceInfo = {
          userAgent: navigator.userAgent,
          devicePixelRatio: window.devicePixelRatio,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
          },
        };
        await fetch(`/api/quiz/${quiz.id}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fingerprint, deviceInfo }),
        });
        setHasStarted(true);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initOpen, quiz, hasStarted]);

  if (loading || isValidating) {
    return <div className="flex items-center justify-center min-h-screen">Loading quiz…</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }
  if (!quiz) {
    return null;
  }
  if (!sessionValid) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {sessionError || 'Session invalid.'}
      </div>
    );
  }

  const creatorInfo = quiz.creator
    ? {
        name: quiz.creator.name,
        profileImage: quiz.creator.profileImage,
        message: quiz.creator.creator_message,
      }
    : undefined;
  const rules = quiz.rules || '1. No cheating.\n2. No tab switching.\n3. Good luck!';
  const guide = quiz.guide || 'Answer all questions to the best of your ability.';

  return (
    <>
      {/* DEV-ONLY: Floating violation toggle panel. Remove before production! */}
            {/* Development components removed for production */}
      <QuizInitModal
        open={initOpen}
        onAcknowledge={() => setInitOpen(false)}
        creatorInfo={creatorInfo}
        rules={rules}
        guide={guide}
        quizId={quiz.id}
      />
      {!initOpen && (
        <QuizContainer sessionId={sessionId}>
          <QuestionRenderer />
        </QuizContainer>
      )}
    </>
  );
};

export default QuizTakePage;
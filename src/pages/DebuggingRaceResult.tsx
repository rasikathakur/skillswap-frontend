import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function DebuggingRaceResult() {
  const { state } = useLocation() as any;
  const navigate = useNavigate();

  useEffect(() => {
    const reportScore = async () => {
      const token = localStorage.getItem('access_token');
      if (!token || !state) return;

      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/games/attempt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            game_id: 'a32e3489-9db0-4f05-89ce-fe8596aa02f0', // Debugging Race ID
            question_id: state.challenge?.id || 'unknown',
            coding_language: state.challenge?.coding_language || 'Python',
            level: String(state.challenge?.level || '1'),
            score: state.score || 0,
            is_correct: state.isCorrect || false,
            time_taken_seconds: 0 // Placeholder
          })
        });
      } catch (err) {
        console.error('Failed to report score:', err);
      }
    };
    reportScore();
  }, [state]);

  if (!state) {
    // No result data, redirect back
    navigate('/tests/debugging-race');
    return null;
  }

  const { lines, expectedLine, correctLine, correctCause, userLine, userCauseLetter, optionMapping, violations, score, isCorrect, explanation } = state;

  const stars = (() => {
    if (score >= 18) return 5;
    if (score >= 14) return 4;
    if (score >= 10) return 3;
    if (score >= 6) return 2;
    if (score > 0) return 1;
    return 0;
  })();

  const bgGradient = isCorrect ? 'from-emerald-400 to-green-600' : 'from-rose-500 to-pink-500';
  const scoreTextClass = isCorrect ? 'text-green-600' : 'text-rose-600';
  const panelGradient = isCorrect ? 'from-emerald-50 to-green-50 dark:from-neutral-800 dark:to-neutral-900' : 'from-rose-50 to-pink-50 dark:from-neutral-800 dark:to-neutral-900';
  const starColor = isCorrect ? '#16a34a' : '#fb7185';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${bgGradient} opacity-30`} />

      <div className="relative w-full max-w-4xl rounded-xl p-6 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Results — Debugging Race</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Review your attempt and the correct explanation.</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-500">Score</div>
            <div className={`mt-1 text-2xl font-extrabold ${scoreTextClass}`}>{score}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="rounded-lg border p-4 bg-neutral-50 dark:bg-neutral-800">
              <div className="text-sm font-medium mb-2">Your Answer</div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-mono">{userLine ?? '-'}</div>
                <div className="text-sm text-neutral-600">Cause: <span className="font-medium">{userCauseLetter} — {optionMapping?.[userCauseLetter] || '-'}</span></div>
              </div>

              <div className="mt-3 text-sm text-neutral-600">Violations detected: <span className="font-mono">{violations && violations.length ? violations.join(', ') : 'none'}</span></div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="text-sm">Correct Line: <span className="font-mono">{correctLine}</span></div>
                <div className="text-sm">Correct Cause: <span className="font-medium">{correctCause} — {optionMapping?.[correctCause] || '-'}</span></div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Explanation</div>
                <div className="text-sm text-neutral-700 dark:text-neutral-300">
                  {explanation || 'The correct buggy line is highlighted below.'}
                </div>

                <div className="mt-3 rounded-md overflow-hidden bg-black text-white font-mono text-sm">
                  <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr' }}>
                    <div className="bg-neutral-900/60 p-2 text-right text-xs text-neutral-400">
                      {lines.map((_: any, i: number) => (
                        <div key={i} style={{ padding: '4px 6px' }}>{i + 1}</div>
                      ))}
                    </div>
                    <pre style={{ margin: 0, padding: 8, whiteSpace: 'pre-wrap' }}>
                      {lines.map((l: string, i: number) => (
                        <div
                          key={i}
                          style={{ padding: '4px 6px', background: (i + 1) === expectedLine ? 'rgba(16,185,129,0.12)' : 'transparent' }}
                        >
                          <span style={{ color: (i + 1) === userLine ? '#f97316' : undefined }}>{l}</span>
                        </div>
                      ))}
                    </pre>
                  </div>
                </div>

                <div className="mt-3 rounded-md p-3 bg-neutral-100 dark:bg-neutral-800 text-sm">
                  <div className="font-semibold mb-1">Correct answer</div>
                  <div>
                    Line: <span className="font-mono">{correctLine}</span> — Cause: <span className="font-mono">{correctCause} — {optionMapping?.[correctCause] || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className={`rounded-lg p-4 bg-gradient-to-br ${panelGradient} border`}>
              <div className="text-sm font-medium mb-2">Stars earned</div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} width="28" height="28" viewBox="0 0 24 24" fill={s <= stars ? starColor : 'none'} stroke={s <= stars ? starColor : '#d1d5db'} strokeWidth="1.5" className="rounded-full">
                    <path d="M12 .587l3.668 7.431L23.4 9.753l-5.4 5.264L19.836 24 12 20.011 4.164 24l1.836-8.983L0.6 9.753l7.732-1.735z" />
                  </svg>
                ))}
              </div>

              <div className="mt-4 text-sm text-neutral-600">Performance</div>
              <div className="mt-1 text-lg font-semibold">{isCorrect ? 'Correct' : 'Incorrect'}</div>

              <div className="mt-4 flex flex-col gap-2">
                <button className="px-3 py-2 rounded bg-white text-neutral-900 border" onClick={() => navigate('/tests')}>Back to Tests</button>
                {isCorrect ? (
                  <button className="px-3 py-2 rounded bg-gradient-to-r from-emerald-500 to-green-600 text-white" onClick={() => navigate('/tests')}>Next</button>
                ) : (
                  <button className="px-3 py-2 rounded bg-rose-600 text-white" onClick={() => navigate('/tests/debugging-race')}>Try Again</button>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

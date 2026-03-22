import { useEffect, Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CodeCompletionResult() {
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
            game_id: '302034fb-33f5-4eb5-aecf-344b23965ea2', // Code Completion ID
            question_id: state.template?.[0]?.id || 'unknown',
            coding_language: state.language || 'Java',
            level: String(state.level || 'EASY'),
            score: state.score || 0,
            is_correct: state.correctCount === state.totalBlanks,
            time_taken_seconds: 60 - (state.timeRemaining || 60)
          })
        });
      } catch (err) {
        console.error('Failed to report score:', err);
      }
    };
    reportScore();
  }, [state]);

  if (!state) {
    navigate('/tests');
    return null;
  }

  const { userAnswers, template, correctCount, totalBlanks, score, timeRemaining } = state;

  const isCorrect = correctCount === totalBlanks;
  const accuracy = Math.round((correctCount / totalBlanks) * 100);

  const stars = (() => {
    if (score >= 85) return 5;
    if (score >= 70) return 4;
    if (score >= 55) return 3;
    if (score >= 40) return 2;
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
            <h1 className="text-2xl font-bold">Results — Code Completion</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {isCorrect
                ? 'Perfect! You completed the code correctly with all tokens in place.'
                : `You completed ${correctCount} out of ${totalBlanks} blanks correctly.`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-500">Score</div>
            <div className={`mt-1 text-2xl font-extrabold ${scoreTextClass}`}>{score}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="rounded-lg border p-4 bg-neutral-50 dark:bg-neutral-800">
              <div className="mb-4">
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span>Your Completion</span>
                  <span className={`text-xs px-2 py-1 rounded ${isCorrect ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'}`}>
                    {accuracy}% Accuracy
                  </span>
                </div>

                <div className="rounded-md overflow-hidden bg-black text-white font-mono text-sm">
                  <div className="p-4 space-y-1">
                    {template.map((line: any, lineIdx: number) => {
                      const parts = line.text.split('_____');

                      return (
                        <div
                          key={lineIdx}
                          style={{
                            padding: '4px 8px',
                          }}
                        >
                          <span style={{ color: '#9ca3af', marginRight: '12px', display: 'inline-block', width: '30px', textAlign: 'right', fontSize: '11px' }}>
                            {lineIdx + 1}
                          </span>
                          <span style={{ color: '#e5e7eb' }}>
                            {parts.map((part: string, partIdx: number) => (
                              <Fragment key={partIdx}>
                                <span>{part}</span>
                                {partIdx < parts.length - 1 && (
                                  (() => {
                                    const key = `${lineIdx}_${partIdx}`;
                                    const userFilled = userAnswers[key] || null;
                                    const expected = line.blanks && line.blanks[partIdx];
                                    const correctToken = expected && userFilled === expected;

                                    return (
                                      <span
                                        style={{
                                          color: correctToken ? '#86efac' : '#fca5a5',
                                          fontWeight: 'bold',
                                          backgroundColor: correctToken ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                          padding: '2px 6px',
                                          borderRadius: '3px',
                                          marginRight: '2px',
                                        }}
                                      >
                                        {userFilled || '[blank]'}
                                      </span>
                                    );
                                  })()
                                )}
                              </Fragment>
                            ))}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-md p-3 bg-neutral-100 dark:bg-neutral-800 text-sm">
                <div className="font-semibold mb-1">Summary</div>
                <div className="text-neutral-700 dark:text-neutral-300 space-y-1">
                  <div>
                    <span className="font-medium">Tokens placed:</span> {Object.keys(userAnswers).length}/{totalBlanks}
                  </div>
                  <div>
                    <span className="font-medium">Correct tokens:</span> {correctCount}/{totalBlanks}
                  </div>
                  <div>
                    <span className="font-medium">Time used:</span> {60 - timeRemaining}s
                  </div>
                </div>
                <div className="mt-3 text-neutral-700 dark:text-neutral-300">
                  {isCorrect
                    ? 'Excellent! You successfully completed the Java Fibonacci program by placing all the required keywords and tokens in their correct positions.'
                    : `You placed ${correctCount} correct token(s). Review the highlighted tokens to see which ones were incorrect. The Java Fibonacci program requires specific keywords like "public", "class", "int", "for" to structure a working program.`}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className={`rounded-lg p-4 bg-gradient-to-br ${panelGradient} border`}>
              <div className="text-sm font-medium mb-2">Stars earned</div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill={s <= stars ? starColor : 'none'}
                    stroke={s <= stars ? starColor : '#d1d5db'}
                    strokeWidth="1.5"
                    className="rounded-full"
                  >
                    <path d="M12 .587l3.668 7.431L23.4 9.753l-5.4 5.264L19.836 24 12 20.011 4.164 24l1.836-8.983L0.6 9.753l7.732-1.735z" />
                  </svg>
                ))}
              </div>

              <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">Accuracy</div>
              <div className="mt-1 text-lg font-semibold">{accuracy}%</div>

              <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
                <div className="mb-2">
                  <span className="font-medium">Correct:</span> {correctCount}/{totalBlanks}
                </div>
                <div>
                  <span className="font-medium">Time used:</span> {60 - timeRemaining}s
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button className="px-3 py-2 rounded bg-white text-neutral-900 border hover:bg-neutral-50" onClick={() => navigate('/tests')}>
                  Back to Tests
                </button>
                {isCorrect ? (
                  <button className="px-3 py-2 rounded bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700" onClick={() => navigate('/tests')}>
                    Next Challenge
                  </button>
                ) : (
                  <button className="px-3 py-2 rounded bg-rose-600 text-white hover:bg-rose-700" onClick={() => navigate('/tests/t4')}>
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

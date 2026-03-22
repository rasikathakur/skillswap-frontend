import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CodeRearrangementResult() {
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
            game_id: 'e934111c-676b-4c84-9fe7-95ba55326514', // Code Rearrangement ID
            question_id: 'multi', // Aggregate attempt
            coding_language: state.language || 'Python',
            level: String(state.level || 'EASY'),
            score: state.score || 0,
            is_correct: state.isCorrect || false,
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

  const { originalLines, userLines, isCorrect, score, timeRemaining } = state;

  const stars = (() => {
    if (score >= 65) return 5;
    if (score >= 55) return 4;
    if (score >= 45) return 3;
    if (score >= 35) return 2;
    if (score > 0) return 1;
    return 0;
  })();

  const resultText = isCorrect ? 'PASS' : 'FAIL';
  const resultBgClass = isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
  const resultTextClass = isCorrect ? 'text-green-700 dark:text-green-100' : 'text-red-700 dark:text-red-100';
  const bgGradient = isCorrect ? 'from-emerald-400 to-green-600' : 'from-rose-500 to-pink-500';
  const scoreTextClass = isCorrect ? 'text-green-600' : 'text-rose-600';
  const panelGradient = isCorrect ? 'from-emerald-50 to-green-50 dark:from-neutral-800 dark:to-neutral-900' : 'from-rose-50 to-pink-50 dark:from-neutral-800 dark:to-neutral-900';
  const starColor = isCorrect ? '#16a34a' : '#fb7185';

  const getDifferentLines = () => {
    return originalLines.reduce((acc: number[], line: string, idx: number) => {
      if (userLines[idx] !== line) {
        acc.push(idx);
      }
      return acc;
    }, []);
  };

  const differentLines = getDifferentLines();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${bgGradient} opacity-30`} />

      <div className="relative w-full max-w-4xl rounded-xl p-6 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Results — Code Rearrangement</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {isCorrect ? 'Great job! You arranged the code correctly.' : 'Check the differences between your arrangement and the correct one.'}
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
                  <span>Your Arrangement</span>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${resultBgClass} ${resultTextClass}`}>
                    {resultText}
                  </span>
                </div>

                <div className="rounded-md overflow-hidden bg-black text-white font-mono text-sm">
                  <div className="space-y-0">
                    {userLines.map((line: string, i: number) => {
                      const isWrong = differentLines.includes(i);
                      return (
                        <div
                          key={i}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: isWrong ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                            borderLeft: isWrong ? '3px solid rgb(239, 68, 68)' : 'none',
                          }}
                        >
                          <span style={{ color: '#9ca3af', marginRight: '12px', display: 'inline-block', width: '30px', textAlign: 'right' }}>
                            {i + 1}
                          </span>
                          <span style={{ color: isWrong ? '#fca5a5' : '#e5e7eb' }}>
                            {line || <span style={{ color: '#6b7280', fontStyle: 'italic' }}>empty line</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Correct Arrangement</div>

                <div className="rounded-md overflow-hidden bg-black text-white font-mono text-sm">
                  <div className="space-y-0">
                    {originalLines.map((line: string, i: number) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: differentLines.includes(i) ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                          borderLeft: differentLines.includes(i) ? '3px solid rgb(34, 197, 94)' : 'none',
                        }}
                      >
                        <span style={{ color: '#9ca3af', marginRight: '12px', display: 'inline-block', width: '30px', textAlign: 'right' }}>
                          {i + 1}
                        </span>
                        <span style={{ color: differentLines.includes(i) ? '#86efac' : '#e5e7eb' }}>
                          {line || <span style={{ color: '#6b7280', fontStyle: 'italic' }}>empty line</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-md p-3 bg-neutral-100 dark:bg-neutral-800 text-sm">
                <div className="font-semibold mb-1">Explanation</div>
                <div className="text-neutral-700 dark:text-neutral-300">
                  {isCorrect
                    ? 'You successfully arranged all lines in the correct order. '
                    : `${differentLines.length > 0 ? `${differentLines.length} line(s) were in the wrong position.` : 'The arrangement was incorrect.'} `}
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

              <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">Performance</div>
              <div className="mt-1 text-lg font-semibold">{isCorrect ? 'Perfect!' : 'Try Again'}</div>

              <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
                <div className="mb-2">
                  <span className="font-medium">Time used:</span> {60 - timeRemaining}s
                </div>
                <div>
                  <span className="font-medium">Lines in order:</span> {userLines.filter((line: string, idx: number) => line === originalLines[idx]).length}/{originalLines.length}
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
                  <button className="px-3 py-2 rounded bg-rose-600 text-white hover:bg-rose-700" onClick={() => navigate('/tests/t3')}>
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

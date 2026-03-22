import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ConceptMatchResult() {
  const loc = useLocation();
  const navigate = useNavigate();
  const state: any = (loc && (loc.state as any)) || {};
  const total = state?.total ?? 10;
  const correct = state?.correct ?? 0;
  const language = state?.language ?? 'JavaScript';

  const score = Math.round((correct / total) * 100);
  const stars = Math.round((correct / total) * 5);
  const rank = Math.max(1, 100 - Math.round((correct / total) * 90));

  useEffect(() => {
    const reportScore = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/games/attempt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            game_id: 'bbd4f28e-aedf-4cae-a712-f87822f40df6', // Concept Match ID
            question_id: 'multi', // Aggregate attempt
            coding_language: language,
            level: String(state?.level || 'EASY'),
            score: score,
            is_correct: score > 0,
            time_taken_seconds: 0 // Placeholder
          })
        });
      } catch (err) {
        console.error('Failed to report score:', err);
      }
    };
    reportScore();
  }, [language, score, state?.level]);

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">Results — Concept Match</h1>
        <p className="text-sm text-neutral-500">Language: {language}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="text-sm">Score</div>
          <div className="text-3xl font-bold mt-2">{score}%</div>
          <div className="text-xs mt-2">{correct} out of {total}</div>
        </div>

        <div className="p-6 rounded-lg bg-neutral-50 dark:bg-neutral-900">
          <div className="text-sm">Correct Answers</div>
          <div className="text-2xl font-bold mt-2">{correct} / {total}</div>
          <div className="mt-4 text-sm text-neutral-500">Stars earned</div>
          <div className="mt-2 flex items-center gap-1 text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 ${i < stars ? '' : 'opacity-30'}`}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.922-.755 1.688-1.54 1.118L10 13.347l-3.38 2.455c-.784.57-1.839-.196-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.623 9.397c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.97z" />
              </svg>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-lg bg-neutral-50 dark:bg-neutral-900">
          <div className="text-sm">Rank Position</div>
          <div className="text-2xl font-bold mt-2">#{rank}</div>
          <div className="mt-4 text-sm text-neutral-500">Higher rank means better performance</div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Review Answers</h3>

        <div className="space-y-3">
          {(state.questions || []).map((q: any, i: number) => {
            const ans = (state.answers || []).find((a: any) => a.qid === q.id) || { chosen: null };
            const chosen = ans.chosen;
            const correctLetter = q.correct;
            const chosenLetter = (chosen !== null && q.option_mapping) ? q.option_mapping[chosen] : null;
            const isCorrect = chosenLetter === correctLetter;

            return (
              <div key={q.id} className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold mb-3">{i + 1}. {q.question}</div>
                    <div className="space-y-2">
                      {q.options.map((opt: string, idx: number) => {
                        const optionLetter = q.option_mapping ? q.option_mapping[idx] : String.fromCharCode(65 + idx);
                        const isCorrectOpt = optionLetter === correctLetter;
                        const isChosenOpt = idx === chosen;

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-md flex items-center gap-3 ${isCorrectOpt
                                ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                                : isChosenOpt && !isCorrectOpt
                                  ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
                                  : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'
                              }`}
                          >
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${isCorrectOpt
                                ? 'bg-green-500 text-white'
                                : isChosenOpt && !isCorrectOpt
                                  ? 'bg-red-500 text-white'
                                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                              }`}>
                              {optionLetter}
                            </div>
                            <div className="flex-1 text-sm">{opt}</div>
                            <div className="w-24 text-right text-sm">
                              {isCorrectOpt && <span className="text-green-600 dark:text-green-400 font-semibold">Correct</span>}
                              {isChosenOpt && !isCorrectOpt && <span className="text-red-600 dark:text-red-400 font-semibold">Your answer</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="ml-4">
                    {isCorrect ? (
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <span className="text-green-600 dark:text-green-400 text-xl font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <span className="text-red-600 dark:text-red-400 text-xl font-bold">✗</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={() => navigate('/tests')} className="px-6 py-2 rounded-md bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors">Back to tests</button>
          <button onClick={() => navigate('/profile')} className="px-6 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-opacity">View Profile</button>
        </div>
      </div>
    </div>
  );
}
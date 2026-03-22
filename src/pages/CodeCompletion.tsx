import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type LineTemplate = {
  text: string; // contains '_____' placeholders
  blanks: (string | null)[]; // expected tokens for each placeholder in this line
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CodeCompletion() {
  const navigate = useNavigate();
  const { state } = useLocation() as any;

  if (!state || !state.language || !state.level) {
    navigate('/tests');
    return null;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-purple-950 to-black opacity-90" />

      <div className="relative w-full max-w-3xl rounded-xl p-6 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        <h1 className="text-2xl font-semibold mb-4">Code Completion</h1>
        <p className="mb-4">You will be shown an incomplete program. Drag the correct tokens into the blanks (marked with "drop") to complete the code within the time limit.</p>

        <ul className="list-disc pl-5 mb-4 text-sm text-neutral-600 dark:text-neutral-300">
          <li>Time limit: 60 seconds</li>
          <li>Drag tokens from the bottom into the blank spaces marked with <span className="font-mono">drop</span></li>
          <li>Each token can be used multiple times if needed</li>
          <li>Complete the entire program correctly to earn points</li>
        </ul>

        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            onClick={() => navigate('/tests/t4/run', { state })}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

export function CodeCompletionRun() {
  const navigate = useNavigate();
  const { state } = useLocation() as any;
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [draggedToken, setDraggedToken] = useState<string | null>(null);
  const [template, setTemplate] = useState<LineTemplate[]>([]);
  const [missingTokens, setMissingTokens] = useState<string[]>([]);
  const [completeCode, setCompleteCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        if (!state || !state.language || !state.level) {
          setError('Missing language or level');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/games/code-completion/load`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: state.language, level: state.level })
        });

        if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        const data = await res.json();

        const incompleteRaw = (data.question.incomplete_code || '').replace(/\\n/g, '\n');
        const completeRaw = (data.question.complete_code || '').replace(/\\n/g, '\n');
        const missing = data.question.missing_tokens || [];
        const correctOrder: string[] = data.question.correct_token_order || [];

        // Build template: replace occurrences of the literal word 'drop' with '_____' markers
        const lines = incompleteRaw.split('\n');
        const newTemplate: LineTemplate[] = [];
        let blankCounter = 0;

        for (const line of lines) {
          const parts = line.split(/drop/);
          if (parts.length <= 1) {
            newTemplate.push({ text: line, blanks: [] });
            continue;
          }

          // Reconstruct text with '_____' placeholders
          let textWithPlaceholders = '';
          const blanksForLine: (string | null)[] = [];
          for (let i = 0; i < parts.length; i++) {
            textWithPlaceholders += parts[i];
            if (i < parts.length - 1) {
              textWithPlaceholders += '_____' ;
              // assign expected token from correctOrder if available
              const expected = correctOrder[blankCounter] ?? null;
              blanksForLine.push(expected);
              blankCounter++;
            }
          }

          newTemplate.push({ text: textWithPlaceholders, blanks: blanksForLine });
        }

        setTemplate(newTemplate);
        setMissingTokens(missing);
        setCompleteCode(completeRaw);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load question');
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [state]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(intervalRef.current || undefined);
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const handleTokenDragStart = (token: string) => setDraggedToken(token);

  const handleBlankDragOver = (e: React.DragEvent<HTMLSpanElement>) => e.preventDefault();

  const handleTokenDrop = (lineIdx: number, blankIdx: number) => {
    if (!draggedToken) return;
    const key = `${lineIdx}_${blankIdx}`;
    setUserAnswers((prev) => ({ ...prev, [key]: draggedToken }));
    setDraggedToken(null);
  };

  const getTotalBlanks = () => template.reduce((sum, l) => sum + l.blanks.length, 0);

  const getCorrectAnswersCount = () => {
    let correct = 0;
    template.forEach((line, li) => {
      line.blanks.forEach((expected, bi) => {
        const key = `${li}_${bi}`;
        if (expected && (userAnswers[key] === expected)) correct++;
      });
    });
    return correct;
  };

  const handleSubmit = () => {
    const correctCount = getCorrectAnswersCount();
    const totalBlanks = getTotalBlanks();
    const baseScore = 60;
    const correctRatio = totalBlanks ? correctCount / totalBlanks : 0;
    const timeBonus = Math.floor((remaining / 60) * 10);
    const accuracyBonus = Math.floor(correctRatio * 20);
    const score = Math.floor(baseScore + timeBonus + accuracyBonus);

    // Build filled code from template + userAnswers for a final comparison if desired
    const filledLines = template.map((line, li) => {
      if (line.blanks.length === 0) return line.text;
      const parts = line.text.split('_____');
      let out = '';
      for (let i = 0; i < parts.length; i++) {
        out += parts[i];
        if (i < parts.length - 1) {
          const key = `${li}_${i}`;
          out += userAnswers[key] ?? '';
        }
      }
      return out;
    }).join('\n');

    const completedMatches = filledLines.trim() === completeCode.trim();

    navigate('/tests/t4/result', {
      state: {
        userAnswers,
        template,
        correctCount: getCorrectAnswersCount(),
        totalBlanks: getTotalBlanks(),
        score,
        timeRemaining: remaining,
        completedMatches,
      }
    });
  };

  if (!state || !state.language || !state.level) {
    navigate('/tests');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-purple-950 to-black opacity-90" />
        <div className="relative w-full max-w-4xl rounded-xl p-6 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
          <div className="text-center">Loading question...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-purple-950 to-black opacity-90" />
        <div className="relative w-full max-w-4xl rounded-xl p-6 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
          <div className="text-center">
            <p className="text-lg text-red-600">Error: {error}</p>
            <button onClick={() => navigate('/tests')} className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white">Back to Tests</button>
          </div>
        </div>
      </div>
    );
  }

  const filledBlanks = Object.keys(userAnswers).length;
  const totalBlanks = getTotalBlanks();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-purple-950 to-black opacity-90" />

      <div className="relative w-full max-w-4xl rounded-xl p-6 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Code Completion — Run</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-300">Blanks filled: <span className="font-semibold">{filledBlanks}/{totalBlanks}</span></div>
            <div className={`text-sm font-mono px-3 py-1 rounded-lg ${remaining <= 10 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'}`}>Time: {remaining}s</div>
          </div>
        </div>

        <div className="mb-6 text-sm text-neutral-600 dark:text-neutral-300">Fill the blanks by dragging tokens into the placeholders.</div>

        <div className="rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 p-4 mb-6 border border-neutral-300 dark:border-neutral-600 min-h-64">
          <div className="bg-black text-white font-mono text-sm rounded">
            <div className="p-4 space-y-1">
              {template.map((line, lineIdx) => (
                <div key={lineIdx} className="flex items-center gap-2">
                  <span className="text-neutral-500 text-xs inline-block w-6 text-right">{lineIdx + 1}</span>
                  <div className="flex-1 flex items-center gap-1 flex-wrap">
                    {line.text.split('_____').map((part, partIdx, arr) => (
                      <React.Fragment key={partIdx}>
                        <span className="text-gray-300">{part}</span>
                        {partIdx < arr.length - 1 && (
                          <span
                            onDragOver={handleBlankDragOver}
                            onDrop={() => handleTokenDrop(lineIdx, partIdx)}
                            className="inline-flex items-center justify-center min-w-16 h-8 bg-blue-950 border-2 border-dashed border-blue-400 rounded cursor-pointer hover:bg-blue-900 hover:border-blue-300 transition-colors"
                            title={`Fill blank ${partIdx + 1} of line ${lineIdx + 1}`}>
                            {userAnswers[`${lineIdx}_${partIdx}`] ? (
                              <span className="text-blue-200 font-semibold text-sm">{userAnswers[`${lineIdx}_${partIdx}`]}</span>
                            ) : (
                              <span className="text-blue-400 text-xs">drop</span>
                            )}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm font-medium mb-2">Available Tokens (drag to blanks):</div>
          <div className="flex flex-wrap gap-2 p-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700">
            {missingTokens.map((token, idx) => (
              <div key={idx} draggable onDragStart={() => handleTokenDragStart(token)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg cursor-move hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-mono font-semibold">
                {token}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button className="px-4 py-2 rounded-lg bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition-colors" onClick={() => navigate('/tests')}>Cancel</button>
          <button className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${!running ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`} onClick={handleSubmit}>{!running ? "Time's Up - Submit" : 'Submit'}</button>
        </div>

        {!running && (
          <div className="mt-4 p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 text-sm">⏰ Time's up! Click Submit to see your results.</div>
        )}
      </div>
    </div>
  );
}

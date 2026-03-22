import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CodeRearrangement() {
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
        <h1 className="text-2xl font-semibold mb-4">Code Rearrangement</h1>
        <p className="mb-4">You will be shown a shuffled code snippet. Your task is to drag and drop the lines in the correct order within 60 seconds. Each line must be in the exact correct position.</p>

        <ul className="list-disc pl-5 mb-4 text-sm text-neutral-600 dark:text-neutral-300">
          <li>Time limit: 60 seconds</li>
          <li>Drag and drop lines to rearrange them in the correct order</li>
          <li>Submit your answer when you're confident in the arrangement</li>
          <li>Correct order is required to earn points</li>
        </ul>

        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            onClick={() => navigate(`/tests/t3/run`, { state })}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

export function CodeRearrangementRun() {
  const navigate = useNavigate();
  const { state } = useLocation() as any;
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [originalLines, setOriginalLines] = useState<string[]>([]);
  const [currentLines, setCurrentLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Fetch code rearrangement question from backend
    const fetchQuestion = async () => {
      try {
        if (!state || !state.language || !state.level) {
          setError('Missing language or level');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/games/code-rearrangement/load`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: state.language,
            level: state.level
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();
        const lines = data.question.original_lines;
        const shuffled = data.question.shuffled_lines;
        
        setOriginalLines(lines);
        setCurrentLines(shuffled);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load question');
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [state]);

  useEffect(() => {
    // Countdown timer
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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newLines = [...currentLines];
    const draggedItem = newLines[draggedIndex];
    newLines.splice(draggedIndex, 1);
    newLines.splice(dropIndex, 0, draggedItem);

    setCurrentLines(newLines);
    setDraggedIndex(null);
  };

  const handleSubmit = () => {
    const isCorrect = currentLines.every((line, idx) => line === originalLines[idx]);
    const baseScore = 60;
    const timeBonus = Math.floor((remaining / 60) * 10);
    const score = isCorrect ? baseScore + timeBonus : Math.floor((baseScore / 2) + timeBonus);

    navigate('/tests/t3/result', {
      state: {
        originalLines,
        userLines: currentLines,
        isCorrect,
        score,
        timeRemaining: remaining,
      },
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
          <div className="text-center">
            <p className="text-lg">Loading question...</p>
          </div>
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
            <button onClick={() => navigate('/tests')} className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white">
              Back to Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-purple-950 to-black opacity-90" />

      <div className="relative w-full max-w-4xl rounded-xl p-6 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Code Rearrangement — Run</h2>
          <div className={`text-sm font-mono px-3 py-1 rounded-lg ${remaining <= 10 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'}`}>
            Time: {remaining}s
          </div>
        </div>

        <div className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">Drag and drop the lines below to arrange them in the correct order.</div>

        <div className="rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 p-4 mb-6 border-2 border-dashed border-neutral-300 dark:border-neutral-600 min-h-96">
          <div className="space-y-2">
            {currentLines.map((line, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className="p-3 bg-white dark:bg-neutral-900 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 cursor-move hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-sm"
                style={{
                  opacity: draggedIndex === index ? 0.5 : 1,
                  backgroundColor: draggedIndex === index ? 'rgb(229, 231, 235)' : undefined,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 pt-1 flex-shrink-0 w-8 text-right">
                    {index + 1}
                  </div>
                  <div className="text-sm font-mono text-neutral-700 dark:text-neutral-200 flex-1 break-words">
                    {line || <span className="text-neutral-400 italic">empty line</span>}
                  </div>
                  <div className="text-xs text-neutral-400 pt-1 flex-shrink-0">::::</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition-colors"
            onClick={() => navigate('/tests')}
          >
            Cancel
          </button>
          <button
            className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${
              !running
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={handleSubmit}
          >
            {!running ? 'Time\'s Up - Submit' : 'Submit'}
          </button>
        </div>

        {!running && (
          <div className="mt-4 p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 text-sm">
            ⏰ Time's up! Your answer has been prepared for submission. Click Submit to see your results.
          </div>
        )}
      </div>
    </div>
  );
}

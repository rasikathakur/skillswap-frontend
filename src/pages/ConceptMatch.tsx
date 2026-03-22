import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';




type Q = {
  id: string;
  question: string;
  options: string[];
  correct: string;
  coding_language: string;
  level: string;
  option_mapping: { [key: number]: string }
};

// Space background component (transparent canvas that draws blue glowing dots)
function SpaceBackground({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const dotsRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef?.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resizeCanvas() {
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    }

    resizeCanvas();

    // initialize dots
    const dots: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    for (let i = 0; i < 50; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
      });
    }
    dotsRef.current = dots;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const dot of dotsRef.current) {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0) dot.x = canvas.width;
        if (dot.x > canvas.width) dot.x = 0;
        if (dot.y < 0) dot.y = canvas.height;
        if (dot.y > canvas.height) dot.y = 0;

        const grad = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.size * 6);
        grad.addColorStop(0, 'rgba(59,130,246,0.9)');
        grad.addColorStop(0.4, 'rgba(59,130,246,0.35)');
        grad.addColorStop(1, 'rgba(59,130,246,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = 'rgba(59,130,246,0.9)';
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

export default function ConceptMatch() {
  const navigate = useNavigate();
  const loc = useLocation();
  const state: any = (loc && (loc.state as any)) || history.state || {};
  const language = state?.language || 'Python';
  const level = state?.level || 'EASY';

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [questions, setQuestions] = useState<Q[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ qid: string; chosen: number | null; correct: string; option_mapping: { [key: number]: string } }[]>([]);

  // timer and rocket progress
  const duration = 30; // seconds per question
  const [remaining, setRemaining] = useState(duration);
  const rafRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);

  // Fetch questions from backend
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${apiBaseUrl}/api/games/concept-match/load`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, level })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
          } else {
            setError('No questions found for this category.');
          }
        } else {
          const errData = await response.json();
          setError(errData.detail || 'Failed to load questions.');
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Connection error. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [language, level]);

  useEffect(() => {
    if (questions.length > 0) {
      startQuestion();
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, questions]);

  function startQuestion() {
    setSelected(null);
    setRemaining(duration);
    startTsRef.current = performance.now();
    const tick = () => {
      const now = performance.now();
      const elapsed = ((now - (startTsRef.current || now)) / 1000);
      const rem = Math.max(0, duration - elapsed);
      setRemaining(rem);
      if (rem <= 0) {
        recordAnswer(null);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }

  function recordAnswer(chosen: number | null) {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    const q = questions[index];
    const finalAnswers = [...answers, { qid: q.id, chosen, correct: q.correct, option_mapping: q.option_mapping }];

    // move to next question or finish
    setTimeout(() => {
      if (index + 1 >= questions.length) {
        const correctCount = finalAnswers.filter((a) => {
          if (a.chosen === null) return false;
          const chosenLetter = a.option_mapping?.[a.chosen];
          return chosenLetter === a.correct;
        }).length;
        const result = { total: questions.length, correct: correctCount, answers: finalAnswers };
        navigate('/tests/concept-match/result', { state: { ...result, language, questions, level } });
      } else {
        setAnswers(finalAnswers);
        setIndex((i) => i + 1);
      }
    }, 400);
  }

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    recordAnswer(i);
  }

  const progress = Math.max(0, Math.min(1, remaining / duration));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-xl font-medium">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-950 text-white p-6 text-center">
        <div className="text-rose-500 text-5xl mb-4">⚠️</div>
        <div className="text-2xl font-bold mb-2">Error</div>
        <div className="text-neutral-400 mb-6">{error}</div>
        <button
          onClick={() => navigate('/tests')}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Back to Tests
        </button>
      </div>
    );
  }

  if (questions.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="h-screen w-full relative flex flex-col md:flex-row overflow-hidden bg-neutral-950 text-white"
    >
      <SpaceBackground containerRef={containerRef} />

      <div className="relative z-10 flex-1 flex flex-col md:flex-row">
        {/* Left column: rocket + space animation */}
        <div className="w-full md:w-1/2 h-48 md:h-full relative flex items-center justify-center bg-black/10 p-4">
          <div
            className="transition-all duration-150 ease-linear"
            style={{
              transform: `translateY(${(1 - progress) * 40}vh)`,
            }}
          >
            <svg
              width="60"
              height="80"
              viewBox="0 0 60 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-16 md:w-16 md:h-20 lg:w-20 lg:h-24"
            >
              <path d="M30 5 L45 55 L35 65 L30 55 L25 65 L15 55 L30 5 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
              <path d="M30 5 L35 25 L25 25 L30 5 Z" fill="#3b82f6" />
              <circle cx="30" cy="20" r="4" fill="#1e40af" />
              <path d="M15 55 L5 70 L15 65 Z" fill="#dc2626" />
              <path d="M45 55 L55 70 L45 65 Z" fill="#dc2626" />
            </svg>
          </div>
        </div>

        {/* Right column: question and options */}
        <div className="w-full md:w-1/2 p-4 md:p-6 lg:p-8 flex flex-col h-full bg-black/40 backdrop-blur-sm">
          <div className="flex-1 flex flex-col justify-center max-h-full overflow-hidden">
            <div className="mb-4 md:mb-6 lg:mb-8">
              <div className="text-xs md:text-sm text-blue-400 font-bold uppercase tracking-widest mb-2">
                Concept Match — {language}
              </div>
              <div className="text-lg md:text-xl lg:text-2xl font-semibold mb-2 line-clamp-4 leading-tight">
                {questions[index].question}
              </div>
              <div className="text-xs md:text-sm text-neutral-500">
                Question {index + 1} of {questions.length}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:gap-4 flex-1 overflow-auto max-h-[50vh] md:max-h-none pr-2">
              {questions[index].options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrectLetter = questions[index].option_mapping?.[i] === questions[index].correct;
                const showResult = selected !== null;

                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={selected !== null}
                    className={`text-left p-3 md:p-4 rounded-xl border-2 transition-all duration-300 font-medium flex items-start gap-3 group ${showResult
                      ? (isCorrectLetter
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                        : isSelected
                          ? 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                          : 'border-neutral-800 bg-neutral-900/50 text-neutral-500'
                      )
                      : 'border-neutral-800 bg-neutral-900/50 hover:border-blue-500/50 hover:bg-neutral-800/80 cursor-pointer'
                      }`}
                  >
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-semibold text-xs md:text-sm flex-shrink-0 transition-colors ${showResult
                        ? (isCorrectLetter ? 'bg-emerald-500 text-white' : isSelected ? 'bg-rose-500 text-white' : 'bg-neutral-800 text-neutral-600')
                        : 'bg-neutral-800 text-neutral-400 group-hover:bg-blue-500 group-hover:text-white'
                      }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div className="flex-1 text-xs md:text-sm leading-snug">{opt}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 md:mt-6 pt-4 border-t border-neutral-800">
              <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 rounded-full ${remaining < 5 ? 'bg-rose-500' : 'bg-blue-500'}`}
                  style={{ width: `${progress * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-[10px] md:text-xs text-neutral-500 uppercase tracking-wider">Time Remaining</div>
                <div className={`text-xs font-mono font-bold ${remaining < 5 ? 'text-rose-500 animate-pulse' : 'text-neutral-300'}`}>
                  {Math.ceil(remaining)}s
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Landing/start view for the Debugging Race
export default function DebuggingRace() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-purple-950 to-black opacity-90" />

      <div className="relative w-full max-w-3xl rounded-xl p-6 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        <h1 className="text-2xl font-semibold mb-4">Debugging Race</h1>
        <p className="mb-4">You will be shown a short code snippet and have 30 seconds to find the buggy line. During the run copying, selecting, context menu and tab changes are monitored and will mark the attempt as invalid.</p>

        <ul className="list-disc pl-5 mb-4 text-sm text-neutral-600 dark:text-neutral-300">
          <li>Time limit: 30 seconds</li>
          <li>After the timer ends a field will appear to enter the buggy line number and select the cause</li>
          <li>Any tab switch, copy attempt or context menu will be recorded as a violation</li>
        </ul>

        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            onClick={() => navigate('/tests/debugging-race/run')}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

// Run view for the actual timed debugging session
export function DebuggingRaceRun() {
  const navigate = useNavigate();
  const { state: navState } = useLocation() as any;
  const [remaining, setRemaining] = useState(30);
  const [running, setRunning] = useState(true);
  const [violations, setViolations] = useState<string[]>([]);
  const [allowedSubmit, setAllowedSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lineInput, setLineInput] = useState('');
  const [cause, setCause] = useState('A');
  const [snippet, setSnippet] = useState('');
  const [lines, setLines] = useState<string[]>([]);
  const [expectedLineNumberOneBased, setExpectedLineNumberOneBased] = useState<number | null>(null);
  const [correctCause, setCorrectCause] = useState('');
  const [totalLines, setTotalLines] = useState(0);
  const [optionMapping, setOptionMapping] = useState<{ [key: string]: string }>({});
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastIsCorrect, setLastIsCorrect] = useState<boolean | null>(null);
  const intervalRef = useRef<number | null>(null);

  const language = (navState && navState.language) || 'JavaScript';
  const level = (navState && (navState.level ?? navState.levels)) || 1;

  useEffect(() => {
    // fetch a challenge from backend
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/games/debugging-race/load`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, level }),
          signal: controller.signal,
        });
        const data = await res.json();
        console.log(language, level, data);
        // Backend returns: { status, challenge: { code, buggy_line, correct_option, ... } }
        const challenge = data.challenge || data;

        const s = challenge?.code || challenge?.snippet || challenge?.prompt || '';
        // Handle both literal \n strings and actual newlines in code
        const processedCode = s.replace(/\\n/g, '\n');
        const computedLines = processedCode ? processedCode.split('\n') : [];
        const expected = challenge?.buggy_line ?? challenge?.correct_line ?? null;
        const correctOpt = challenge?.correct_option || '';
        const total = challenge?.total_lines || computedLines.length || 0;
        const mapping = challenge?.option_mapping || {};

        setSnippet(processedCode);
        setLines(computedLines);
        setCorrectCause(correctOpt);
        setTotalLines(total);
        setOptionMapping(mapping);
        setCause('A');  // default to A
        setExplanation(challenge?.explanation || '');
        if (expected != null) setExpectedLineNumberOneBased(Number(expected));
      } catch (err) {
        // fallback to a tiny sample if fetch fails
        const fallback = `function add(a, b) {\n  const sum = a + b\n}\n\nconst result = add(2, 3)\nconsole.log('Result:', result)`;
        setSnippet(fallback);
        setLines(fallback.split('\n'));
        setCorrectCause('Missing Return');
        setExpectedLineNumberOneBased(2);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // countdown
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(intervalRef.current || undefined);
          setRunning(false);
          setAllowedSubmit(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    // prevent selection and right click
    const onCopy = (e: ClipboardEvent) => { e.preventDefault(); setViolations((v) => [...v, 'copy']); };
    const onCut = (e: ClipboardEvent) => { e.preventDefault(); setViolations((v) => [...v, 'cut']); };
    const onContext = (e: MouseEvent) => { e.preventDefault(); setViolations((v) => [...v, 'contextmenu']); };
    const onKey = (e: KeyboardEvent) => {
      // block common copy/print/devtools shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 's' || e.key === 'p')) {
        e.preventDefault(); setViolations((v) => [...v, `shortcut-${e.key}`]);
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i')) {
        e.preventDefault(); setViolations((v) => [...v, 'devtools']);
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        setViolations((v) => [...v, 'visibilitychange']);
        // stop the run early
        if (intervalRef.current) { window.clearInterval(intervalRef.current); }
        setRunning(false);
        setAllowedSubmit(true);
        setRemaining(0);
      }
    };

    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCut);
    document.addEventListener('contextmenu', onContext);
    document.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // isCorrect will be computed at submission time to avoid mismatch due to state timing or case differences

  const computeScore = (isCorrectFlag: boolean) => {
    if (!isCorrectFlag) return 0;
    // base 20 points; subtract per violation
    const base = 20;
    const penalty = Math.min(base, violations.length * 5);
    return Math.max(0, base - penalty);
  };

  const handleSubmit = () => {
    const userLineNum = Number(lineInput) || null;
    // Compare user's cause selection (letter) directly against correctCause (letter from DB)
    const isCorrectNow = userLineNum === expectedLineNumberOneBased && cause === correctCause;

    const score = computeScore(isCorrectNow);
    setLastIsCorrect(isCorrectNow);
    setSubmitted(true);

    // navigate to result page with attempt data
    navigate('/tests/debugging-race/result', {
      state: {
        snippet,
        lines,
        expectedLine: expectedLineNumberOneBased,
        correctLine: expectedLineNumberOneBased,
        correctCause,
        userLine: userLineNum,
        userCauseLetter: cause,
        optionMapping,
        violations,
        score,
        isCorrect: isCorrectNow,
        explanation,
      },
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-purple-950 to-black opacity-90" />

      <div className="relative w-full max-w-4xl rounded-xl p-6 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Debugging Race — Run</h2>
          <div className="text-sm text-neutral-600 dark:text-neutral-300">Time: <span className="font-mono">{remaining}s</span></div>
        </div>

        <div className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">Find the buggy line in the snippet below. Copying, selecting, context menu and tab switching are disabled/monitored.</div>

        <div
          className="rounded-md overflow-hidden bg-black text-white font-mono text-sm">
          {/* code with line numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr' }}>
            <div className="bg-neutral-900/60 p-2 text-right text-xs text-neutral-400">
              {lines.map((_, i) => (
                <div key={i} style={{ padding: '4px 6px' }}>{i + 1}</div>
              ))}
            </div>
            <pre
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onMouseDown={(e) => e.preventDefault()}
              style={{ margin: 0, padding: 8, whiteSpace: 'pre-wrap', userSelect: 'none' }}
            >
              {lines.map((l, i) => (
                <div key={i} style={{ padding: '4px 6px' }}>{l}</div>
              ))}
            </pre>
          </div>
        </div>

        <div className="mt-4">
          {!allowedSubmit && (
            <div className="text-sm text-neutral-500">The submit field will be available after the timer ends.</div>
          )}

          {allowedSubmit && !submitted && (
            <div className="mt-3 flex flex-col md:flex-row gap-3 items-start md:items-center">
              <label className="flex-1">
                <div className="text-xs text-neutral-600 mb-1">Buggy line number</div>
                <select value={lineInput} onChange={(e) => setLineInput(e.target.value)} className="w-full p-2 border rounded bg-black text-white">
                  <option value="">Select a line</option>
                  {Array.from({ length: totalLines }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num.toString()}>{num}</option>
                  ))}
                </select>
              </label>

              <label className="w-48">
                <div className="text-xs text-neutral-600 mb-1">Cause</div>
                <select value={cause} onChange={(e) => setCause(e.target.value)} className="w-full p-2 border rounded bg-black text-white">
                  {Object.keys(optionMapping).length > 0 ? (
                    Object.entries(optionMapping).map(([letter, text]) => (
                      <option key={letter} value={letter}>{letter} — {text}</option>
                    ))
                  ) : (
                    <>
                      <option value="A">Logic Error</option>
                      <option value="B">Syntax Error</option>
                      <option value="C">Typo</option>
                      <option value="D">Off-by-one</option>
                    </>
                  )}
                </select>
              </label>

              <div className="flex-shrink-0">
                <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={handleSubmit}>Submit</button>
              </div>
            </div>
          )}

          {submitted && (
            <div className="mt-4 p-4 bg-white/60 rounded text-sm text-neutral-800 dark:text-neutral-100">
              <div className="mb-2 font-semibold">Results</div>
              <div>Entered line: <span className="font-mono">{lineInput || '-'}</span></div>
              <div>Selected cause: <span className="font-mono">{cause}</span></div>
              <div>Violations: <span className="font-mono">{violations.length > 0 ? violations.join(', ') : 'none'}</span></div>
              <div className="mt-2 font-semibold">{lastIsCorrect ? 'Correct — well done!' : 'Incorrect — review the snippet again'}</div>

              <div className="mt-4">
                <button className="px-3 py-1 mr-2 border rounded" onClick={() => navigate('/tests')}>Back to Tests</button>
                <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => navigate('/tests/debugging-race')}>Start Over</button>
              </div>
            </div>
          )}

        </div>

        {/* If user attempts violation while still running show subtle warning */}
        {violations.length > 0 && !submitted && (
          <div className="mt-4 text-sm text-red-600">Detected: {violations.join(', ')} — attempt recorded.</div>
        )}
      </div>
    </div>
  );
}

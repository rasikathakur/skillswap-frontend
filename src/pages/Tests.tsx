import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const tests = [
  {
    id: 't1',
    title: 'Concept Match',
    subtitle: 'MCQ: match description to concept title',
    description: 'A concept description is shown; select the correct concept title. Fast responses earn bonus points.',
    color: 'from-purple-600 to-indigo-600',
  },
  {
    id: 't2',
    title: 'Debugging Race',
    subtitle: 'Fix buggy code within time',
    description: 'Identify and fix bugs in short code snippets before time runs out. Speed + correctness = score.',
    color: 'from-rose-500 to-pink-500',
  },
  {
    id: 't3',
    title: 'Code Rearrangement',
    subtitle: 'Arrange shuffled lines into correct order',
    description: 'Drag and drop shuffled lines of code into the correct order to form a working program.',
    color: 'from-green-400 to-teal-500',
  },
  {
    id: 't4',
    title: 'Code Completion',
    subtitle: 'Fill missing keywords/syntax by drag and drop',
    description: 'Complete incomplete code by dragging missing tokens into place. Accuracy and speed rewarded.',
    color: 'from-yellow-400 to-amber-500',
  },
];

const languages = [
  'Python',
  'JavaScript',
  'Java',
  'C++',
  'C',
  'C#',
  'Swift',
  'SQL',
  'NoSQL'
];

const PROGRAMMING_LEVELS = [
  'Fibonacci Series',
  'Prime Number',
  'Reverse String',
  'Matrix Multiplication',
  'Removing Duplicates',
  'Palindrome',
  'Factorial',
  'Armstrong',
  'GCD',
  'LCM'
];

const DATABASE_LEVELS = [
  'Second Highest Salary',
  'Department Highest Salary',
  'Frequent Customers',
  'Above Class Average',
  'Duplicate Emails',
  'Pivot Marks',
  'Top Rated Products',
  'Low Scoring Students',
  'Bought and Reviewed',
  'Update Electronics Price'
];

const levels = [
  'EASY',
  'MEDIUM',
  'HARD'
];

export default function TestsPage() {
  const [openTest, setOpenTest] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'instructions'>('select');
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [selectedLevel, setSelectedLevel] = useState<string>(levels[0]);

  const navigate = useNavigate();

  function open(tid: string) {
    setOpenTest(tid);
    setStep('select');
    setSelectedLang(languages[0]);
    // default to level 1 for debugging race, otherwise default EASY
    setSelectedLevel(tid === 't2' ? '1' : levels[0]);
  }

  function close() {
    setOpenTest(null);
    setStep('select');
  }

  const test = tests.find((t) => t.id === openTest) || null;

  // navigate using window history if react-router navigate not available in this module context
  function startTest() {
    if (!test) return;
    // language should be passed with original casing to match DB values
    const language = (selectedLang || '').toString();
    let level: any = selectedLevel;
    if (test.id === 't2') {
      level = Number(selectedLevel) || 1;
    } else if (test.id === 't3' || test.id === 't4') {
      // Code Rearrangement and Code Completion use EASY/MEDIUM/HARD as string
      level = selectedLevel;
    } else {
      level = selectedLevel;
    }
    navigate(`/tests/${test.id}`, { state: { language, level } });
    close();
  }

  return (
    <div className="w-full max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white">Take Test</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">Gamified assessments to practice skills — pick a challenge and earn points.</p>
      </header>

      <div className="space-y-4">
        {tests.map((t) => (
          <div key={t.id} className={`p-6 rounded-xl shadow-lg transform transition hover:-translate-y-1 cursor-pointer bg-gradient-to-r ${t.color} text-white`} onClick={() => open(t.id)}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg md:text-xl font-bold tracking-tight">{t.title}</div>
                <div className="text-sm opacity-90 mt-1">{t.subtitle}</div>
                <p className="mt-3 text-sm opacity-90 max-w-2xl">{t.description}</p>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-xs uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">Play</div>
                <div className="mt-3 text-xs opacity-80">Estimated time: 5-10 mins</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {openTest && test && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={close} />

          <div className="relative z-10 w-full max-w-2xl rounded-xl bg-neutral-50 dark:bg-neutral-900 p-6">
            {step === 'select' ? (
              <div>
                <h2 className="text-xl font-bold mb-2">{test.title}</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">Select programming language to attempt this challenge.</p>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)} className="w-full rounded-md border border-neutral-200/50 bg-black text-white px-3 py-2">
                    {languages.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Level</label>
                  {test.id === 't2' ? (
                    <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full rounded-md border border-neutral-200/50 bg-black text-white px-3 py-2">
                      {(selectedLang === 'SQL' || selectedLang === 'NoSQL' ? DATABASE_LEVELS : PROGRAMMING_LEVELS).map((title, idx) => (
                        <option key={idx} value={(idx + 1).toString()}>Level {idx + 1} — {title}</option>
                      ))}
                    </select>
                  ) : (
                    <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full rounded-md border border-neutral-200/50 bg-black text-white px-3 py-2">
                      {levels.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button onClick={close} className="px-4 py-2 rounded-md bg-white/5">Cancel</button>
                  <button onClick={() => setStep('instructions')} className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white">Next</button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-2">How to play — {test.title}</h2>
                <div className="prose dark:prose-invert text-sm text-neutral-700 dark:text-neutral-200">
                  <p>{test.description}</p>
                  <ul>
                    <li>Points are awarded for correct answers; bonus for speed.</li>
                    <li>Each incorrect attempt may reduce points slightly on certain games.</li>
                    <li>Complete the challenge within the time limit to maximize score.</li>
                  </ul>
                  <p className="mt-2">Scoring example: base points + time bonus + accuracy multiplier.</p>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button onClick={() => setStep('select')} className="px-4 py-2 rounded-md bg-white/5">Back</button>
                  <button onClick={() => startTest()} className="px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-emerald-500 text-white">Start</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ForgotPassword() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function isValidEmail(val: string) {
    const inst = /^[0-9]{2}_[a-zA-Z]+(?:\.[a-zA-Z]+)+@ges-coengg\.org$/i;
    const gmail = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;
    return inst.test(val) || gmail.test(val);
  }

  return (
    <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      <h2 className="text-3xl font-extrabold text-purple-800 dark:text-purple-200">Forgot password</h2>
      

      <form
        className="mt-6 space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setEmailError(null);
          setApiError(null);
          setSuccessMessage(null);

          if (!isValidEmail(email)) {
            setEmailError('Enter a valid institutional email (e.g. 23_first.last@ges-coengg.org) or a Gmail address');
            return;
          }

          setLoading(true);
          try {
            const res = await fetch(`${API_BASE_URL}/api/auth/request-password-reset`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (!res.ok) {
              setApiError(data.detail || 'Failed to send reset link. Please try again.');
              return;
            }

            setSuccessMessage(data.message || 'If the email exists, a password reset link has been sent.');
          } catch (error) {
            setApiError(error instanceof Error ? error.message : 'Failed to send reset link.');
          } finally {
            setLoading(false);
          }
        }}
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-purple-200/90">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'email-error' : undefined}
            className="mt-2 w-full border-b border-purple-400/40 bg-transparent py-2 text-neutral-900 dark:text-white placeholder-purple-300 focus:outline-none focus:border-purple-300"
            placeholder="you@example.com"
          />
          {emailError && <div id="email-error" className="mt-1 text-xs text-rose-500">{emailError}</div>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 py-2.5 text-white font-semibold shadow-lg shadow-purple-600/30 hover:scale-[0.995] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      {apiError && <div className="mt-4 p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-300">{apiError}</div>}
      {successMessage && <div className="mt-4 p-3 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">{successMessage}</div>}

      <p className="mt-6 text-center text-sm text-purple-700 dark:text-purple-200">Remembered your password? <Link to="/signin" className="text-purple-300 font-semibold hover:underline">Back to sign in</Link></p>
    </div>
  );
}

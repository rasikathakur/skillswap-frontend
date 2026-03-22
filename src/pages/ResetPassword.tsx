import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  function isStrongPassword(val: string) {
    const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return re.test(val);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError(null);
    setConfirmPasswordError(null);
    setApiError(null);
    setSuccessMessage(null);

    if (!token) {
      setApiError('Invalid reset link. Please request a new password reset email.');
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setPasswordError('Password must be at least 8 characters and include 1 uppercase letter, 1 digit and 1 special character');
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.detail || 'Failed to reset password.');
        return;
      }

      setSuccessMessage(data.message || 'Password reset successful. Redirecting to sign in...');
      setTimeout(() => navigate('/signin'), 1500);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      <h2 className="text-3xl font-extrabold text-purple-800 dark:text-purple-200">Reset password</h2>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-purple-200/90">New password</label>
          <div className="relative mt-2">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border-b border-purple-400/40 bg-transparent py-2 pr-10 text-neutral-900 dark:text-white placeholder-purple-300 focus:outline-none focus:border-purple-300"
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-0 top-1/2 -translate-y-1/2 pr-1 text-purple-500"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {passwordError && <div className="mt-1 text-xs text-rose-500">{passwordError}</div>}
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-purple-200/90">Confirm new password</label>
          <div className="relative mt-2">
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border-b border-purple-400/40 bg-transparent py-2 pr-10 text-neutral-900 dark:text-white placeholder-purple-300 focus:outline-none focus:border-purple-300"
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-0 top-1/2 -translate-y-1/2 pr-1 text-purple-500"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {confirmPasswordError && <div className="mt-1 text-xs text-rose-500">{confirmPasswordError}</div>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 py-2.5 text-white font-semibold shadow-lg shadow-purple-600/30 hover:scale-[0.995] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>

      {apiError && <div className="mt-4 p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-300">{apiError}</div>}
      {successMessage && <div className="mt-4 p-3 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">{successMessage}</div>}

      <p className="mt-6 text-center text-sm text-purple-700 dark:text-purple-200">Back to <Link to="/signin" className="text-purple-300 font-semibold hover:underline">sign in</Link></p>
    </div>
  );
}

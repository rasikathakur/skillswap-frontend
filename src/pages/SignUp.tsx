import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Eye, EyeOff } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SignUp() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  useEffect(() => setMounted(true), []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function isValidEmail(val: string) {
    const inst = /^[0-9]{2}_[a-zA-Z]+(?:\.[a-zA-Z]+)+@ges-coengg\.org$/i;
    const gmail = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;
    return inst.test(val) || gmail.test(val);
  }

  function isStrongPassword(val: string) {
    const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return re.test(val);
  }

  async function handleSignUp() {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.detail || 'Sign up failed');
        return;
      }

      // Store token in localStorage
      localStorage.setItem('access_token', data.access_token || '');
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('user_email', data.email);

      // Create profile record in backend (upsert)
      try {
        const token = data.access_token || '';
        await fetch(`${API_BASE_URL}/api/profile/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ user_id: data.user_id, name, email: data.email })
        });
      } catch (e) {
        // non-fatal: profile creation may be done server-side or retried later
        console.warn('Profile create failed:', e);
      }

      setSuccess(true);
      // Redirect to profile setup page after 1.5 seconds
      setTimeout(() => navigate('/setup-profile'), 1500);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} flex flex-col h-full`}>
      <h2 className="text-2xl font-extrabold text-purple-800 dark:text-purple-200">Create account</h2>


      <form
        className="mt-[2vh] space-y-[2vh] flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          setNameError(null);
          setEmailError(null);
          setPasswordError(null);
          setConfirmError(null);
          setApiError(null);
          let ok = true;
          if (!name.trim()) {
            setNameError('Name is required');
            ok = false;
          }
          if (!isValidEmail(email)) {
            setEmailError('Enter a valid institutional email (e.g. 23_first.last@ges-coengg.org) or a Gmail address');
            ok = false;
          }
          if (!isStrongPassword(password)) {
            setPasswordError('Password must be at least 8 characters and include 1 uppercase letter, 1 digit and 1 special character');
            ok = false;
          }
          if (password !== confirm) {
            setConfirmError('Passwords do not match');
            ok = false;
          }
          if (ok) {
            handleSignUp();
          }
        }}
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-purple-700 dark:text-purple-200">Name</label>
          <div className="relative mt-2">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-invalid={!!nameError}
              aria-describedby={nameError ? 'name-error' : undefined}
              className="w-full border-b border-purple-400/40 bg-transparent py-1.5 pr-10 text-neutral-900 dark:text-white placeholder-purple-300 focus:outline-none focus:border-purple-300"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-2 text-purple-500">
              <User className="h-5 w-5" />
            </div>
          </div>
          {nameError && <div id="name-error" className="mt-1 text-xs text-rose-500">{nameError}</div>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-purple-700 dark:text-purple-200">Email</label>
          <div className="relative mt-2">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
              className="w-full border-b border-purple-400/40 bg-transparent py-1.5 pr-10 text-neutral-900 dark:text-white placeholder-purple-300 focus:outline-none focus:border-purple-300"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-2 text-purple-500">
              <Mail className="h-5 w-5" />
            </div>
          </div>
          {emailError && <div id="email-error" className="mt-1 text-xs text-rose-500">{emailError}</div>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-purple-700 dark:text-purple-200">Password</label>
          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : undefined}
              className="w-full border-b border-purple-400/40 bg-transparent py-1.5 pr-10 text-neutral-900 dark:text-white placeholder-purple-300 focus:outline-none focus:border-purple-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 pr-2 text-purple-500 hover:text-purple-400 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {passwordError && <div id="password-error" className="mt-1 text-xs text-rose-500">{passwordError}</div>}
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-purple-700 dark:text-purple-200">Confirm password</label>
          <div className="relative mt-2">
            <input
              id="confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              aria-invalid={!!confirmError}
              aria-describedby={confirmError ? 'confirm-error' : undefined}
              className="w-full border-b border-purple-400/40 bg-transparent py-1.5 pr-10 text-neutral-900 dark:text-white placeholder-purple-300 focus:outline-none focus:border-purple-300"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 pr-2 text-purple-500 hover:text-purple-400 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {confirmError && <div id="confirm-error" className="mt-1 text-xs text-rose-500">{confirmError}</div>}
        </div>

        {apiError && <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-300">{apiError}</div>}
        {success && <div className="p-3 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">Sign up successful! Redirecting to setup...</div>}

        <button type="submit" disabled={loading} className="w-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 py-2.5 text-white font-semibold shadow-lg shadow-purple-600/30 hover:scale-[0.995] transition disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Creating account...' : 'Sign up'}</button>
      </form>

      <p className="mt-[2vh] text-center text-sm text-purple-700 dark:text-purple-200">Already have an account? <Link to="/signin" className="text-purple-600 font-semibold hover:underline">Sign in</Link></p>
    </div>
  );
}

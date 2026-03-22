import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SignIn() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  useEffect(() => setMounted(true), []);

  function isValidEmail(val: string) {
    const inst = /^[0-9]{2}_[a-zA-Z]+(?:\.[a-zA-Z]+)+@ges-coengg\.org$/i; // e.g. 23_first.last@ges-coengg.org
    const gmail = /^[A-Za-z0-9._%+-]+@gmail\.com$/i; // e.g. abc@gmail.com
    return inst.test(val) || gmail.test(val);
  }

  function isStrongPassword(val: string) {
    // min 8 chars, at least one uppercase, one digit and one special char
    const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;
    return re.test(val);
  }

  async function handleSignIn() {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.detail || 'Sign in failed');
        return;
      }

      // Store token in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('user_email', data.email);

      // Check if profile is complete
      let isProfileComplete = false;
      try {
        const profileRes = await fetch(`${API_BASE_URL}/api/profile/${data.user_id}`, {
          headers: { 'Authorization': `Bearer ${data.access_token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const p = profileData.profile;
          if (p && p.department && p.semester_year) {
            isProfileComplete = true;
          }
        }
      } catch (e) {
        console.warn('Failed to check profile completeness', e);
      }

      setSuccess(true);
      // Redirect based on profile completeness or to dashboard after 1 second
      setTimeout(() => {
        if (!isProfileComplete) {
          navigate('/profile?setup=true');
        } else {
          navigate('/profile');
        }
      }, 1000);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`transition-all duration-500${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} flex flex-col h-full`}>
      <h2 className="text-2xl font-extrabold text-purple-800 dark:text-purple-200">Login</h2>


      <form
        className="mt-[2vh] space-y-[2vh] flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          setEmailError(null);
          setPasswordError(null);
          setApiError(null);
          let ok = true;
          if (!isValidEmail(email)) {
            setEmailError('Enter a valid institutional email (e.g. 23_first.last@ges-coengg.org) or a Gmail address');
            ok = false;
          }
          if (!isStrongPassword(password)) {
            setPasswordError('Password must be at least 8 characters and include 1 uppercase letter, 1 digit and 1 special character');
            ok = false;
          }
          if (ok) {
            handleSignIn();
          }
        }}
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-purple-700 dark:text-purple-200">Username</label>
          <div className="relative mt-2">
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
              className="w-full border-b border-purple-400/40 bg-transparent py-2 pr-10 text-neutral-900 dark:text-white placeholder-purple-300 focus:outline-none focus:border-purple-300"
            />
            {emailError && <div id="email-error" className="mt-1 text-xs text-rose-500">{emailError}</div>}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-2 text-purple-500">
              <Mail className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-purple-700 dark:text-purple-200">Password</label>
            <Link to="/forgot-password" className="text-sm font-medium text-purple-700 dark:text-purple-200 hover:underline">Forgot?</Link>
          </div>
          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : undefined}
              className="w-full border-b border-purple-400/40 bg-transparent py-2 pr-10 text-neutral-900 dark:text-white placeholder-purple-300 focus:outline-none focus:border-purple-300"
            />
            {passwordError && <div id="password-error" className="mt-1 text-xs text-rose-500">{passwordError}</div>}

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-0 top-1/2 -translate-y-1/2 pr-1 text-purple-500"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 py-2.5 text-white font-semibold shadow-lg shadow-purple-600/30 hover:scale-[0.995] transition disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Signing in...' : 'Login'}</button>
      </form>

      {apiError && <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-300">{apiError}</div>}
      {success && <div className="p-3 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">Sign in successful! Redirecting...</div>}

      <p className="mt-[2vh] text-center text-sm text-purple-700 dark:text-purple-200">Don&apos;t have an account? <Link to="/signup" className="text-purple-600 font-semibold hover:underline">Sign Up</Link></p>
    </div>
  );
}

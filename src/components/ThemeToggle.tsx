import { useTheme } from '../theme/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm font-medium text-white shadow hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95 transition"
    >
      <span className="sr-only">Toggle theme</span>
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M21.752 15.002A9.718 9.718 0 0 1 12 21.75c-5.385 0-9.75-4.365-9.75-9.75 0-4.28 2.75-7.915 6.588-9.229a.75.75 0 0 1 .967.966 8.251 8.251 0 0 0 10.228 10.228.75.75 0 0 1 .966.967z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75zm0 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4.5 12a.75.75 0 0 1 .75-.75H7.5a.75.75 0 0 1 0 1.5H5.25A.75.75 0 0 1 4.5 12zm10.5 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H15.75A.75.75 0 0 1 15 12zM6.97 6.97a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 0 1-1.06 1.06L6.97 8.03a.75.75 0 0 1 0-1.06zm7.41 7.41a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 0 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06zM2.25 12a.75.75 0 0 1 .75-.75H5.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75zm15 7.5a.75.75 0 0 1 .75-.75H21a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75z" />
        </svg>
      )}
      <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}

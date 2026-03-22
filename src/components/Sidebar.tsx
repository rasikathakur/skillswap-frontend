// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useTheme } from '../theme/ThemeProvider';
// import FloatingSquares from './FloatingSquares';

// const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
//   const loc = useLocation();
//   const active = loc.pathname === to;
//   return (
//     <Link
//       to={to}
//       className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all text-sm font-medium w-full ${
//         active
//           ? 'bg-white/8 text-white shadow-md'
//           : 'text-neutral-300 hover:text-white hover:bg-white/5'
//       }`}
//     >
//       <div className={`p-2 rounded-md ${active ? 'bg-white/10' : 'bg-transparent'}`}>
//         {icon}
//       </div>
//       <div className="flex-1 text-left font-semibold tracking-tight">{label}</div>
//     </Link>
//   );
// };

// export default function Sidebar() {
//   const { theme, toggle } = useTheme();

//   return (
//     <aside className="md:col-span-1 relative pt-3 pb-3 pr-0 pl-0 overflow-hidden rounded-lg flex flex-col">
//       {/* background & floating squares */}
//       <div
//         className="absolute inset-0 -z-10 rounded-lg"
//         style={{
//           background:
//             'linear-gradient(180deg, rgba(76,29,149,0.6), rgba(79,70,229,0.35))',
//         }}
//       />
//       <FloatingSquares />

//       {/* Top brand block - fixed */}
//       <div className="relative z-20 p-6 border-b border-white/10">
//         <div className="text-center">
//           <h2 className="brand-title text-3xl font-extrabold text-white">
//             SkillSwap
//           </h2>
//           <p className="brand-tagline mt-2 text-xs text-white/90 max-w-[12rem] mx-auto">
//             Your Skills, Their Growth
//           </p>
//           <p className="mt-1 text-[10px] text-white/60 max-w-[15rem] mx-auto">
//             A Community Of Learners, By Learners
//           </p>
//         </div>
//       </div>

//       {/* Middle scrollable nav */}
//       <nav className="relative z-20 flex-1 flex flex-col gap-2 px-6 py-4 overflow-y-auto">
//         <NavItem
//           to="/profile"
//           icon={
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="currentColor"
//               viewBox="0 0 24 24"
//               className="h-5 w-5 text-purple-100"
//             >
//               <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 20a10 10 0 0120 0H2z" />
//             </svg>
//           }
//           label="My Profile"
//         />
//         <NavItem
//           to="/dashboard"
//           icon={
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="currentColor"
//               viewBox="0 0 24 24"
//               className="h-5 w-5 text-purple-100"
//             >
//               <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" />
//             </svg>
//           }
//           label="Dashboard"
//         />
//         <NavItem
//           to="/messages"
//           icon={
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="currentColor"
//               viewBox="0 0 24 24"
//               className="h-5 w-5 text-purple-100"
//             >
//               <path d="M20 2H4a2 2 0 00-2 2v14l4-2h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
//             </svg>
//           }
//           label="Messages"
//         />
//       </nav>

//       {/* Bottom profile block - fixed */}
//       <div className="relative z-20 border-t border-white/10 p-6">
//         <div className="flex items-center gap-3 mb-4 w-full">
//           <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
//             R
//           </div>
//           <div className="min-w-0">
//             <div className="text-white text-sm font-medium truncate whitespace-nowrap">
//               Rasika Thakur
//             </div>
//             <div className="text-white/60 text-xs">Student</div>
//           </div>
//         </div>

//         <div className="flex items-center gap-2 w-full justify-between">
//           <button
//             onClick={toggle}
//             className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/8 text-white/90 hover:bg-white/18 transition-all"
//             title="Toggle Theme"
//           >
//             {theme === 'dark' ? (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 className="h-5 w-5 text-yellow-400"
//               >
//                 <circle
//                   cx="12"
//                   cy="12"
//                   r="4"
//                   stroke="currentColor"
//                   strokeWidth="1.4"
//                   fill="currentColor"
//                 />
//                 <g stroke="currentColor" strokeWidth="1.2">
//                   <path d="M12 1v2" />
//                   <path d="M12 21v2" />
//                   <path d="M4.22 4.22l1.42 1.42" />
//                   <path d="M18.36 18.36l1.42 1.42" />
//                   <path d="M1 12h2" />
//                   <path d="M21 12h2" />
//                   <path d="M4.22 19.78l1.42-1.42" />
//                   <path d="M18.36 5.64l1.42-1.42" />
//                 </g>
//               </svg>
//             ) : (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 className="h-5 w-5 text-white"
//               >
//                 <path
//                   d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
//                   stroke="currentColor"
//                   strokeWidth="1.2"
//                 />
//               </svg>
//             )}
//           </button>

//           <button className="flex items-center gap-2 px-10 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all text-xs font-medium">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 24 24"
//               fill="currentColor"
//               className="h-3 w-3"
//             >
//               <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8a2 2 0 002-2V5a2 2 0 00-2-2z" />
//             </svg>
//             Logout
//           </button>
//         </div>
//       </div>
//     </aside>
//   );
// }
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeProvider';
import FloatingSquares from './FloatingSquares';
import { apiFetch } from '../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all text-sm font-medium w-full ${active
        ? 'bg-white/8 text-white shadow-md'
        : 'text-neutral-300 hover:text-white hover:bg-white/5'
        }`}
    >
      <div className={`p-2 rounded-md ${active ? 'bg-white/10' : 'bg-transparent'}`}>
        {icon}
      </div>
      <div className="flex-1 text-left font-semibold tracking-tight">{label}</div>
    </Link>
  );
};

export default function Sidebar() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<{ name: string; semester_year: string; department: string; photo: string | null } | null>(() => {
    const cached = localStorage.getItem('sb_profile_cache');
    return cached ? JSON.parse(cached) : null;
  });

  React.useEffect(() => {
    async function fetchSidebarProfile() {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;

        const res = await apiFetch(`/api/profile/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            const updatedProfile = {
              name: data.profile.name || 'User',
              semester_year: data.profile.semester_year || '',
              department: data.profile.department || '',
              photo: data.profile.photo || null
            };
            setUserProfile(updatedProfile);
            localStorage.setItem('sb_profile_cache', JSON.stringify(updatedProfile));
          }
        }
      } catch (err) {
        console.error('Failed to fetch sidebar profile:', err);
      }
    }
    fetchSidebarProfile();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      // Call logout endpoint
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      localStorage.removeItem('sb_profile_cache');
      sessionStorage.removeItem('feedback_popup_shown');

      // Redirect to signin
      setLoggingOut(false);
      sessionStorage.clear(); // Clear session storage on logout too
      navigate('/signin', { replace: true });
    }
  }

  return (
    <aside className="md:col-span-1 relative flex flex-col h-full overflow-hidden rounded-lg">
      {/* background & floating squares */}
      <div
        className="absolute inset-0 -z-10 rounded-lg"
        style={{
          background:
            'linear-gradient(180deg, rgba(76,29,149,0.6), rgba(79,70,229,0.35))',
        }}
      />
      <FloatingSquares />

      {/* Top brand block - fixed */}
      <div className="relative z-20 p-6 border-b border-white/10">
        <div className="text-center">
          <h2 className="brand-title text-3xl font-extrabold text-white">
            SkillSwap
          </h2>
          <p className="brand-tagline mt-2 text-xs text-white/90 max-w-[12rem] mx-auto">
            Your Skills, Their Growth
          </p>
          <p className="mt-1 text-[10px] text-white/60 max-w-[15rem] mx-auto">
            A Community Of Learners, By Learners
          </p>
        </div>
      </div>

      {/* Middle scrollable nav */}
      <nav className="relative z-20 flex-1 flex flex-col gap-2 px-6 py-4 overflow-y-auto">
        <NavItem
          to="/profile"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5 text-purple-100">
              <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 20a10 10 0 0120 0H2z" />
            </svg>
          }
          label="My Profile"
        />
        <NavItem
          to="/dashboard"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5 text-purple-100">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" />
            </svg>
          }
          label="Dashboard"
        />
        <NavItem
          to="/mentors"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5 text-purple-100">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          }
          label="Find Mentors"
        />
        <NavItem
          to="/schedule"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-purple-100">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
            </svg>
          }
          label="Schedule"
        />

        <NavItem
          to="/tests"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white-300">
              <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z" />
            </svg>
          }
          label="Take Test"
        />
      </nav>

      {/* Bottom profile block - fixed at bottom */}
      <div className="relative z-20 border-t border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4 w-full">
          {userProfile?.photo ? (
            <img
              src={userProfile.photo}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-400/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {userProfile?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-white text-sm font-black truncate whitespace-nowrap">
              {userProfile?.name || 'Loading...'}
            </div>
            <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider truncate">
              {userProfile
                ? `${userProfile.semester_year}${userProfile.semester_year && userProfile.department ? ' • ' : ''}${userProfile.department}`
                : 'Student'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full justify-between">
          <button
            onClick={toggle}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/8 text-white/90 hover:bg-white/18 transition-all"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-yellow-400">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="1.2">
                  <path d="M12 1v2" />
                  <path d="M12 21v2" />
                  <path d="M4.22 4.22l1.42 1.42" />
                  <path d="M18.36 18.36l1.42 1.42" />
                  <path d="M1 12h2" />
                  <path d="M21 12h2" />
                  <path d="M4.22 19.78l1.42-1.42" />
                  <path d="M18.36 5.64l1.42-1.42" />
                </g>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
          </button>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-10 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
              <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8a2 2 0 002-2V5a2 2 0 00-2-2z" />
            </svg>
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </aside>
  );
}

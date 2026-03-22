import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import ScheduleCard from '../components/ScheduleCard';
import { Trophy, Loader2, MessageSquare, ArrowRight } from 'lucide-react';
import { apiFetch } from '../utils/api';

type Skill = { id: string; name: string; level: 'Beginner' | 'Intermediate' | 'Advanced' };
type Feedback = { id: string; reviewer_name?: string; mentor: string; rating: number; text: string; date: number };
type ScheduledSession = { id: string; userName: string; date: string; time: string; topic: string; duration: string };

function Stars({ value }: { value: number }) {
  const stars = Array.from({ length: 5 }).map((_, i) => i < value);
  return (
    <div className="flex gap-1 text-yellow-400">
      {stars.map((on, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 ${on ? 'opacity-100' : 'opacity-30'}`}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.922-.755 1.688-1.54 1.118L10 13.347l-3.38 2.455c-.784.57-1.839-.196-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.623 9.397c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.97z" />
        </svg>
      ))}
    </div>
  );
}

// Profiles widget allows adding external profiles (github, hackerrank, codechef, leetcode, portfolio)
function ProfilesWidget({ profiles, onAdd, onRemove, readOnly }: { profiles: { id: string; key: string; url: string }[]; onAdd: (k: string, u: string) => void; onRemove: (id: string) => void; readOnly?: boolean }) {
  const isReadOnly = !!readOnly;
  const services = [
    { key: 'github', label: 'GitHub', domain: 'github.com', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.528 2.341 1.087 2.91.832.091-.647.35-1.087.636-1.337-2.22-.253-4.555-1.11-4.555-4.942 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.91-1.294 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.699 1.028 1.592 1.028 2.683 0 3.842-2.338 4.686-4.566 4.935.359.31.679.92.679 1.853 0 1.337-.012 2.417-.012 2.747 0 .268.18.58.688.482A10.012 10.012 0 0022 12c0-5.523-4.477-10-10-10z" /></svg>) },
    { key: 'hackerrank', label: 'HackerRank', domain: 'hackerrank.com', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" /></svg>) },
    { key: 'codechef', label: 'CodeChef', domain: 'codechef.com', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /></svg>) },
    { key: 'leetcode', label: 'LeetCode', domain: 'leetcode.com', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" /></svg>) },
    { key: 'portfolio', label: 'Portfolio', domain: '', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2l10 5v10l-10 5L2 17V7l10-5z" /></svg>) },
  ];

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(services[0].key);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  function isValidUrl(val: string) {
    try {
      // ensure protocol present
      const u = new URL(val);
      return !!u.hostname;
    } catch (e) {
      return false;
    }
  }

  function matchesDomain(key: string, val: string) {
    if (!val) return false;
    try {
      const u = new URL(val);
      const svc = services.find((s) => s.key === key);
      if (!svc) return false;
      if (!svc.domain) return true; // portfolio or custom
      return u.hostname.includes(svc.domain);
    } catch {
      return false;
    }
  }

  function addProfile() {
    setError(null);
    if (!isValidUrl(url)) {
      setError('Enter a valid URL (include https://)');
      return;
    }
    if (!matchesDomain(selected, url)) {
      const svc = services.find((s) => s.key === selected);
      setError(svc?.domain ? `URL must be from ${svc?.domain}` : 'Invalid URL');
      return;
    }
    onAdd(selected, url);
    setUrl('');
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold">Profiles</h3>
        {!isReadOnly && (
          <button onClick={() => setOpen((s) => !s)} className="text-sm text-purple-700 dark:text-purple-200 bg-white/5 px-2 py-1 rounded-md">
            {open ? 'Close' : 'Add / Manage'}
          </button>
        )}
      </div>

      {open && !isReadOnly && (
        <div className="mt-3 p-4 rounded-md bg-neutral-100 dark:bg-neutral-800/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={selected} onChange={(e) => setSelected(e.target.value)} className="rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-200/50 dark:border-neutral-700 px-3 py-2">
              {services.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>

            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourprofile.com/username" className="rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-200/50 dark:border-neutral-700 px-3 py-2 col-span-2 sm:col-span-2" />

            <div className="sm:col-span-3 flex items-center gap-3">
              <button onClick={addProfile} className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white">Add</button>
              <div className="text-sm text-rose-400">{error}</div>
            </div>
          </div>

          {/* list of profiles */}
          <div className="mt-4 grid gap-2">
            {profiles.map((p) => {
              const svc = services.find((s) => s.key === p.key)!;
              return (
                <div key={p.id} className="p-3 rounded-md bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-neutral-200 dark:bg-white/5 p-2 rounded">{svc.icon}</div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{svc.label}</div>
                      <a className="text-xs text-purple-200 truncate block max-w-xs" href={p.url} target="_blank" rel="noreferrer">{p.url}</a>
                    </div>
                  </div>

                  {!isReadOnly && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => window.open(p.url, '_blank')} className="text-sm text-white/80 px-2 py-1 rounded bg-white/5">View</button>
                      <button onClick={() => onRemove(p.id)} className="text-sm text-rose-400 px-2 py-1 rounded bg-transparent">Remove</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* always-visible profile cards */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {profiles.map((p) => {
          const svc = services.find((s) => s.key === p.key)!;
          return (
            <a key={`card-${p.id}`} href={p.url} target="_blank" rel="noreferrer" className="group block p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-white/5">{svc.icon}</div>
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">{svc.label}</div>
                  <div className="text-xs text-purple-200 truncate">{p.url.replace(/^https?:\/\//, '')}</div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfilePage({ readOnly = false, initialData = undefined }: { readOnly?: boolean; initialData?: any } = {}) {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('user_id') || '';
  const [avatar, setAvatar] = useState<string | null>(initialData?.avatar ?? null);
  const [editingInfo, setEditingInfo] = useState(false);
  const [name, setName] = useState(initialData?.name ?? '');
  const [yearBranch, setYearBranch] = useState(initialData?.yearBranch ?? '');
  const [department, setDepartment] = useState(initialData?.department ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');
  const [phone, setPhone] = useState(initialData?.phone ?? '');
  const [rank, setRank] = useState<string | number>('Unranked');
  const [totalScore, setTotalScore] = useState<string | number>('Not calculated');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  // Profiles state lifted to the page so they can be visualized elsewhere
  const [profiles, setProfiles] = useState<{ id: string; key: string; url: string }[]>(initialData?.profiles ?? []);

  function handleAddProfile(key: string, url: string) {
    const nextProfs = [...profiles, { id: String(Date.now()), key, url }];
    setProfiles(nextProfs);
    saveProfile({ profiles: nextProfs });
  }

  function handleRemoveProfile(id: string) {
    const nextProfs = profiles.filter((x) => x.id !== id);
    setProfiles(nextProfs);
    saveProfile({ profiles: nextProfs });
  }

  // Load profile from backend on mount
  useEffect(() => {
    const load = async () => {
      try {
        const user_id = localStorage.getItem('user_id');
        if (!user_id) return;
        const res = await apiFetch(`/api/profile/${user_id}`);
        if (!res.ok) return;
        const data = await res.json();
        const p = data.profile;
        if (!p) return;
        setName(p.name || name);
        setEmail(p.email || email);
        setAvatar(p.photo || avatar);
        setBio(p.bio || bio);
        setYearBranch(p.semester_year || yearBranch);
        setDepartment(p.department || department);
        setPhone(p.phone_number || phone);
        setRank(p.rank || 'Unranked');
        setTotalScore(p.total_score || 0);

        // profiles stored as object { key: url }
        const profs: { id: string; key: string; url: string }[] = [];
        try {
          const obj = p.profiles || {};
          Object.entries(obj).forEach(([k, v]) => {
            profs.push({ id: String(Date.now()) + k, key: k, url: String(v) });
          });
          setProfiles(profs);
        } catch { }

        // skills stored as object { name: level }
        try {
          const skillsObj = p.skills || {};
          const sks: Skill[] = Object.entries(skillsObj).map(([k, v]) => ({ id: String(k), name: k, level: (v as any) }));
          setSkills(sks.length ? sks : skills);
        } catch { }

        // scheduled_sessions is array of json
        try {
          const ss = p.scheduled_sessions || [];
          setScheduledSessions(ss.length ? ss : scheduledSessions);
        } catch { }

        // ratings_feedback
        try {
          const rf = p.ratings_feedback || [];
          setFeedback(rf.length ? rf : feedback);
        } catch { }

        // Fetch latest schedule separately from the new endpoint
        fetchSchedules();
      } catch (e) {
        // ignore load errors
        console.warn('Failed to load profile', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (readOnly) return;

    // Only show once per session/login
    const hasShown = sessionStorage.getItem('feedback_popup_shown');
    if (hasShown) return;

    const checkPendingFeedbacks = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const user_id = localStorage.getItem('user_id');
        if (!token || !user_id) return;

        const res = await apiFetch(`/api/schedule/list`);
        const data = await res.json();

        if (data.status === 'success' && data.schedules) {
          const now = new Date();
          const pending = data.schedules.filter((s: any) => {
            const timeStr = `${s.date}T${s.time}`;
            const sessionTime = new Date(timeStr);
            const isPast = sessionTime < now;
            const isScheduler = s.scheduler_id === user_id;
            const hasRated = isScheduler ? s.rated_by_scheduler : s.rated_by_participant;

            return isPast && !hasRated;
          });

          if (pending.length > 0) {
            setPendingReviews(pending);
            setShowPopup(true);
            // Mark as shown so it doesn't reappear until next login/session
            sessionStorage.setItem('feedback_popup_shown', 'true');
          }
        }
      } catch (err) {
        console.error('Failed to check pending feedbacks:', err);
      }
    };

    checkPendingFeedbacks();
  }, [readOnly]);

  const [schedulesList, setSchedulesList] = useState<any[]>([]);
  const fetchSchedules = async () => {
    try {
      const res = await apiFetch(`/api/schedule/list`);
      const data = await res.json();
      if (data.status === 'success') {
        setSchedulesList(data.schedules);
      }
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    }
  };

  // Save profile to backend
  async function saveProfile(overrides: any = {}) {
    try {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) return;

      const profilesObj: Record<string, string> = {};
      (overrides.profiles || profiles).forEach((p: any) => { profilesObj[p.key] = p.url; });

      const skillsObj: Record<string, string> = {};
      (overrides.skills || skills).forEach((s: any) => { skillsObj[s.name] = s.level; });

      const payload: any = {
        name: overrides.name !== undefined ? overrides.name : name,
        email: overrides.email !== undefined ? overrides.email : email,
        bio: overrides.bio !== undefined ? overrides.bio : bio,
        photo: overrides.avatar !== undefined ? overrides.avatar : avatar,
        semester_year: overrides.yearBranch !== undefined ? overrides.yearBranch : yearBranch,
        department: overrides.department !== undefined ? overrides.department : department,
        phone_number: overrides.phone !== undefined ? overrides.phone : phone,
        profiles: profilesObj,
        skills: skillsObj,
        scheduled_sessions: overrides.scheduledSessions !== undefined ? overrides.scheduledSessions : scheduledSessions,
        ratings_feedback: overrides.feedback !== undefined ? overrides.feedback : feedback,
      };

      const res = await apiFetch(`/api/profile/${user_id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Update sidebar cache
        const updatedSidebarCache = {
          name: payload.name || 'User',
          semester_year: payload.semester_year || '',
          department: payload.department || '',
          photo: payload.photo || null
        };
        localStorage.setItem('sb_profile_cache', JSON.stringify(updatedSidebarCache));
      }
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
  }

  const [bio, setBio] = useState(initialData?.bio ?? '');
  const [editingBio, setEditingBio] = useState(false);

  const [skills, setSkills] = useState<Skill[]>(initialData?.skills ?? [
    { id: 's1', name: 'Java', level: 'Advanced' },
    { id: 's2', name: 'React', level: 'Intermediate' },
    { id: 's3', name: 'Python', level: 'Advanced' },
  ]);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<Skill['level']>('Beginner');

  const [feedback, setFeedback] = useState<Feedback[]>(initialData?.feedback ?? [
    { id: 'f1', mentor: 'Prof. Mehta', rating: 5, text: 'Great mentorship and commitment.', date: '2025-08-01' },
    { id: 'f2', mentor: 'Dr. Singh', rating: 4, text: 'Very helpful on project architecture.', date: '2025-07-12' },
  ]);
  const [sort, setSort] = useState<'latest' | 'highest'>('latest');

  const avgRating = useMemo(() => Math.round((feedback.reduce((s, f) => s + f.rating, 0) / Math.max(1, feedback.length)) || 0), [feedback]);

  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([
    { id: 's1', userName: 'John Doe', date: '2025-01-15', time: '3:00 PM', topic: 'Java Advanced Concepts', duration: '1 hour' },
    { id: 's2', userName: 'Priya Verma', date: '2025-01-18', time: '2:00 PM', topic: 'React Optimization', duration: '45 mins' },
  ]);

  // Rank calculation is now handled by the backend

  // Avatar change triggers crop modal
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [showCrop, setShowCrop] = useState(false);

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setCropSrc(url);
    setCropZoom(1);
    setCropX(0);
    setCropY(0);
    setShowCrop(true);
  }

  async function saveCropped() {
    if (!cropSrc) return;
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = cropSrc;
    });

    const size = 256; // output size
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // fill with transparent
    ctx.clearRect(0, 0, size, size);

    // compute source rectangle from image based on zoom and offsets
    const zoom = Math.max(1, cropZoom);
    const srcW = img.naturalWidth / zoom;
    const srcH = img.naturalHeight / zoom;

    // offsets are percentage -50..50 -> map to pixel shift
    const offsetX = (cropX / 100) * img.naturalWidth;
    const offsetY = (cropY / 100) * img.naturalHeight;

    const srcX = Math.max(0, (img.naturalWidth - srcW) / 2 + offsetX - srcW / 2);
    const srcY = Math.max(0, (img.naturalHeight - srcH) / 2 + offsetY - srcH / 2);

    // draw image to canvas filling whole canvas
    // create circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, size, size);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/png');
    setAvatar(dataUrl);
    saveProfile({ avatar: dataUrl });
    setShowCrop(false);
    // revoke object URL
    try { URL.revokeObjectURL(cropSrc); } catch (e) { }
    setCropSrc(null);
  }

  function addSkill() {
    if (!newSkillName.trim()) return;
    const nextSkills: Skill[] = [...skills, { id: String(Date.now()), name: newSkillName.trim(), level: newSkillLevel }];
    setSkills(nextSkills);
    saveProfile({ skills: nextSkills });
    setNewSkillName('');
    setNewSkillLevel('Beginner');
    setShowAddSkill(false);
  }

  function removeSkill(id: string) {
    const nextSkills = skills.filter((x) => x.id !== id);
    setSkills(nextSkills);
    saveProfile({ skills: nextSkills });
  }

  function sortedFeedback() {
    // Filter to only show feedback where this user was the mentor (received feedback)
    const received = feedback.filter(f => String(f.mentor) === String(currentUserId));

    return [...received].sort((a, b) => {
      const dateA = typeof a.date === 'number' ? a.date * 1000 : new Date(a.date).getTime();
      const dateB = typeof b.date === 'number' ? b.date * 1000 : new Date(b.date).getTime();

      if (sort === 'latest') return dateB - dateA;
      return b.rating - a.rating || dateB - dateA;
    });
  }

  return (
    <div className="min-h-screen w-full flex items-start justify-center p-6 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-purple-950 to-black opacity-90" />

      <div className="relative w-full max-w-6xl rounded-xl p-[2px] mx-auto" style={{ background: 'linear-gradient(90deg,#7c3aed,#8b5cf6)' }}>
        <div
          className="relative overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
          style={{ boxShadow: '0 6px 30px rgba(124,58,237,0.35), inset 0 0 30px rgba(124,58,237,0.06)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4">
            {/* Sidebar */}
            <div className="hidden md:block md:col-span-1 bg-gradient-to-b from-purple-700/60 to-indigo-700/40 relative p-6 rounded-l-lg overflow-hidden">
              <Sidebar />
            </div>

            {/* Main content */}
            <main className="col-span-1 md:col-span-3 p-6 md:p-10 max-h-[calc(100vh-4rem)] overflow-auto hide-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                  <div className="relative">
                    <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-purple-500/20 animate-pulse rounded-full" />
                  </div>
                  <p className="text-sm font-medium text-neutral-500 animate-pulse">Syncing your profile...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="h-28 w-28 rounded-full bg-purple-200/30 overflow-hidden ring-4 ring-white/10">
                          {avatar ? (
                            // eslint-disable-next-line jsx-a11y/img-redundant-alt
                            <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">RT</div>
                          )}
                        </div>

                        {!readOnly && (
                          <label className="absolute bottom-0 right-0 -mr-1 -mb-1 bg-white/10 rounded-full p-1 hover:bg-white/20 cursor-pointer">
                            <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white">
                              <path d="M12 2a2 2 0 00-2 2v1H8.5A2.5 2.5 0 006 7.5V9h12V7.5A2.5 2.5 0 0015.5 5H14V4a2 2 0 00-2-2zM6 11v7.5A2.5 2.5 0 008.5 21H15.5A2.5 2.5 0 0018 18.5V11H6z" />
                            </svg>
                          </label>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white">{name}</h1>

                          <button
                            onClick={() => navigate('/leaderboard')}
                            className={`group relative overflow-hidden px-4 py-1.5 rounded-full font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95 bg-gradient-to-r ${rank !== 'Unranked' ? 'from-purple-600 to-indigo-600' : 'from-gray-500 to-gray-600'}`}
                          >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative flex items-center gap-2">
                              <Trophy className="w-4 h-4" />
                              {rank !== 'Unranked' ? `Rank #${rank}` : 'Unranked'}
                            </span>
                          </button>

                          {!readOnly && (
                            <button
                              onClick={async () => {
                                if (editingInfo) await saveProfile({ name, email, phone, yearBranch, department });
                                setEditingInfo((s) => !s);
                              }}
                              className="text-sm text-purple-700 dark:text-purple-200 bg-white/5 px-2 py-1 rounded-md"
                            >
                              {editingInfo ? 'Save' : 'Edit'}
                            </button>
                          )}
                        </div>

                        {editingInfo ? (
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-200/50 dark:border-neutral-700 px-3 py-2" />
                            <input value={yearBranch} onChange={(e) => setYearBranch(e.target.value)} placeholder="Semester/Year (e.g. TY)" className="rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-200/50 dark:border-neutral-700 px-3 py-2" />
                            <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" className="rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-200/50 dark:border-neutral-700 px-3 py-2" />
                            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-200/50 dark:border-neutral-700 px-3 py-2" />
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-200/50 dark:border-neutral-700 px-3 py-2" />
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                            <div className="font-medium">{yearBranch}{department ? ` • ${department}` : ''}</div>
                            <div className="mt-1 text-sm text-purple-700 dark:text-purple-200">{email}{phone ? ` • ${phone}` : ''}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-neutral-500">Average Rating</div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-md">
                          <Stars value={avgRating} />
                          <div className="text-sm font-semibold">{avgRating}.0</div>
                        </div>
                      </div>

                      <div className="text-xs text-neutral-400">Member since 2023</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <section className="mt-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold">Bio</h2>
                      {!readOnly && (
                        <button onClick={async () => { if (editingBio) await saveProfile({ bio }); setEditingBio((s) => !s); }} className="text-sm text-purple-700 dark:text-purple-200 bg-white/5 px-2 py-1 rounded-md">
                          {editingBio ? 'Save' : 'Edit'}
                        </button>
                      )}
                    </div>
                    {editingBio ? (
                      <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-3 w-full min-h-[100px] rounded-md bg-transparent border border-neutral-200/5 p-3" />
                    ) : (
                      <p className="mt-3 text-neutral-700 dark:text-neutral-300 leading-relaxed">{bio}</p>
                    )}

                    {/* Profiles dropdown for adding external profiles */}
                    <ProfilesWidget profiles={profiles} onAdd={handleAddProfile} onRemove={handleRemoveProfile} readOnly={readOnly} />
                  </section>

                  {/* Scheduled Sessions */}
                  <section className="mt-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold">Upcoming Schedule</h2>
                      {!readOnly && (
                        <button
                          onClick={() => navigate('/schedule')}
                          className="text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1 rounded-full hover:scale-105 transition-transform"
                        >
                          Schedule Now
                        </button>
                      )}
                    </div>

                    {schedulesList.length > 0 ? (
                      <div className="mt-4">
                        <ScheduleCard
                          schedule={schedulesList[0]}
                          currentUserId={currentUserId}
                        />
                        {schedulesList.length > 1 && (
                          <button
                            onClick={() => navigate('/schedule')}
                            className="mt-3 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                          >
                            View all {schedulesList.length} schedules
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 p-8 rounded-[2rem] bg-neutral-100 dark:bg-neutral-800/50 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-700">
                        <div className="text-neutral-500 dark:text-neutral-400">No upcoming learning meets</div>
                        {!readOnly && (
                          <button
                            onClick={() => navigate('/schedule')}
                            className="mt-3 text-sm text-purple-700 dark:text-purple-300 bg-white dark:bg-white/10 px-4 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-white/20 transition-all font-bold"
                          >
                            Schedule your first session
                          </button>
                        )}
                      </div>
                    )}
                  </section>

                  {/* Skills */}
                  <section className="mt-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold">Skills</h2>
                      <div className="flex items-center gap-2">
                        {!readOnly && (
                          <button onClick={() => setShowAddSkill(true)} className="text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1 rounded-full">
                            Add Skill
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {skills.map((s) => (
                        <div key={s.id} className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{s.name}</div>
                            <div className="text-xs text-neutral-400">{s.level}</div>
                            <div className="mt-2 h-2 w-36 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full bg-purple-500`} style={{ width: s.level === 'Beginner' ? '30%' : s.level === 'Intermediate' ? '65%' : '100%' }} />
                            </div>
                          </div>

                          {!readOnly && (
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex gap-2">
                                <button onClick={() => { const name = prompt('Edit skill name', s.name); if (name) setSkills((prev) => prev.map((x) => x.id === s.id ? { ...x, name } : x)); }} className="text-sm text-neutral-300">Edit</button>
                                <button onClick={() => removeSkill(s.id)} className="text-sm text-rose-400">Remove</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Ratings & Feedback */}
                  <section className="mt-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold">Ratings & Feedback</h2>
                      <div className="flex items-center gap-3">
                        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/50 dark:border-neutral-700 text-sm rounded-md px-2 py-1">
                          <option value="latest">Latest</option>
                          <option value="highest">Highest</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {sortedFeedback().length > 0 ? (
                        sortedFeedback().map((f, idx) => (
                          <div key={f.id + (f.date || idx)} className="p-4 rounded-lg bg-white/5">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mt-1">
                                  <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                                    {f.reviewer_name || `User ${f.id.slice(0, 8)}`}
                                  </div>
                                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
                                    {typeof f.date === 'number'
                                      ? new Date(f.date * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                      : new Date(f.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="text-xs text-neutral-400">
                                  {Array.from({ length: f.rating }).map((_, i) => (
                                    <span key={i} className="text-yellow-400">★</span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <p className="mt-3 text-neutral-700 dark:text-neutral-300">{f.text}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 rounded-lg bg-neutral-100 dark:bg-neutral-800/50 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-700">
                          <div className="text-neutral-500 dark:text-neutral-400">No ratings or feedback received yet</div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Notifications */}
                  {/* <section className="mt-8 pb-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Notifications</h2>
                  <button className="text-sm text-purple-700 dark:text-purple-300 bg-white dark:bg-white/10 px-3 py-1 rounded-md hover:bg-purple-50 dark:hover:bg-white/20">
                    Mark all as read
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-lg border transition-all ${notif.read
                          ? 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                          : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 ring-1 ring-blue-200 dark:ring-blue-800'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0">{notif.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className={`font-semibold ${notif.read ? 'text-neutral-900 dark:text-neutral-100' : 'text-blue-900 dark:text-blue-100'}`}>
                                  {notif.title}
                                </h3>
                                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{notif.description}</p>
                              </div>
                              {!notif.read && (
                                <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">{notif.timestamp}</div>
                          </div>

                          {!readOnly && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-lg">
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 rounded-lg bg-neutral-100 dark:bg-neutral-800/50 text-center">
                      <div className="text-neutral-500 dark:text-neutral-400">No notifications</div>
                    </div>
                  )}
                </div>
              </section> */}
                </>
              )}
            </main>
          </div>

          <div className="pointer-events-none absolute inset-0 rounded-lg" style={{ boxShadow: '0 0 40px rgba(124,58,237,0.35)' }} />
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddSkill && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddSkill(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-neutral-50 dark:bg-neutral-900 p-6 text-neutral-900 dark:text-neutral-100">
            <h3 className="text-lg font-bold">Add Skill</h3>
            <div className="mt-4 grid gap-3">
              <input value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} placeholder="Skill name" className="w-full rounded-md bg-transparent border border-neutral-200/5 px-3 py-2" />
              <select value={newSkillLevel} onChange={(e) => setNewSkillLevel(e.target.value as Skill['level'])} className="w-full rounded-md bg-transparent border border-neutral-200/5 px-3 py-2">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setShowAddSkill(false)} className="px-3 py-2 rounded-md bg-white/5">Cancel</button>
              <button onClick={addSkill} className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {showCrop && cropSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowCrop(false); setCropSrc(null); }} />
          <div className="relative z-10 w-full max-w-2xl rounded-lg bg-neutral-50 dark:bg-neutral-900 p-6 text-neutral-900 dark:text-neutral-100">
            <h3 className="text-lg font-bold">Crop Avatar</h3>
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2 flex items-center justify-center">
                <div className="w-56 h-56 rounded-full overflow-hidden bg-black/5 relative">
                  <img src={cropSrc} alt="crop" draggable={false} className="absolute inset-0 w-full h-full object-cover" style={{ transform: `translate(${cropX}%, ${cropY}%) scale(${cropZoom})` }} />
                  <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/30" />
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-3">
                  <label className="block text-sm font-medium">Zoom</label>
                  <input type="range" min={1} max={3} step={0.01} value={cropZoom} onChange={(e) => setCropZoom(Number(e.target.value))} className="w-full" />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium">Horizontal</label>
                  <input type="range" min={-50} max={50} step={1} value={cropX} onChange={(e) => setCropX(Number(e.target.value))} className="w-full" />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium">Vertical</label>
                  <input type="range" min={-50} max={50} step={1} value={cropY} onChange={(e) => setCropY(Number(e.target.value))} className="w-full" />
                </div>

                <div className="mt-4 flex items-center justify-end gap-3">
                  <button onClick={() => { setShowCrop(false); setCropSrc(null); }} className="px-3 py-2 rounded-md bg-white/5">Cancel</button>
                  <button onClick={saveCropped} className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white">Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Center-Aligned Pending Feedbacks Popup */}
      {showPopup && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 shadow-2xl border border-purple-500/30 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8 group overflow-hidden relative animate-in zoom-in-95 duration-300">
            {/* Animated background glow */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors" />

            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-2xl shadow-purple-500/20">
              <MessageSquare className="w-10 h-10" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 rounded-full border-4 border-white dark:border-neutral-900 flex items-center justify-center text-xs font-bold shadow-lg">
                {pendingReviews.length}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left min-w-0">
              <h3 className="text-2xl font-black text-neutral-900 dark:text-white leading-tight">Pending Feedbacks</h3>
              <p className="text-md text-neutral-500 dark:text-neutral-400 mt-2">
                You have {pendingReviews.length} session{pendingReviews.length > 1 ? 's' : ''} waiting for your feedback. Sharing your experience helps mentors grow!
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate('/schedule')}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-95 group/btn"
              >
                <span>Proceed Now</span>
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="px-6 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 dark:text-neutral-400 font-bold text-sm"
              >
                Maybe Later
              </button>
            </div>

            {/* Bottom highlight decoration */}
            <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 w-full opacity-50" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

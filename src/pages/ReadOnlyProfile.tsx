import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Github, Linkedin, Globe, Code2, Copy, Check,
  ExternalLink, Mail, Phone, GraduationCap, Trophy,
  Loader2, MessageSquare, ArrowRight, MessageCircle
} from 'lucide-react';
import { apiFetch } from '../utils/api';

function StatCard({ title, value, accent = 'bg-neutral-100 dark:bg-neutral-800/50' }: { title: string; value: string | number; accent?: string }) {
  return (
    <div className={`p-4 rounded-lg shadow-sm ${accent}`}>
      <div className="text-xs text-neutral-500 dark:text-neutral-300">{title}</div>
      <div className="mt-2 text-2xl font-extrabold text-neutral-900 dark:text-white">{value}</div>
    </div>
  );
}

export default function ReadOnlyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState<'email' | 'phone' | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        if (!id) return;
        const res = await apiFetch(`/api/profile/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  const stats = useMemo(() => {
    if (!profile) return { taught: 0, learnt: 0, skillsCount: 0, rating: '0.0' };

    const feedbackArr = profile.ratings_feedback || [];
    const avg = feedbackArr.length
      ? (feedbackArr.reduce((acc: number, f: any) => acc + f.rating, 0) / feedbackArr.length).toFixed(1)
      : '0.0';

    return {
      taught: profile.taught || 0,
      learnt: profile.learnt_from || 0,
      skillsCount: Object.keys(profile.skills || {}).length,
      rating: avg
    };
  }, [profile]);

  const initials = useMemo(() => {
    if (!profile?.name) return '??';
    return profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }, [profile]);

  const skillsList = useMemo(() => {
    if (!profile?.skills) return [];
    return Object.entries(profile.skills).map(([name, level]) => ({
      name,
      pct: level === 'Advanced' ? 90 : level === 'Intermediate' ? 65 : 35
    }));
  }, [profile]);

  const socialLinks = useMemo(() => {
    if (!profile?.profiles) return [];
    const icons: Record<string, any> = {
      github: <Github className="h-4 w-4" />,
      linkedin: <Linkedin className="h-4 w-4" />,
      leetcode: <Code2 className="h-4 w-4" />,
      portfolio: <Globe className="h-4 w-4" />
    };
    return Object.entries(profile.profiles).map(([key, url]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      url: url as string,
      icon: icons[key] || <ExternalLink className="h-4 w-4" />
    }));
  }, [profile]);

  const feedbackList = useMemo(() => {
    return (profile?.ratings_feedback || [])
      .sort((a: any, b: any) => (b.date || 0) - (a.date || 0))
      .slice(0, 5);
  }, [profile]);

  const copyToClipboard = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
          <div className="absolute inset-0 blur-xl bg-purple-500/20 animate-pulse rounded-full" />
        </div>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium animate-pulse">Syncing profile data...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT main (large) - Matches Dashboard layout */}
          <div className="lg:col-span-2 space-y-6">
            {/* Greeting card style header */}
            <div className="rounded-lg p-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm">Hey There! I'm <span className="font-bold">{profile?.name || 'User'}</span></div>
                  <div className="mt-1 text-sm opacity-90">{profile?.bio || "Learning and growing."}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold shadow-inner border border-white/20 overflow-hidden">
                    {profile?.photo ? (
                      <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : initials}
                  </div>
                </div>
              </div>
            </div>

            {/* Department & Semester - Matches Dashboard grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 flex flex-col justify-center border border-neutral-200 dark:border-neutral-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-4 w-4 text-purple-500" />
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Education</div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest mb-0.5">Class</span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 leading-tight">{profile?.semester_year || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest mb-0.5">Department</span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 leading-tight">{profile?.department || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 flex flex-col justify-center border border-neutral-200 dark:border-neutral-700/50">
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Contact Details</div>
                <div className="flex flex-col gap-2">
                  {profile?.email ? (
                    <button
                      onClick={() => copyToClipboard(profile.email, 'email')}
                      className="group flex items-center gap-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-purple-500 dark:hover:text-purple-400 transition-colors w-full text-left"
                    >
                      <div className="p-1.5 rounded-md bg-white dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 group-hover:border-purple-500/50">
                        <Mail className="h-3.5 w-3.5 text-purple-500" />
                      </div>
                      <span className="truncate flex-1">{profile.email}</span>
                      <div className="w-4 flex items-center justify-center">
                        {copied === 'email' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400" />}
                      </div>
                    </button>
                  ) : null}

                  {profile?.phone_number ? (
                    <button
                      onClick={() => copyToClipboard(profile.phone_number, 'phone')}
                      className="group flex items-center gap-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-purple-500 dark:hover:text-purple-400 transition-colors w-full text-left"
                    >
                      <div className="p-1.5 rounded-md bg-white dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 group-hover:border-purple-500/50">
                        <Phone className="h-3.5 w-3.5 text-purple-500" />
                      </div>
                      <span className="flex-1">{profile.phone_number}</span>
                      <div className="w-4 flex items-center justify-center">
                        {copied === 'phone' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400" />}
                      </div>
                    </button>
                  ) : null}

                  {!profile?.email && !profile?.phone_number && (
                    <div className="text-sm font-semibold text-neutral-400 italic">No contact info shared</div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats cards - Matches Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard title="Taught" value={stats.taught} />
              <StatCard title="Learnt From" value={stats.learnt} />
              <StatCard title="Mastered Skills" value={stats.skillsCount} />
              <StatCard title="Rating" value={`${stats.rating} / 5`} />
            </div>

            {/* Skills overview - Matches Dashboard style */}
            <div className="rounded-lg p-4 bg-neutral-100 dark:bg-neutral-800/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{profile?.name.split(' ')[0]}'s Skills</h3>
                <div className="text-xs text-neutral-400">{skillsList.length} skills</div>
              </div>

              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {skillsList.length > 0 ? skillsList.map((s) => (
                  <div key={s.name} className="min-w-[160px] p-3 rounded-lg bg-white dark:bg-neutral-700/50 shadow-sm border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm">{s.name}</div>
                      <div className="text-xs text-neutral-400">{s.pct}%</div>
                    </div>
                    <div className="mt-2 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-neutral-500 p-4 w-full text-center">No skills listed yet</div>
                )}
              </div>
            </div>

            {/* Ratings & Feedback - Matches Dashboard style */}
            <div className="rounded-lg p-4 bg-neutral-100 dark:bg-neutral-800/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Student Feedback</h3>
                <div className="text-sm text-neutral-400">{feedbackList.length} total</div>
              </div>

              <div className="space-y-3 max-h-80 overflow-auto hide-scrollbar">
                {feedbackList.map((f: any, i: number) => (
                  <div key={f.id || i} className="p-3 rounded-md bg-white dark:bg-neutral-700/50 shadow-sm border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold text-xs uppercase">
                          {f.reviewer_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-xs">{f.reviewer_name || "SkillSwap Student"}</div>
                          <div className="text-[10px] text-neutral-400">
                            {f.date ? new Date(f.date * 1000).toLocaleDateString() : 'Recent'}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-black text-amber-500">{f.rating}.0 ★</div>
                    </div>
                    <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 italic">"{f.text}"</p>
                  </div>
                ))}
                {feedbackList.length === 0 && (
                  <div className="text-center py-6 text-neutral-500 text-sm">No reviews yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT Sidebar - Matches Dashboard */}
          <aside className="space-y-6">
            {/* Profiles */}
            <div className="rounded-lg p-4 bg-neutral-100 dark:bg-neutral-800/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Profiles</h4>
                <div className="text-xs text-neutral-400">{socialLinks.length}</div>
              </div>
              <div className="space-y-2">
                {socialLinks.length > 0 ? socialLinks.map((p) => (
                  <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="p-2 rounded-md bg-white dark:bg-neutral-700/50 flex items-center gap-3 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700">
                    <div className="text-purple-600 dark:text-purple-400">{p.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-[10px] text-neutral-400 truncate">{p.url.replace(/^https?:\/\//, '')}</div>
                    </div>
                  </a>
                )) : (
                  <div className="text-xs text-neutral-500 italic p-2 text-center">No social links shared</div>
                )}
              </div>
            </div>

            {/* Quick Actions / Connect */}
            <div className="rounded-lg p-4 bg-neutral-100 dark:bg-neutral-800/50">
              <h4 className="font-semibold mb-4 text-sm">Quick Actions</h4>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => {
                    if (profile?.phone_number) {
                      const currentUser = localStorage.getItem('user_name') || "SkillSwap User";
                      const message = `Hey there! Its ${currentUser}`;
                      const phone = profile.phone_number.replace(/\D/g, '');

                      const encoded = encodeURIComponent(message);
                      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                      const url = isIOS
                        ? `sms:${phone}&body=${encoded}`
                        : `sms:${phone}?body=${encoded}`;

                      window.location.href = url;
                    } else {
                      navigate(`/messages/${profile?.user_id}`);
                    }
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{profile?.phone_number ? 'Send SMS' : 'Send Message'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                {profile?.phone_number && (
                  <button
                    onClick={() => {
                      const currentUser = localStorage.getItem('user_name') || "SkillSwap User";
                      // Remove non-numeric characters, but keep country code if present (though user said no + sign, commonly APIs handle clean numbers better, let's just strip non-digits)
                      const cleanPhone = profile.phone_number.replace(/\D/g, '');
                      const text = encodeURIComponent(`Hey there! Its ${currentUser}`);
                      window.open(`https://web.whatsapp.com/send?phone=${cleanPhone}&text=${text}`, '_blank');
                    }}
                    className="w-full py-2.5 bg-[#25D366] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Achievements / Points - Matches Dashboard */}
            <div className="rounded-xl p-6 bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-500">Achievements</h4>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Rank Badge */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-purple-100 uppercase tracking-widest opacity-80">Global Rank</span>
                      <span className="text-2xl font-black text-white tracking-tighter">
                        {profile?.rank ? `#${profile.rank}` : "Unranked"}
                      </span>
                    </div>
                    <Trophy className="h-8 w-8 text-white/20" />
                  </div>

                  {/* Score Badge */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Growth Points</span>
                      <span className="text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tighter">
                        {profile?.total_score || 0}
                      </span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}

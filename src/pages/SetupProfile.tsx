import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SetupProfile() {
    const navigate = useNavigate();
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('access_token');

    const [avatar, setAvatar] = useState<string | null>(null);
    const [cls, setCls] = useState('FY');
    const [department, setDepartment] = useState('Computer');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('+91');
    const [profiles, setProfiles] = useState<{ id: string; key: string; url: string }[]>([]);
    const [skills, setSkills] = useState<{ id: string; name: string; level: string }[]>([]);
    const [loading, setLoading] = useState(false);

    // Profile fields state
    const [selectedService, setSelectedService] = useState('github');
    const [profileUrl, setProfileUrl] = useState('');
    const [profileError, setProfileError] = useState<string | null>(null);

    // Skill fields state
    const [skillName, setSkillName] = useState('');
    const [skillLevel, setSkillLevel] = useState('Beginner');

    const services = [
        { key: 'github', label: 'GitHub', domain: 'github.com' },
        { key: 'hackerrank', label: 'HackerRank', domain: 'hackerrank.com' },
        { key: 'codechef', label: 'CodeChef', domain: 'codechef.com' },
        { key: 'leetcode', label: 'LeetCode', domain: 'leetcode.com' },
        { key: 'portfolio', label: 'Portfolio', domain: '' },
    ];

    function validateUrl(key: string, val: string) {
        try {
            const u = new URL(val);
            const svc = services.find(s => s.key === key);
            if (!svc) return false;
            if (!svc.domain) return !!u.hostname;
            return u.hostname.includes(svc.domain);
        } catch {
            return false;
        }
    }

    const addProfile = () => {
        if (!profileUrl.trim()) return;
        if (!validateUrl(selectedService, profileUrl)) {
            setProfileError(`Please enter a valid URL for ${selectedService}`);
            return;
        }
        setProfiles([...profiles, { id: Date.now().toString(), key: selectedService, url: profileUrl }]);
        setProfileUrl('');
        setProfileError(null);
    };

    const addSkill = () => {
        if (!skillName.trim()) return;
        setSkills([...skills, { id: Date.now().toString(), name: skillName, level: skillLevel }]);
        setSkillName('');
        setSkillLevel('Beginner');
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatar(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleFinish = async () => {
        if (profiles.length === 0) {
            setProfileError("Please add at least one social profile.");
            return;
        }

        setLoading(true);
        try {
            const profilesObj: Record<string, string> = {};
            profiles.forEach(p => { profilesObj[p.key] = p.url; });

            const skillsObj: Record<string, string> = {};
            skills.forEach(s => { skillsObj[s.name] = s.level; });

            const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    photo: avatar,
                    semester_year: cls,
                    department,
                    bio,
                    profiles: profilesObj,
                    skills: skillsObj,
                    phone_number: phone
                })
            });

            if (res.ok) {
                navigate('/signin');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 relative bg-black font-sans">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-purple-950 to-black opacity-90" />

            <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-[2rem] overflow-hidden shadow-2xl border border-purple-500/10 ring-1 ring-white/5 flex flex-col md:flex-row">

                {/* Left Panel - Visual Branding */}
                <div className="w-full md:w-1/3 bg-gradient-to-br from-purple-700 to-indigo-800 p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100" fill="white" />
                        </svg>
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-black text-white leading-tight">Setup Your Profile</h1>
                        <p className="mt-4 text-purple-100 text-sm opacity-80">Join the elite network of peer learners. Let others know what you bring to the table.</p>
                    </div>
                    <div className="relative z-10 mt-12 md:mt-0">
                        <div className="h-1 w-12 bg-white/30 rounded-full" />
                        <p className="mt-4 text-[10px] uppercase font-bold tracking-[0.2em] text-white/50">Peer-to-Peer Learning Platform</p>
                    </div>
                </div>

                {/* Right Panel - Form Content */}
                <div className="flex-1 p-8 md:p-12 max-h-[90vh] overflow-y-auto hide-scrollbar">
                    <div className="space-y-10">

                        {/* 1. Avatar and Basic Info */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="relative group shrink-0">
                                    <div className="h-24 w-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-2 border-dashed border-purple-500/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-purple-500/50 shadow-inner">
                                        {avatar ? (
                                            <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            <svg className="h-8 w-8 text-neutral-400 group-hover:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                            </svg>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Profile Photo</h3>
                                    <p className="text-xs text-neutral-500">Tap the box to upload your picture.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Class</label>
                                    <select
                                        value={cls}
                                        onChange={(e) => setCls(e.target.value)}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                    >
                                        {['FY', 'SY', 'TY', 'BE'].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Department</label>
                                    <select
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                    >
                                        {['Computer', 'IT', 'AIDS', 'ENTC'].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Phone Number (WhatsApp)</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val.startsWith('+91')) {
                                            // Allow only digits after +91
                                            const digits = val.slice(3).replace(/\D/g, '');
                                            if (digits.length <= 10) {
                                                setPhone('+91' + digits);
                                            }
                                        }
                                    }}
                                    placeholder="+91 1234567890"
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Short Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all min-h-[80px] resize-none"
                                />
                            </div>
                        </section>

                        <hr className="border-neutral-100 dark:border-neutral-800" />

                        {/* 2. Social Profiles */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                Social Profiles <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">At least one</span>
                            </h3>
                            <div className="flex gap-2">
                                <select
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm outline-none"
                                >
                                    {services.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                </select>
                                <div className="flex-1 relative">
                                    <input
                                        value={profileUrl}
                                        onChange={(e) => setProfileUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                    <button
                                        onClick={addProfile}
                                        className="absolute right-1.5 top-1.5 h-7 w-7 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {profileError && <p className="text-xs text-rose-500 ml-1">{profileError}</p>}

                            <div className="flex flex-wrap gap-2">
                                {profiles.map(p => (
                                    <div key={p.id} className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                                        <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">{p.key}</span>
                                        <button onClick={() => setProfiles(profiles.filter(x => x.id !== p.id))} className="text-purple-400 hover:text-rose-500 transition-colors">
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <hr className="border-neutral-100 dark:border-neutral-800" />

                        {/* 3. Skills */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Technical Skills</h3>
                            <div className="flex gap-2">
                                <input
                                    value={skillName}
                                    onChange={(e) => setSkillName(e.target.value)}
                                    placeholder="Skill (e.g. Python)"
                                    className="flex-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                                <select
                                    value={skillLevel}
                                    onChange={(e) => setSkillLevel(e.target.value)}
                                    className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm outline-none"
                                >
                                    {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                                <button
                                    onClick={addSkill}
                                    className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shrink-0"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {skills.map(s => (
                                    <div key={s.id} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 group flex items-start justify-between">
                                        <div>
                                            <div className="text-sm font-semibold">{s.name}</div>
                                            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">{s.level}</div>
                                        </div>
                                        <button onClick={() => setSkills(skills.filter(x => x.id !== s.id))} className="text-neutral-400 hover:text-rose-500 transition-colors mt-0.5">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="pt-6">
                            <button
                                onClick={handleFinish}
                                disabled={loading}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-lg shadow-xl shadow-purple-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                            >
                                {loading ? 'Finalizing...' : 'Finish Registration'}
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

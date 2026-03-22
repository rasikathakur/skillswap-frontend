import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Type, Search, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import ScheduleCard from '../components/ScheduleCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserProfile {
    user_id: string;
    name: string;
    email: string;
    photo?: string;
    department?: string;
}

export default function SchedulePage() {
    const [mounted, setMounted] = useState(false);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [personName, setPersonName] = useState('');
    const [selectedPerson, setSelectedPerson] = useState<UserProfile | null>(null);
    const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
    const [roleScheduler, setRoleScheduler] = useState<'learner' | 'mentor'>('learner');
    const [loading, setLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        fetchSchedules();
    }, []);

    const [schedulesList, setSchedulesList] = useState<any[]>([]);
    const fetchSchedules = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_BASE_URL}/api/schedule/list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === 'success') {
                setSchedulesList(data.schedules);
            }
        } catch (err) {
            console.error('Failed to fetch schedules:', err);
        } finally {
            setIsDataLoading(false);
        }
    };

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (personName.length < 2 || selectedPerson?.name === personName) {
                setSuggestions([]);
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/profile/mentors/all?query=${encodeURIComponent(personName)}`);
                const data = await res.json();
                if (data.status === 'success') {
                    // Filter out current user
                    const userId = localStorage.getItem('user_id');
                    setSuggestions(data.mentors.filter((p: UserProfile) => p.user_id !== userId).slice(0, 5));
                }
            } catch (err) {
                console.error('Failed to fetch suggestions:', err);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [personName, selectedPerson]);

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPerson) {
            setError('Please select a person from the suggestions');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');

            const res = await fetch(`${API_BASE_URL}/api/schedule/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    date,
                    time,
                    participant_id: selectedPerson.user_id,
                    participant_name: selectedPerson.name,
                    participant_email: selectedPerson.email,
                    role_scheduler: roleScheduler
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Failed to schedule session');

            setSuccess(true);
            setTitle('');
            setDate('');
            setTime('');
            setPersonName('');
            setSelectedPerson(null);
            fetchSchedules();

            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (isDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-purple-500/20 animate-pulse rounded-full" />
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 font-medium animate-pulse">Fetching your sessions...</p>
            </div>
        );
    }

    return (
        <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Schedule Session
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Plan your next peer learning meet. We'll notify both of you!
                    </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400">
                    <Calendar className="h-6 w-6" />
                </div>
            </div>

            <div className="max-w-2xl bg-white dark:bg-neutral-800/50 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-700 shadow-2xl shadow-purple-500/5 backdrop-blur-xl relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -transe-y-1/2 translate-x-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                <form onSubmit={handleSchedule} className="space-y-6 relative z-10">
                    {/* Title Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Session Title</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Type className="h-5 w-5 text-neutral-400 group-focus-within:text-purple-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. React Hooks Deep Dive"
                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-neutral-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Date</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-neutral-400 group-focus-within:text-purple-500 transition-colors" />
                                </div>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-neutral-900 dark:text-white color-scheme-dark"
                                />
                            </div>
                        </div>

                        {/* Time Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Time</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Clock className="h-5 w-5 text-neutral-400 group-focus-within:text-purple-500 transition-colors" />
                                </div>
                                <input
                                    type="time"
                                    required
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-neutral-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Person Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Schedule With</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-neutral-400 group-focus-within:text-purple-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                required
                                value={personName}
                                onChange={(e) => {
                                    setPersonName(e.target.value);
                                    if (selectedPerson && e.target.value !== selectedPerson.name) setSelectedPerson(null);
                                }}
                                placeholder="Search by name..."
                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-neutral-900 dark:text-white"
                            />

                            {/* Suggestions dropdown */}
                            {suggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    {suggestions.map((p) => (
                                        <button
                                            key={p.user_id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedPerson(p);
                                                setPersonName(p.name);
                                                setSuggestions([]);
                                            }}
                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors border-b last:border-0 border-neutral-100 dark:border-neutral-700"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                                                {p.photo ? <img src={p.photo} alt={p.name} className="w-full h-full object-cover" /> : p.name.charAt(0)}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-semibold text-neutral-900 dark:text-white">{p.name}</div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">{p.department || 'Student'}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">You are</label>
                        <div className="flex p-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setRoleScheduler('learner')}
                                className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${roleScheduler === 'learner'
                                    ? 'bg-white dark:bg-neutral-800 text-purple-600 dark:text-purple-400 shadow-md translate-p-y-0'
                                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                                    }`}
                            >
                                Learner
                            </button>
                            <button
                                type="button"
                                onClick={() => setRoleScheduler('mentor')}
                                className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${roleScheduler === 'mentor'
                                    ? 'bg-white dark:bg-neutral-800 text-purple-600 dark:text-purple-400 shadow-md translate-p-y-0'
                                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                                    }`}
                            >
                                Mentor
                            </button>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
                            {roleScheduler === 'learner'
                                ? "You'll be guided by the peer you're scheduling with."
                                : "You'll be sharing your knowledge with the peer."}
                        </p>
                    </div>

                    {/* Success/Error displays */}
                    {success && (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl text-emerald-700 dark:text-emerald-400 animate-in zoom-in-95 duration-300">
                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                            <p className="text-sm font-medium">Session scheduled successfully! Both of you will received a WhatsApp notification.</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-700 dark:text-rose-400 animate-in zoom-in-95 duration-300">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl py-4 font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                Schedule & Notify
                            </>
                        )}
                    </button>
                </form>
            </div>
            {/* Helper cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/40 dark:bg-neutral-800/20 backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-neutral-700/30">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                        <Search className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1">Find Peers</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Search from thousands of learners and mentors in the community.</p>
                </div>
                <div className="bg-white/40 dark:bg-neutral-800/20 backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-neutral-700/30">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                        <Clock className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1">Stay Notified</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Automated WhatsApp alerts right before the meeting starts.</p>
                </div>
                <div className="bg-white/40 dark:bg-neutral-800/20 backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-neutral-700/30">
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400 mb-4">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1">Grow Together</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Share knowledge, clear doubts, and build your technical profile.</p>
                </div>
            </div>

            {/* All Schedules List */}
            <div className="mt-16 relative">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Upcoming Learning Meets</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Your confirmed sessions in order of priority</p>
                    </div>
                </div>

                {schedulesList.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {schedulesList.map((s: any) => (
                            <ScheduleCard
                                key={s.id}
                                schedule={s}
                                currentUserId={localStorage.getItem('user_id') || ''}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-12 rounded-[2rem] bg-neutral-100 dark:bg-neutral-800/30 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-700">
                        <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-neutral-400">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No schedules found</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto text-sm">Use the form above to schedule your first learning session with a peer.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

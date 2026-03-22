import { useState, useEffect } from 'react';
import { Loader2, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

interface Mentor {
    user_id: string;
    name: string;
    department: string;
    semester_year: string;
    email: string;
    photo: string | null;
    bio: string | null;
    skills: Record<string, string>;
    ratings_feedback: any[];
    phone_number?: string;
}

export default function FindMentors() {
    const [query, setQuery] = useState('');
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMentors(query);
        }, 400); // 400ms debounce
        return () => clearTimeout(timer);
    }, [query]);

    const fetchMentors = async (searchQuery: string = '') => {
        setLoading(true);
        try {
            const url = searchQuery
                ? `/api/profile/mentors/all?query=${encodeURIComponent(searchQuery)}`
                : `/api/profile/mentors/all`;

            const res = await apiFetch(url);
            if (!res.ok) throw new Error('Failed to fetch mentors');

            const data = await res.json();
            const currentUserId = localStorage.getItem('user_id');
            setMentors((data.mentors || []).filter((m: any) => m.user_id !== currentUserId));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Find Mentors</h1>

                <form onSubmit={(e) => e.preventDefault()} className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search by name or language (e.g. Java, C++)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                    <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <button type="submit" className="hidden">Search</button>
                </form>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="relative">
                        <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
                        <div className="absolute inset-0 blur-xl bg-purple-500/20 animate-pulse rounded-full" />
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium animate-pulse">Finding mentors for you...</p>
                </div>
            ) : error ? (
                <div className="text-center py-12 text-rose-500">{error}</div>
            ) : mentors.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 italic">No mentors found matching your search.</div>
            ) : (
                <div className="flex flex-col gap-6 w-full">
                    {mentors.map((mentor) => (
                        <MentorCard key={mentor.user_id} mentor={mentor} />
                    ))}
                </div>
            )}
        </div>
    );
}

function MentorCard({ mentor }: { mentor: Mentor }) {
    const navigate = useNavigate();

    // Calculate average rating (only for received reviews)
    const receivedFeedback = (mentor.ratings_feedback || []).filter((f: any) => f.mentor === mentor.user_id);
    const avgRating = receivedFeedback.length > 0
        ? (receivedFeedback.reduce((acc, f: any) => acc + (f.rating || 0), 0) / receivedFeedback.length).toFixed(1)
        : "0.0";

    const skills = Object.keys(mentor.skills || {}).slice(0, 4);

    return (
        <div className="group relative w-full p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all duration-300 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {/* Compact Avatar */}
                <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-purple-500/10 group-hover:ring-purple-500/30 transition-all shadow-lg">
                        {mentor.photo ? (
                            <img src={mentor.photo} alt={mentor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black">
                                {mentor.name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 flex flex-col min-w-0 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white truncate group-hover:text-purple-500 transition-colors">
                                {mentor.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-black px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md uppercase tracking-tight">
                                    {mentor.department}
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400">
                                    • {mentor.semester_year}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                                <Trophy className="h-3 w-3 text-amber-500 fill-current" />
                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">{avgRating}</span>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{receivedFeedback.length} Reviews</span>
                        </div>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 italic mb-3">
                        {mentor.bio ? `"${mentor.bio}"` : "No bio provided."}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                        <div className="flex flex-wrap gap-1.5">
                            {skills.map((skill) => (
                                <span key={skill} className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300 text-[10px] font-bold border border-neutral-200 dark:border-neutral-600 transition-all">
                                    {skill}
                                </span>
                            ))}
                            {Object.keys(mentor.skills || {}).length > 4 && (
                                <span className="text-[10px] text-neutral-400 font-bold">+{Object.keys(mentor.skills || {}).length - 4} more</span>
                            )}
                        </div>

                        <button
                            onClick={() => navigate(`/profile/view/${mentor.user_id}`)}
                            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-purple-500/10"
                        >
                            View Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

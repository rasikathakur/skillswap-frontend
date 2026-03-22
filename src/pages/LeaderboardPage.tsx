import { useEffect, useState } from 'react';
import { Trophy, Globe, Code, Languages, ChevronRight, User } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const games = [
    { id: '302034fb-33f5-4eb5-aecf-344b23965ea2', name: 'Code Completion' },
    { id: 'a32e3489-9db0-4f05-89ce-fe8596aa02f0', name: 'Debugging Race' },
    { id: 'bbd4f28e-aedf-4cae-a712-f87822f40df6', name: 'Concept Match' },
    { id: 'e934111c-676b-4c84-9fe7-95ba55326514', name: 'Code Rearrangement' },
];

const languages = [
    'Python', 'JavaScript', 'Java', 'C++', 'C', 'C#', 'Swift', 'SQL', 'NoSQL'
];

type LeaderboardEntry = {
    user_id: string;
    name: string;
    photo?: string;
    score: number;
    rank: number;
};

export default function LeaderboardPage() {
    const [category, setCategory] = useState<'global' | 'game' | 'language'>('global');
    const [selectedGame, setSelectedGame] = useState(games[0].id);
    const [selectedLang, setSelectedLang] = useState(languages[0]);
    const [data, setData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [category, selectedGame, selectedLang]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/api/games/leaderboard?category=${category}`;
            if (category === 'game') url += `&game_id=${selectedGame}`;
            if (category === 'language') url += `&language=${selectedLang}`;

            const res = await fetch(url);
            const output = await res.json();
            if (output.status === 'success') {
                setData(output.leaderboard);
            }
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Global Leaderboard
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1 italic">
                        "The distance between dreams and reality is called action."
                    </p>
                </div>
                <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-lg hidden md:block" />
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-neutral-800/50 p-2 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-xl flex flex-wrap gap-2">
                <button
                    onClick={() => setCategory('global')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${category === 'global' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
                >
                    <Globe className="w-5 h-5" />
                    <span>Global</span>
                </button>
                <button
                    onClick={() => setCategory('game')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${category === 'game' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
                >
                    <Code className="w-5 h-5" />
                    <span>Game-wise</span>
                </button>
                <button
                    onClick={() => setCategory('language')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${category === 'language' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
                >
                    <Languages className="w-5 h-5" />
                    <span>Language-wise</span>
                </button>
            </div>

            {/* Sub-filters (Game/Language) */}
            {category !== 'global' && (
                <div className="flex gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    {category === 'game' ? (
                        <select
                            value={selectedGame}
                            onChange={(e) => setSelectedGame(e.target.value)}
                            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    ) : (
                        <select
                            value={selectedLang}
                            onChange={(e) => setSelectedLang(e.target.value)}
                            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            {languages.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    )}
                </div>
            )}

            {/* Leaderboard List */}
            <div className="bg-white dark:bg-neutral-800/50 rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden backdrop-blur-xl">
                {loading ? (
                    <div className="p-20 flex flex-col items-center gap-4 text-neutral-500">
                        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                        <p className="font-medium">Scaling the heights...</p>
                    </div>
                ) : data.length > 0 ? (
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
                        {data.map((entry) => (
                            <div key={entry.user_id} className="p-4 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors group">
                                {/* Rank */}
                                <div className={`w-12 h-12 flex items-center justify-center font-black text-xl rounded-2xl ${entry.rank === 1 ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-500/40' : entry.rank === 2 ? 'bg-neutral-300 text-neutral-700' : entry.rank === 3 ? 'bg-amber-600 text-amber-50' : 'text-neutral-400'}`}>
                                    {entry.rank}
                                </div>

                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white overflow-hidden shadow-lg border-2 border-white dark:border-neutral-600">
                                    {entry.photo ? <img src={entry.photo} alt={entry.name} className="w-full h-full object-cover" /> : <User className="w-6 h-6" />}
                                </div>

                                {/* Identity */}
                                <div className="flex-1">
                                    <div className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                        {entry.name}
                                    </div>
                                    <div className="text-xs text-neutral-500 uppercase tracking-tighter">
                                        {category === 'global' ? 'Overall Master' : category === 'game' ? 'Challenge Pro' : `${selectedLang} Expert`}
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="text-right">
                                    <div className="text-2xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
                                        {entry.score}
                                    </div>
                                    <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Points</div>
                                </div>

                                <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:translate-x-1 transition-transform" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center text-neutral-500">
                        <Trophy className="w-16 h-16 mx-auto opacity-20 mb-4" />
                        <h3 className="text-xl font-bold">No data yet</h3>
                        <p className="mt-1">Be the first to create history in this category!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

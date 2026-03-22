import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Timer } from 'lucide-react';
import RatingModal from './RatingModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Schedule {
    id: string;
    title: string;
    date: string;
    time: string;
    scheduler_id: string;
    participant_id: string;
    scheduler_name: string;
    scheduler_photo?: string;
    participant_name: string;
    participant_photo?: string;
    rated_by_scheduler?: boolean;
    rated_by_participant?: boolean;
}

export default function ScheduleCard({ schedule, currentUserId }: { schedule: Schedule; currentUserId: string }) {
    const isScheduler = schedule.scheduler_id === currentUserId;
    const otherName = isScheduler ? schedule.participant_name : schedule.scheduler_name;
    const otherPhoto = isScheduler ? schedule.participant_photo : schedule.scheduler_photo;

    const [alreadyRated, setAlreadyRated] = useState(isScheduler ? schedule.rated_by_scheduler : schedule.rated_by_participant);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [showRating, setShowRating] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [existingFeedback, setExistingFeedback] = useState<{ rating: number, text: string } | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleViewReview = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_BASE_URL}/api/profile/${currentUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === 'success') {
                const feedback = data.profile.ratings_feedback || [];
                // Find review given for THIS schedule
                const review = feedback.find((f: any) => f.schedule_id === Number(schedule.id) && f.id === currentUserId);
                if (review) {
                    setExistingFeedback({ rating: review.rating, text: review.text });
                    setShowReview(true);
                } else {
                    alert("Could not find the review details.");
                }
            }
        } catch (err) {
            console.error('Failed to fetch review:', err);
        }
    };

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const targetStr = `${schedule.date}T${schedule.time}`;
            const target = new Date(targetStr);

            const diff = target.getTime() - now.getTime();

            if (diff <= 0) {
                const oneMinuteAfter = diff <= -60000;
                setTimeLeft(oneMinuteAfter ? 'Completed' : 'Started');
                setIsCompleted(true);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            let timeStr = '';
            if (days > 0) timeStr += `${days}d `;
            if (hours > 0 || days > 0) timeStr += `${hours}h `;
            timeStr += `${minutes}m to go`;

            setTimeLeft(timeStr);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000);
        return () => clearInterval(timer);
    }, [schedule]);

    const handleRatingSubmit = async (rating: number, review: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_BASE_URL}/api/schedule/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    schedule_id: schedule.id,
                    rating,
                    review
                })
            });
            if (res.ok) {
                setAlreadyRated(true);
                setShowRating(false);
            }
        } catch (err) {
            console.error('Failed to submit rating:', err);
        }
    };

    return (
        <>
            <div className="group relative bg-white dark:bg-neutral-800/40 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700/50 rounded-[2rem] p-6 transition-all hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 overflow-hidden">
                {/* Decorative gradient corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl group-hover:from-purple-500/20 transition-colors" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-lg">
                                {otherPhoto ? <img src={otherPhoto} alt={otherName} className="w-full h-full object-cover" /> : otherName.charAt(0)}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center shadow-md ${isScheduler ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                                <User className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-purple-500 transition-colors uppercase tracking-tight">
                                {schedule.title}
                            </h4>
                            <div className="flex flex-col gap-0.5 mt-0.5">
                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                    Scheduled {isScheduler ? 'by' : 'with'}: <span className="text-neutral-900 dark:text-neutral-200">You</span>
                                </span>
                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                    Scheduled {isScheduler ? 'with' : 'by'}: <span className="text-neutral-900 dark:text-neutral-200">{otherName}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-900/50 rounded-xl">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{new Date(schedule.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-900/50 rounded-xl">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{schedule.time}</span>
                        </div>

                        {isCompleted ? (
                            alreadyRated ? (
                                <button
                                    onClick={handleViewReview}
                                    className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-900/50 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors rounded-xl border border-neutral-200 dark:border-neutral-700"
                                >
                                    <Timer className="w-4 h-4 text-neutral-500" />
                                    <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Completed</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowRating(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all border border-purple-500/20"
                                >
                                    <Timer className="w-4 h-4 animate-pulse" />
                                    <span className="text-sm font-black tracking-tight">Rate & Review</span>
                                </button>
                            )
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-200 dark:border-purple-500/20">
                                <Timer className="w-4 h-4 animate-pulse" />
                                <span className="text-sm font-black tracking-tight">{timeLeft}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showRating && (
                <RatingModal
                    otherName={otherName}
                    onClose={() => setShowRating(false)}
                    onSubmit={handleRatingSubmit}
                />
            )}
            {showReview && existingFeedback && (
                <RatingModal
                    otherName={otherName}
                    onClose={() => setShowReview(false)}
                    onSubmit={() => { }}
                    readOnly={true}
                    initialRating={existingFeedback.rating}
                    initialReview={existingFeedback.text}
                />
            )}
        </>
    );
}

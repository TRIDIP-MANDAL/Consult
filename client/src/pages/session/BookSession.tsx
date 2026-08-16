import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { callApi } from '../../config/api.ts';
import { decodeId } from '../../lib/HashIds.ts';
import Loading from '../../component/Loading.tsx';

interface MiniMentorData {
    mentorName: string;
    mentorImage: string | null;
    charge: number;
    currency: string;
    available_from: string | null;
    available_to: string | null;
}

const BookSession: React.FC = () => {
    const { hash } = useParams<{ hash: string }>();
    const mentorId = decodeId(hash);
    const location = useLocation();
    const navigate = useNavigate();

    const mentorData = location.state as MiniMentorData | null;

    const [error, setError] = useState<string | null>(null);
    const [duration, setDuration] = useState<string>('30');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const todayStr = new Date().toISOString().split('T')[0];

    const getLocalHHMM = (isoString: string) => {
        const d = new Date(isoString);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    const minTime = mentorData?.available_from ? getLocalHHMM(mentorData.available_from) : null;
    const maxTime = mentorData?.available_to ? getLocalHHMM(mentorData.available_to) : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (scheduledDate < todayStr) {
            setError("Please select a date from today onwards.");
            return;
        }

        if (minTime && maxTime) {
            const getMins = (t: string) => {
                const [h, m] = t.split(':').map(Number);
                return h * 60 + m;
            };

            const selectedMins = getMins(scheduledTime);
            const startMins = getMins(minTime);
            const endMins = getMins(maxTime);
            const durationMins = Number(duration);

            if (selectedMins < startMins) {
                setError(`The session cannot start before ${minTime}.`);
                return;
            }
            if (selectedMins + durationMins > endMins) {
                setError(`The session (including ${duration} mins duration) exceeds the mentor's availability ending at ${maxTime}.`);
                return;
            }
        }

        setIsSubmitting(true);
        const bookingData = {
            mentor_id: mentorId,
            duration: duration,
            scheduled_date: scheduledDate ? new Date(scheduledDate).toISOString() : null,
            scheduled_time: scheduledTime ? new Date(`1970-01-01T${scheduledTime}`).toISOString() : null,
            cost: Number(mentorData?.charge || 0) * Number(duration || 0),
            currency: mentorData?.currency
        };
        console.log("Submitting booking:", bookingData);
        setLoading(true);
        try {
            const res = await callApi(`/bookservice/create/${mentorId}`, 'POST', bookingData);
            console.log("response after creating session", res);
            if (res.success) {
                setShowSuccessPopup(true);
                setTimeout(() => {
                    navigate('/my-sessions');
                }, 3000);
            } else {
                setError(res.message || "Failed to book session.");
            }
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    if (!mentorData) return <Loading text='Loading mentor data...'/>;

    const formatDisplayTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    if(loading) return <Loading text='Processing your request. Please...'/>
    return (
        <div className="max-w-md mx-auto my-12 p-8 border border-gray-800 rounded-2xl bg-gray-900/50 backdrop-blur-xl shadow-2xl relative">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Book Session</h2>
            
            <div className="space-y-3 mb-8 bg-gray-800/40 p-5 rounded-xl border border-gray-700/50">
                <p className="text-sm text-gray-300 flex justify-between items-center">
                    <strong className="text-gray-400 font-medium">Mentor</strong> 
                    <span className="font-semibold text-white">{mentorData.mentorName}</span>
                </p>
                <p className="text-sm text-gray-300 flex justify-between items-center">
                    <strong className="text-gray-400 font-medium">Rate</strong> 
                    <span className="text-white">{mentorData.charge} {mentorData.currency}/min</span>
                </p>
                {mentorData.available_from && mentorData.available_to && (
                    <p className="text-sm text-gray-300 flex justify-between items-center">
                        <strong className="text-gray-400 font-medium">Availability</strong> 
                        <span className="text-white">{formatDisplayTime(mentorData.available_from)} - {formatDisplayTime(mentorData.available_to)}</span>
                    </p>
                )}
                <div className="h-px bg-gray-700/50 my-2"></div>
                <p className="text-sm text-gray-300 flex justify-between items-center">
                    <strong className="text-gray-400 font-medium">Estimated Cost</strong> 
                    <span className="text-lg font-bold text-emerald-400">{mentorData.charge * Number(duration)} {mentorData.currency}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <label className="flex flex-col text-sm font-medium text-gray-300">
                    Duration (minutes)
                    <input
                        type="number"
                        min="15"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="block w-full px-4 py-3 mt-1.5 bg-gray-950/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                        style={{ colorScheme: 'dark' }}
                    />
                </label>

                <div className="flex flex-col sm:flex-row gap-5">
                    <label className="flex flex-col flex-1 text-sm font-medium text-gray-300">
                        Date
                        <input
                            type="date"
                            required
                            min={todayStr}
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="block w-full px-4 py-3 mt-1.5 bg-gray-950/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                            style={{ colorScheme: 'dark' }}
                        />
                    </label>

                    <label className="flex flex-col flex-1 text-sm font-medium text-gray-300">
                        Time
                        <input
                            type="time"
                            required
                            min={minTime || undefined}
                            max={maxTime || undefined}
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="block w-full px-4 py-3 mt-1.5 bg-gray-950/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                            style={{ colorScheme: 'dark' }}
                        />
                    </label>
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3.5 mt-4 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-violet-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg hover:shadow-violet-600/25 transition-all duration-200"
                >
                    {isSubmitting ? 'Submitting...' : 'Request Session'}
                </button>
            </form>

            {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm text-center font-medium">{error}</p>
                </div>
            )}

            {/* Success Popup Modal */}
            {showSuccessPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all">
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Request Sent!</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            Your session request has been sent to the mentor. You will be notified once they approve it.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BookSession;

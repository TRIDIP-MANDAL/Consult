import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

interface MiniMentorData {
    mentorName: string;
    mentorImage: string | null;
    charge: number;
    currency: string;
    available_from: string | null;
    available_to: string | null;
}

const BookSession: React.FC = () => {
    const { mentorId } = useParams<{ mentorId: string }>();
    const location = useLocation();

    const mentorData = location.state as MiniMentorData | null;

    const [error, setError] = useState<string |  null>(null);
    const [duration, setDuration] = useState<string>('30');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');

    const todayStr = new Date().toISOString().split('T')[0];

    // Helper to get local "HH:mm" from an ISO string
    const getLocalHHMM = (isoString: string) => {
        const d = new Date(isoString);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    const minTime = mentorData?.available_from ? getLocalHHMM(mentorData.available_from) : null;
    const maxTime = mentorData?.available_to ? getLocalHHMM(mentorData.available_to) : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Date Validation
        if (scheduledDate < todayStr) {
            setError("Please select a date from today onwards.");
            return;
        }

        // Time & Duration Validation
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
        
        const bookingData = {
            mentor_id: mentorId,
            duration: duration,
            scheduled_date: scheduledDate ? new Date(scheduledDate).toISOString() : null,
            scheduled_time: scheduledTime ? new Date(`1970-01-01T${scheduledTime}`).toISOString() : null,
            cost: ( mentorData?.charge || 0)*Number(duration || 0),
            currency: mentorData?.currency
        };
        
        console.log("Submitting booking:", bookingData);
        // Example API call:
        // await callApi('/booking', 'POST', bookingData);
    };

    if (!mentorData) return <div>Loading mentor data...</div>;

    const formatDisplayTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem', border: '1px solid #333', borderRadius: '8px' }}>
            <h2>Book Session</h2>
            <p><strong>Mentor:</strong> {mentorData.mentorName}</p>
            <p><strong>Charge:</strong> {mentorData.charge} {mentorData.currency}/minute</p>
            {mentorData.available_from && mentorData.available_to && (
                <p><strong>Availability:</strong> {formatDisplayTime(mentorData.available_from)} to {formatDisplayTime(mentorData.available_to)}</p>
            )}

            <p><strong>Calculated Cost:</strong> {mentorData.charge*Number(duration)} {mentorData.currency}</p>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <label>
                    Duration (minutes):
                    <input 
                        type="number"
                        min="15"
                        value={duration} 
                        onChange={(e) => setDuration(e.target.value)}
                        style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem', backgroundColor: '#222', color: 'white', colorScheme: 'dark', boxSizing: 'border-box' }}
                    />
                </label>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ flex: 1 }}>
                        Date:
                        <input 
                            type="date" 
                            required
                            min={todayStr}
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem', backgroundColor: '#222', color: 'white', colorScheme: 'dark', boxSizing: 'border-box' }}
                        />
                    </label>

                    <label style={{ flex: 1 }}>
                        Time:
                        <input 
                            type="time" 
                            required
                            min={minTime || undefined}
                            max={maxTime || undefined}
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem', backgroundColor: '#222', color: 'white', colorScheme: 'dark', boxSizing: 'border-box' }}
                        />
                    </label>
                </div>

                <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    create request
                </button>
                <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    pay & book
                </button>
                <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    approve
                </button>
            </form>

            {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        </div>
    )
}

export default BookSession;

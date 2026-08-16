import { useEffect, useState } from "react";
import { callApi } from "../../config/api.ts";
import { SessionCard, type SessionData } from "../../component/cards/Session.tsx";
import Loading from "../../component/Loading.tsx";
const MySessions: React.FC = () => {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState<Boolean>(true);
    const [error, setError] = useState<string>("");
    useEffect(() => {
        callApi("/bookservice/getall", "GET").then((res) => {
            console.log("All the services data ", res.data)
            if (res.success) {
                setSessions(res.data)
                return;
            }
            setError(res.data.message);
        }).catch((err) => {
            setError(err.response.data.message);
        }).finally(() => {
            setLoading(false);
        })
    }, [])

    return (
        <div className="min-h-screen bg-gray-950 p-6 md:p-10">
            <h1 className="text-3xl font-bold text-white mb-8 border-b border-gray-800 pb-4">My Sessions</h1>
            
            {loading ? (
                <Loading text="Loading sessions..." />
            ) : error ? (
                <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-lg text-center">
                    {error}
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-gray-400 text-center py-20 bg-gray-900/30 rounded-xl border border-gray-800">
                    No sessions found.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                    {sessions.map((val, i) => (
                        <SessionCard key={val.userRef.full_name + val.mentorRef.full_name + i} data={val} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MySessions;
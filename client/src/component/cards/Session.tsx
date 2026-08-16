import { Link } from "react-router-dom";
import { encodeId } from "../../lib/HashIds";

interface MiniProf {
    full_name: string;
    image: string | null;
}

interface SessionData {
    id: string;
    cost: string;
    currency: string;
    scheduled_date: string;
    scheduled_time: string;
    status: string;
    created_at: string;
    mentorRef: MiniProf;
    userRef: MiniProf;
}

const statusColors: Record<string, string> = {
    "INITIATED": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "SCHEDULED": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "ONGOING": "bg-violet-500/20 text-violet-400 border-violet-500/30",
    "DONE": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "CANCELED": "bg-red-500/20 text-red-400 border-red-500/30"
};

const SessionCard: React.FC<{ data: SessionData }> = ({ data }) => {
    // Safely format date and time 
    const formattedDate = new Date(data.scheduled_date).toLocaleDateString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });

    const formattedTime = new Date(data.scheduled_time).toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit'
    });


    const statusStyle = statusColors[data.status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";

    return (
        <Link
            to={`/session/${encodeId(data.id)}`}
            className="block bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg hover:border-violet-500/50 hover:shadow-xl transition-all duration-300 flex flex-col gap-4 h-full overflow-hidden group"
        >
            {/* Header: Status and Date/Time */}
            <div className="flex justify-between items-start gap-2">
                <div className="shrink-0">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${statusStyle} uppercase tracking-wider whitespace-nowrap`}>
                        {data.status}
                    </span>
                </div>
                <div className="text-right text-xs min-w-0">
                    <p className="font-semibold text-gray-200 truncate">{formattedDate}</p>
                    <p className="text-gray-400 mt-0.5">{formattedTime}</p>
                </div>
            </div>

            {/* Middle part: Mentor & Client representation stacked */}
            <div className="flex flex-col gap-3 bg-gray-950/50 p-4 rounded-lg border border-gray-800/50 flex-grow">
                {/* Mentor row */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700 shrink-0">
                        {data.mentorRef.image ? (
                            <img src={data.mentorRef.image} alt={data.mentorRef.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-400 font-bold text-sm">{data.mentorRef.full_name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">Mentor</p>
                        <p className="text-gray-200 font-medium text-sm truncate">{data.mentorRef.full_name}</p>
                    </div>
                </div>

                <div className="h-[1px] w-full bg-gray-800/50 my-1"></div>

                {/* Client row */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700 shrink-0">
                        {data.userRef.image ? (
                            <img src={data.userRef.image} alt={data.userRef.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-400 font-bold text-sm">{data.userRef.full_name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">Client</p>
                        <p className="text-gray-200 font-medium text-sm truncate">{data.userRef.full_name}</p>
                    </div>
                </div>
            </div>

            {/* Bottom: Action Buttons */}
            <div className="mt-auto">
                <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-gray-400 font-medium">Session Cost</span>
                    <span className="font-bold text-gray-100 text-sm">{data.cost} <span className="text-gray-500 text-xs">{data.currency}</span></span>
                </div>
            </div>
        </Link>
    );
}

export { SessionCard, type SessionData, statusColors };
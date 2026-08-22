import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ConfirmationModal } from "../../component/ConfirmationModal";
import Loading from "../../component/Loading";
import { callApi } from "../../config/api";
import { decodeId } from "../../lib/HashIds";
import { type SessionData, statusColors } from "../../component/cards/Session.tsx";
import useUser from "../../lib/UserState";

interface DetailedSessionData extends SessionData {
    approved_by_mentor: boolean;
    payment_done: boolean;
    duration: string;
    opinion: string | null;
    rating: number | null;
    mentorRef: {
        id: string;
        full_name: string;
        image: string | null;
    };
    userRef: {
        id: string;
        full_name: string;
        image: string | null;
    };
}

interface EditFormState {
    scheduled_date: string;
    scheduled_time: string;
    duration: string;
    cost: string;
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal: React.FC<{
    session: DetailedSessionData;
    isMentor: boolean;
    onClose: () => void;
    onSave: (data: EditFormState) => Promise<void>;
}> = ({ session, isMentor, onClose, onSave }) => {
    const [form, setForm] = useState<EditFormState>({
        scheduled_date: new Date(session.scheduled_date).toISOString().split("T")[0],
        scheduled_time: new Date(session.scheduled_time).toTimeString().slice(0, 5),
        duration: session.duration,
        cost: session.cost?.toString() ?? "0",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submiitted ")
        setSaving(true);
        setError(null);
        try {
            await onSave(form);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to update session.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-100">Edit Session</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-800"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Date
                        </label>
                        <input
                            type="date"
                            name="scheduled_date"
                            value={form.scheduled_date}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-colors"
                        />
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Time
                        </label>
                        <input
                            type="time"
                            name="scheduled_time"
                            value={form.scheduled_time}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-colors"
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Duration (minutes)
                        </label>
                        <input
                            type="number"
                            name="duration"
                            value={form.duration}
                            onChange={handleChange}
                            min={1}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-colors"
                        />
                    </div>

                    {/* Cost — only mentor can edit */}
                    {isMentor && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Cost ({session.currency})
                            </label>
                            <input
                                type="number"
                                name="cost"
                                value={form.cost}
                                onChange={handleChange}
                                min={0}
                                step="0.01"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-colors"
                            />
                        </div>
                    )}

                    {/* Note about approval reset */}
                    <p className="text-xs text-yellow-500/80 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                        ⚠ Saving changes will reset mentor approval and require re-approval before payment.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg border border-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const DetailedSession: React.FC = () => {
    const [session, setSession] = useState<DetailedSessionData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [approving, setApproving] = useState<boolean>(false);
    const [canceling, setCanceling] = useState<boolean>(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);
    const [initingPymt, setInitingPymt] = useState<boolean>(false);

    const { hash } = useParams<{ hash: string }>();
    const currentUserId = useUser((state) => state.id);
    const currentUserRole = useUser((state) => state.role);

    const sessionNumericId = decodeId(hash);

    useEffect(() => {
        if (!hash) {
            setError("Invalid session URL.");
            setLoading(false);
            return;
        }

        const id = decodeId(hash);
        if (!id) {
            setError("Invalid session ID.");
            setLoading(false);
            return;
        }

        setLoading(true);
        callApi(`/bookservice/get/${id}`, "GET")
            .then(res => {
                console.log("dtld session ", res);
                if (res.data) {
                    setSession(res.data);
                } else {
                    setError("Some error occurred ");
                }
            })
            .catch(err => {
                setError(err.response?.data?.message || err.message || "Unable to load the session data for now");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [hash]);

    // Role helpers
    const isMentor =
        currentUserRole === "MENTOR" &&
        !!session &&
        String(session.mentorRef.id) === String(currentUserId);

    const canEdit =
        !!session &&
        session.status !== "CANCELED" &&
        session.status !== "DONE" &&
        session.status !== "ONGOING";

    // ── Handlers ─────────────────────────────────────────────────────────────────

    const handleSaveEdit = async (formData: EditFormState) => {


        if (!sessionNumericId || !session) return;
         console.log("FormData in  handleSaveEdit ", formData)
        const dateStr = formData.scheduled_date;
        const timeStr = formData.scheduled_time;

        const body: Record<string, any> = {
            scheduled_date: new Date(dateStr).toISOString(),
            scheduled_time: new Date(`${dateStr}T${timeStr}:00`).toISOString(),
            duration: formData.duration,
            approved_by_mentor: false,
        };

        if (isMentor) {
            body.cost = parseFloat(formData.cost);
        }
        console.log("dtld session ", sessionNumericId, "\npayload ", body)
        const res = await callApi(`/bookservice/update/${sessionNumericId}`, "PATCH", body);
        console.log("Dtld sesn ", res)
        if (res?.data) {
            setSession(prev =>
                prev
                    ? {
                          ...prev,
                          scheduled_date: res.data.scheduled_date ?? prev.scheduled_date,
                          scheduled_time: res.data.scheduled_time ?? prev.scheduled_time,
                          duration: res.data.duration ?? prev.duration,
                          cost: res.data.cost ?? prev.cost,
                          approved_by_mentor: false,
                      }
                    : prev
            );
        }
    };

    const handleApprove = async () => {
        if (!sessionNumericId || !session) return;
        setApproving(true);
        try {
            const res = await callApi(`/bookservice/update/${sessionNumericId}`, "PATCH", {
                approved_by_mentor: true,
            });
            if (res?.data) {
                setSession(prev =>
                    prev ? { ...prev, approved_by_mentor: true} : prev
                );
            }
        } catch (err) {
            console.error("Approve failed:", err);
        } finally {
            setApproving(false);
        }
    };

    const handleCancel = async () => {
        if (!sessionNumericId || !session) return;
        setCanceling(true);
        try {
            const res = await callApi(`/bookservice/update/${sessionNumericId}`, "PATCH", {
                status: "CANCELED",
            });
            if (res?.data) {
                setSession(prev => prev ? { ...prev, status: "CANCELED" } : prev);
            }
        } catch (err: any) {
            console.error("Cancel failed:", err);
        } finally {
            setCanceling(false);
            setShowCancelConfirm(false);
        }
    };

    const handlePayAndBook = async () =>{
        if(!session) {
            setError("No session data found");
            return;
        }
          setInitingPymt(true);
        // call the initiate payment api by sending them some data { amount, crncy, session id}

        try{
            const res = await callApi("/payment/initiate", "POST", {
                amount: session.cost,
                currency: "INR",
                sessionId: sessionNumericId,
            });
            console.log("initiate payment response: ", res);
            // if (res?.data) {
            //     setSession(prev => prev ? { ...prev, payment_status: "PENDING" } : prev);
            // }
        }catch(err){
            console.log("Payment Error: ", err.message);
            setError(err.message);
        } finally{
            setInitingPymt(false);
        }
    }
    // ── Render guards ──────────────────────────────────────────────────────────────

    if (loading) return <Loading text="Loading session details..." />;

    if (error) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-lg text-center max-w-md">
                {error}
            </div>
        </div>
    );

    if (!session) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-gray-400">
            Session not found.
        </div>
    );

    const formattedDate = new Date(session.scheduled_date).toLocaleDateString(undefined, {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const formattedTime = new Date(session.scheduled_time).toLocaleTimeString(undefined, {
        hour: "2-digit", minute: "2-digit",
    });

    return (
        <>
            {showEditModal && (
                <EditModal
                    session={session}
                    isMentor={isMentor}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveEdit}
                />
            )}

            {/* Cancel Confirmation Modal */}
            <ConfirmationModal
                isOpen={showCancelConfirm}
                title="Cancel this session?"
                message="This action is permanent and cannot be undone. The other party will be notified by email."
                confirmText={canceling ? "Canceling..." : "Yes, Cancel Session"}
                cancelText="Keep Session"
                onConfirm={handleCancel}
                onCancel={() => setShowCancelConfirm(false)}
            />

            <div className="min-h-screen bg-gray-950 p-6 md:p-10 text-white">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Header */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-100">Session Details</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[session.status]}`}>
                                    {session.status}
                                </span>

                                {/* Edit Button */}
                                {canEdit && (
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-medium rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-800">
                            <div>
                                <p className="text-sm text-gray-500 font-semibold mb-1">Date &amp; Time</p>
                                <p className="text-gray-200">{formattedDate}</p>
                                <p className="text-gray-400">{formattedTime}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-semibold mb-1">Duration</p>
                                <p className="text-gray-200">{session.duration} minutes</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-semibold mb-1">Total Cost</p>
                                <p className="text-gray-200 font-medium text-lg">{session.cost} <span className="text-sm text-gray-500">{session.currency}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Profiles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mentor */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-4">Mentor</p>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700 shrink-0">
                                    {session.mentorRef.image ? (
                                        <img src={session.mentorRef.image} alt={session.mentorRef.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 font-bold text-xl">{session.mentorRef.full_name.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-gray-100 font-semibold text-lg">{session.mentorRef.full_name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Client */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-4">Client</p>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700 shrink-0">
                                    {session.userRef.image ? (
                                        <img src={session.userRef.image} alt={session.userRef.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 font-bold text-xl">{session.userRef.full_name.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-gray-100 font-semibold text-lg">{session.userRef.full_name}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Approvals & Payment Status */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-100 mb-4 border-b border-gray-800 pb-3">Session Status</h3>
                        <div className="flex flex-col md:flex-row gap-6 justify-around">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${session.approved_by_mentor ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}></div>
                                <div>
                                    <p className="text-sm text-gray-400">Mentor Approval</p>
                                    <p className="font-medium text-gray-200">{session.approved_by_mentor ? 'Approved' : 'Pending'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${session.payment_done ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                                <div>
                                    <p className="text-sm text-gray-400">Payment Status</p>
                                    <p className="font-medium text-gray-200">{session.payment_done ? 'Paid' : 'Unpaid'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Available Actions */}
                    {session.status !== "CANCELED" && session.status !== "DONE" && (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-semibold text-gray-100 mb-4 border-b border-gray-800 pb-3">Actions</h3>
                            <div className="flex flex-wrap gap-4">
                                {/* Cancel Button — only INITIATED sessions */}
                                {session.status === "INITIATED" && (
                                    <button
                                        onClick={() => setShowCancelConfirm(true)}
                                        disabled={canceling}
                                        className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 font-semibold rounded-lg border border-red-500/20 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        Cancel Session
                                    </button>
                                )}

                                {/* Approve Button — mentor only, when not yet approved */}
                                {isMentor && !session.approved_by_mentor && (
                                    <button
                                        onClick={handleApprove}
                                        disabled={approving}
                                        className="px-6 py-2.5 bg-emerald-600/20 hover:bg-emerald-600 hover:text-white text-emerald-400 font-semibold rounded-lg border border-emerald-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {approving ? "Approving..." : "✓ Approve Session"}
                                    </button>
                                )}

                                {/* Pay & Confirm Button — non-mentor only, disabled until approved */}
                                {!isMentor && !session.payment_done && (
                                    <button
                                        onClick={handlePayAndBook}
                                        disabled={!session.approved_by_mentor}
                                        className={`ml-auto px-8 py-2.5 font-bold rounded-lg transition-all transform ${
                                            session.approved_by_mentor
                                                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:-translate-y-0.5"
                                                : "bg-gray-700 text-gray-500 cursor-not-allowed opacity-70"
                                        }`}
                                    >
                                        {initingPymt?("Initiating Payment..."):(session.approved_by_mentor
                                            ? `Pay and Confirm ${session.cost} ${session.currency}`
                                            : "Waiting for Approval")}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );

};

export default DetailedSession;

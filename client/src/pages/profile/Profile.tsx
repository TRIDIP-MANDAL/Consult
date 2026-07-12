import { useState, useEffect } from "react";
import useUser from "../../lib/UserState";
import { callApi } from "../../config/api";
import { Link } from "react-router-dom";

interface ProfileData {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    phone: string;
    gender?: string;
    role: string;
    profession_category?: string;
    profession?: string;
    dob?: string;
    image?: string;

    // Mentor Fields
    experience?: number;
    about?: string;
    available_from?: string;
    available_to?: string;
    rating?: number;
    verified?: boolean;
    expertise?: string;
    level?: string;
    no_of_consultancy?: number;
    charge?: number;
    currency?: string;
    achievements?: string;
}

export const Profile: React.FC = () => {
    const userStore = useUser();
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const result = await callApi(`/auth/profile/${userStore.id}`, "GET");
                if (!result?.success) {
                    throw new Error(result?.message);
                }
                console.log("Profile data ", result.data)
                setProfileData(result.data);
            } catch (error: any) {
                setError(error.message || "An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        }

        if (userStore.id) {
            fetchUserProfile();
        } else {
            setLoading(false);
            setError("User not authenticated.");
        }
    }, [userStore.id]);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gray-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gray-950 flex items-center justify-center p-6">
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3">
                    <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="font-medium">{error}</p>
                </div>
            </div>
        );
    }

    if (!profileData) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-950 text-gray-200 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="relative rounded-2xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800 p-8 shadow-2xl overflow-hidden">
                    {/* Abstract background blur */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-800 shadow-xl group-hover:ring-violet-500/50 transition-all duration-300 bg-gray-800 flex items-center justify-center">
                                <img
                                    src={profileData.image || "/logos/user.png"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button className="absolute bottom-0 right-0 bg-violet-600 hover:bg-violet-500 p-2.5 rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                        </div>

                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                {profileData.first_name} {profileData.middle_name ? profileData.middle_name + " " : ""}{profileData.last_name}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 capitalize tracking-wide">
                                    {profileData.role.toLowerCase()}
                                </span>
                                {profileData.profession_category && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                                        {profileData.profession_category}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="md:ml-auto flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                            <button className="flex-1 md:flex-none px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700 shadow-sm cursor-pointer">
                                <Link to="edit-profile" state={{ profileData }} className="no-underline text-white">
                                    Edit Profile
                                </Link>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl hover:border-gray-700 transition-colors">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Personal Information
                        </h2>
                        <div className="space-y-5">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</span>
                                <span className="text-base font-medium text-gray-200">{profileData.email}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone Number</span>
                                <span className="text-base font-medium text-gray-200">{profileData.phone}</span>
                            </div>
                            {profileData.gender && (
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Gender</span>
                                    <span className="text-base font-medium text-gray-200 capitalize">{profileData.gender.toLowerCase()}</span>
                                </div>
                            )}
                            {profileData.dob && (
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date of Birth</span>
                                    <span className="text-base font-medium text-gray-200">
                                        {new Date(profileData.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl hover:border-gray-700 transition-colors">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                            Professional Details
                        </h2>
                        <div className="space-y-5">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Account Role</span>
                                <span className="text-base font-medium text-gray-200 capitalize">{profileData.role.toLowerCase()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Profession Category</span>
                                <span className="text-base font-medium text-gray-200">{profileData.profession_category || "Not specified"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Profession / Job Title</span>
                                <span className="text-base font-medium text-gray-200">{profileData.profession || "Not specified"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mentor Info */}
                {profileData.role === "MENTOR" && (
                    <div className="bg-gray-900/60 backdrop-blur-sm border border-violet-800/50 rounded-2xl p-6 shadow-xl hover:border-violet-700/50 transition-colors">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                Mentor Details
                            </h2>
                            {profileData.verified ?
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 tracking-wider">
                                    ✓ Verified Mentor
                                </span> :
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 tracking-wider">
                                        ✗ Not Verified
                                    </span>
                                    <button onClick={() => alert("Verification logic to be implemented!")} className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer border border-violet-500/50">
                                        Verify Profile
                                    </button>
                                </div>
                            }
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Experience</span>
                                <span className="text-base font-medium text-gray-200">{profileData.experience} Years</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Expertise Level</span>
                                <span className="text-base font-medium text-gray-200 capitalize">{profileData.expertise?.toLowerCase() || "Beginner"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Consultation Charge</span>
                                <span className="text-base font-medium text-gray-200">{profileData.charge} {profileData.currency} / session</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Available From</span>
                                <span className="text-base font-medium text-gray-200">
                                    {profileData.available_from ? new Date(profileData.available_from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Not specified"}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Available To</span>
                                <span className="text-base font-medium text-gray-200">
                                    {profileData.available_to ? new Date(profileData.available_to).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Not specified"}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Consultations</span>
                                <span className="text-base font-medium text-gray-200">{profileData.no_of_consultancy || 0}</span>
                            </div>
                            {profileData.rating !== undefined && (
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Rating</span>
                                    <span className="text-base font-medium text-gray-200 flex items-center gap-1">
                                        {profileData.rating} <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    </span>
                                </div>
                            )}
                            {profileData.about && (
                                <div className="flex flex-col md:col-span-2 lg:col-span-3 mt-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">About</span>
                                    <p className="text-base font-medium text-gray-200 bg-gray-800/50 p-4 rounded-lg leading-relaxed">{profileData.about}</p>
                                </div>
                            )}
                            {profileData.achievements && (
                                <div className="flex flex-col md:col-span-2 lg:col-span-3 mt-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Achievements</span>
                                    <p className="text-base font-medium text-gray-200 bg-gray-800/50 p-4 rounded-lg leading-relaxed">{profileData.achievements}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

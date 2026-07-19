import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import countryList from "country-list";
import { professionCategories } from "../../assets/data/profession.json";
import { currencies } from "../../assets/data/currency.json";
import { callApi } from "../../config/api";
import useUser from "../../lib/UserState";
import {ConfirmationModal} from "../../component/ConfirmationModal";

interface UserForm {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    role: "USER" | "MENTOR";
    profession: string;
    profession_category: string;
    country: string;
    postal_code: string;
}

interface MentorForm {
    experience: string;
    about: string;
    available_from: string;
    available_to: string;
    charge: string;
    currency: string;
    achievements: string;
}

export const UpdateProfile: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { profileData } = location.state || {};
    const userId = useUser((state) => state.id);
    const loggedInUserRole = useUser((state)=>state.role)
    const setLogin = useUser((state) => state.setLogin);
    const [showCnfModal, setShowCnfModal] = useState<boolean>(false);
    const [pendingRole, setPendingRole] = useState<"USER" | "MENTOR" | null>(null);

    const initialCategory = profileData?.profession_category || "";
    const initialProfessions = initialCategory ? (professionCategories as Record<string, string[]>)[initialCategory] || [] : [];
    
    // Check if the user's saved profession is standard or custom
    const savedProfession = profileData?.profession || "";
    const isCustomProfession = savedProfession && !initialProfessions.includes(savedProfession);

    const [userData, setUserData] = useState<UserForm>({
        first_name: profileData?.first_name || "",
        middle_name: profileData?.middle_name || "",
        last_name: profileData?.last_name || "",
        email: profileData?.email || "",
        phone: profileData?.phone || "",
        dob: profileData?.dob ? profileData.dob.split("T")[0] : "",
        gender: profileData?.gender || "",
        role: profileData?.role || "USER",
        profession: isCustomProfession ? "Other" : savedProfession,
        profession_category: initialCategory,
        country: profileData?.country || "",
        postal_code: profileData?.postal_code || "",
    });

    const [mentorData, setMentorData] = useState<MentorForm>({
        experience: profileData?.experience?.toString() || "",
        about: profileData?.about || "",
        available_from: profileData?.available_from ? new Date(profileData.available_from).toTimeString().slice(0, 5) : "",
        available_to: profileData?.available_to ? new Date(profileData.available_to).toTimeString().slice(0, 5) : "",
        charge: profileData?.charge?.toString() || "",
        currency: profileData?.currency || "",
        achievements: profileData?.achievements || "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    
    const [prfsn, setPrfsn] = useState<string>(isCustomProfession ? savedProfession : "");
    const [professions, setProfessions] = useState<Array<string>>(initialProfessions);

    const isMentor = userData.role === "MENTOR";

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if(name === "role"){  // check the behaviour during refresh
            if(profileData?.role !== value) {
             setPendingRole(value as "USER" | "MENTOR");
             setShowCnfModal(true)
             return;
            }
        }
        setUserData(prev => ({ ...prev, [name]: value }));
        if (name === "profession_category") {
            setProfessions((professionCategories as Record<string, string[]>)[value] || []);
        }
    };

    const handleMentorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMentorData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (isMentor && mentorData.charge && !mentorData.currency) {
            setError("Please select currency to accept credit");
            return;
        }

        setLoading(true);

        const userPayload = {
            ...userData,
            profession: userData.profession === "Other" ? prfsn : userData.profession,
        };

        const payload: { user: typeof userPayload; mentor?: MentorForm } = { user: userPayload };
        if (isMentor) payload.mentor = mentorData;

        console.log("Update payload ", payload);
        const sendData = {...payload, audit:{
            user_id: userId,
            role: loggedInUserRole
        }}
        const response = await callApi(`/auth/editprofile/${userId}`, "PATCH", sendData);
        console.log("Update response ", response);

        if (response.success) {
            const updatedUser = response.data.user;
            setLogin({
                isloggedin: true,
                name: `${updatedUser.first_name}${updatedUser.middle_name ? " " + updatedUser.middle_name : ""} ${updatedUser.last_name}`,
                role: updatedUser.role,
                image: updatedUser.image || "",
                id: updatedUser.id.toString(),
            });
            
            setError("");
            setSuccess(response.message);
            setTimeout(() => {
                navigate("/profile");
            }, 2000);
        } else {
            setSuccess("");
            setError(response.message);
        }
        setLoading(false);
    };
    
    const handleRoleChange = ()=>{
        if (pendingRole) {
            setUserData(prev => ({ ...prev, role: pendingRole! }));
            setPendingRole(null);
        }
        setShowCnfModal(false)
    }

    const handleUndoRoleChange = ()=>{
        setPendingRole(null);
        setUserData(prev => ({ ...prev, role: profileData?.role as "USER" | "MENTOR" }));
        setShowCnfModal(false)
    }

    if (!profileData) return <div>No profile data found. Please go back to profile.</div>;

    const inputClasses = "w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-800 disabled:cursor-not-allowed";
    const labelClasses = "block text-sm font-semibold text-gray-400 mb-1.5 uppercase tracking-wide";
    const sectionTitleClasses = "text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2 flex items-center gap-2";

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-950 text-gray-200 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8 bg-gray-900/40 border border-gray-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Update Profile</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* ── ROLE TOGGLE ── */}
                    <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                        <label className="block text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">I want to be:</label>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="role" value="USER" checked={userData.role === "USER"} onChange={handleUserChange} className="w-5 h-5 text-violet-600 bg-gray-900 border-gray-600 focus:ring-violet-500 focus:ring-2" />
                                <span className="text-gray-300 font-medium group-hover:text-white transition-colors">User</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="role" value="MENTOR" checked={userData.role === "MENTOR"} onChange={handleUserChange} className="w-5 h-5 text-violet-600 bg-gray-900 border-gray-600 focus:ring-violet-500 focus:ring-2" />
                                <span className="text-gray-300 font-medium group-hover:text-white transition-colors">Mentor</span>
                            </label>
                        </div>
                    </div>

                    {/* ── PERSONAL INFO ── */}
                    <div>
                        <h3 className={sectionTitleClasses}>Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>First Name *</label>
                                <input className={inputClasses} type="text" name="first_name" value={userData.first_name} onChange={handleUserChange} required />
                            </div>
                            <div>
                                <label className={labelClasses}>Middle Name</label>
                                <input className={inputClasses} type="text" name="middle_name" value={userData.middle_name} onChange={handleUserChange} />
                            </div>
                            <div>
                                <label className={labelClasses}>Last Name *</label>
                                <input className={inputClasses} type="text" name="last_name" value={userData.last_name} onChange={handleUserChange} required />
                            </div>
                            <div>
                                <label className={labelClasses}>Date of Birth</label>
                                <input className={inputClasses} type="date" name="dob" value={userData.dob} onChange={handleUserChange} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Gender</label>
                                <select className={inputClasses} name="gender" value={userData.gender} onChange={handleUserChange}>
                                    <option value="">Select</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ── ACCOUNT DETAILS ── */}
                    <div>
                        <h3 className={sectionTitleClasses}>Account Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Email * <span className="text-xs text-gray-500 normal-case">(Can't be changed)</span></label>
                                <input className={inputClasses} type="email" name="email" value={userData.email} onChange={handleUserChange} required disabled />
                            </div>
                            <div>
                                <label className={labelClasses}>Phone * <span className="text-xs text-gray-500 normal-case">(Can't be changed)</span></label>
                                <input className={inputClasses} type="tel" name="phone" value={userData.phone} onChange={handleUserChange} required disabled />
                            </div>
                        </div>
                    </div>

                    {/* ── PROFESSION ── */}
                    <div>
                        <h3 className={sectionTitleClasses}>Profession</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Category</label>
                                <select className={inputClasses} name="profession_category" value={userData.profession_category} onChange={handleUserChange}>
                                    <option value="">Select Category</option>
                                    {Object.keys(professionCategories).map((v) => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Profession</label>
                                <select className={inputClasses} name="profession" value={userData.profession} onChange={handleUserChange}>
                                    <option value="" disabled>Select Profession</option>
                                    {professions.map((v) => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </select>
                                {userData.profession === "Other" && (
                                    <input className={`${inputClasses} mt-3`} type="text" placeholder="Type your profession" value={prfsn} onChange={(e) => setPrfsn(e.target.value)} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── LOCATION ── */}
                    <div>
                        <h3 className={sectionTitleClasses}>Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Country *</label>
                                <select className={inputClasses} name="country" value={userData.country} onChange={handleUserChange} required>
                                    <option value="" disabled>Select Country</option>
                                    {countryList.getData().map((country, index) => (
                                        <option key={index + "ctry"} value={country.code}>{country.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Postal Code</label>
                                <input className={inputClasses} type="text" name="postal_code" value={userData.postal_code} onChange={handleUserChange} />
                            </div>
                        </div>
                    </div>

                    {/* ── MENTOR SECTION ── */}
                    {isMentor && (
                        <div className="bg-violet-900/10 p-6 rounded-xl border border-violet-500/20">
                            <h3 className={`${sectionTitleClasses} !border-violet-500/30 text-violet-300`}>Mentor Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>Experience (years) *</label>
                                    <input className={inputClasses} type="number" name="experience" value={mentorData.experience} onChange={handleMentorChange} required />
                                </div>
                                <div>
                                    <label className={labelClasses}>Charge per session</label>
                                    <input className={inputClasses} type="number" name="charge" value={mentorData.charge} onChange={handleMentorChange} />
                                </div>
                                {mentorData.charge && (
                                    <div className="md:col-span-2">
                                        <label className={labelClasses}>Currency</label>
                                        <select className={inputClasses} name="currency" value={mentorData.currency} onChange={handleMentorChange}>
                                            <option value="">Select Currency</option>
                                            {currencies.map((crncy: any, i: number) => (
                                                <option key={i + "cny"} value={crncy.code}>{crncy.name}-{crncy.symbol}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className={labelClasses}>Available From</label>
                                    <input className={inputClasses} type="time" name="available_from" value={mentorData.available_from} onChange={handleMentorChange} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Available To</label>
                                    <input className={inputClasses} type="time" name="available_to" value={mentorData.available_to} onChange={handleMentorChange} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>About</label>
                                    <textarea className={inputClasses} name="about" value={mentorData.about} onChange={handleMentorChange} rows={3} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Achievements</label>
                                    <textarea className={inputClasses} name="achievements" value={mentorData.achievements} onChange={handleMentorChange} rows={3} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-800 flex flex-col items-end">
                        <button type="submit" disabled={loading} className="px-8 py-3 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Updating...
                                </span>
                            ) : "Save Changes"}
                        </button>
                        {error && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg w-full text-red-400 flex items-center gap-3">
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg w-full text-green-400 flex items-center gap-3">
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <p className="text-sm font-medium">{success}</p>
                            </div>
                        )}
                    </div>
                </form>
            </div>
            <ConfirmationModal
                isOpen={showCnfModal}
                title="Update Profile"
                message={`Do you want to update your profile from ${loggedInUserRole} to ${pendingRole} ?`}
                onConfirm={handleRoleChange}
                onCancel={handleUndoRoleChange}
            />
        </div>
    );
};
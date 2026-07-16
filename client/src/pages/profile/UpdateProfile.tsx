import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import countryList from "country-list";
import { professionCategories } from "../../assets/data/profession.json";
import { currencies } from "../../assets/data/currency.json";
import { callApi } from "../../config/api";
import useUser from "../../lib/UserState";

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
    const setLogin = useUser((state) => state.setLogin);

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
        const response = await callApi(`/auth/editprofile/${userId}`, "PATCH", payload);
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

    if (!profileData) return <div>No profile data found. Please go back to profile.</div>;

    const inputStyle: React.CSSProperties = { border: "1px solid #ccc", padding: "6px 10px", width: "100%", marginBottom: "10px", backgroundColor: "transparent", color: "black" };
    const labelStyle: React.CSSProperties = { display: "block", marginBottom: "4px", fontSize: "14px", color: "#ccc" };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h2>Update Profile</h2>

            <form onSubmit={handleSubmit}>

                {/* ── ROLE TOGGLE ── */}
                <div style={{ marginBottom: "15px" }}>
                    <label style={labelStyle}>I want to be:</label>
                    <label style={{ marginRight: "20px", color: "white" }}>
                        <input type="radio" name="role" value="USER" checked={userData.role === "USER"} onChange={handleUserChange} /> User
                    </label>
                    <label style={{ color: "white" }}>
                        <input type="radio" name="role" value="MENTOR" checked={userData.role === "MENTOR"} onChange={handleUserChange} /> Mentor
                    </label>
                </div>

                {/* ── PERSONAL INFO ── */}
                <h3>Personal Information</h3>
                <div>
                    <label style={labelStyle}>First Name *</label>
                    <input style={inputStyle} type="text" name="first_name" value={userData.first_name} onChange={handleUserChange} required />
                </div>
                <div>
                    <label style={labelStyle}>Middle Name</label>
                    <input style={inputStyle} type="text" name="middle_name" value={userData.middle_name} onChange={handleUserChange} />
                </div>
                <div>
                    <label style={labelStyle}>Last Name *</label>
                    <input style={inputStyle} type="text" name="last_name" value={userData.last_name} onChange={handleUserChange} required />
                </div>
                <div>
                    <label style={labelStyle}>Date of Birth</label>
                    <input style={inputStyle} type="date" name="dob" value={userData.dob} onChange={handleUserChange} />
                </div>
                <div>
                    <label style={labelStyle}>Gender</label>
                    <select style={inputStyle} name="gender" value={userData.gender} onChange={handleUserChange}>
                        <option value="">Select</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                {/* ── ACCOUNT DETAILS ── */}
                <h3>Account Details</h3>
                <div>
                    <label style={labelStyle}>Email * (Changing requires OTP verification)</label>
                    <input style={inputStyle} type="email" name="email" value={userData.email} onChange={handleUserChange} required />
                </div>
                <div>
                    <label style={labelStyle}>Phone * (Changing requires OTP verification)</label>
                    <input style={inputStyle} type="tel" name="phone" value={userData.phone} onChange={handleUserChange} required />
                </div>

                {/* ── PROFESSION ── */}
                <h3>Profession</h3>
                <div>
                    <label style={labelStyle}>Category</label>
                    <select style={inputStyle} name="profession_category" value={userData.profession_category} onChange={handleUserChange}>
                        <option value="">Select Category</option>
                        {Object.keys(professionCategories).map((v) => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Profession</label>
                    <select style={inputStyle} name="profession" value={userData.profession} onChange={handleUserChange}>
                        <option value="" disabled>Select Profession</option>
                        {professions.map((v) => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    {userData.profession === "Other" && (
                        <input style={{ ...inputStyle, marginTop: "5px" }} type="text" placeholder="Type your profession" value={prfsn} onChange={(e) => setPrfsn(e.target.value)} />
                    )}
                </div>

                {/* ── LOCATION ── */}
                <h3>Location</h3>
                <div>
                    <label style={labelStyle}>Country *</label>
                    <select style={inputStyle} name="country" value={userData.country} onChange={handleUserChange} required>
                        <option value="" disabled>Select Country</option>
                        {countryList.getData().map((country, index) => (
                            <option key={index + "ctry"} value={country.code}>{country.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Postal Code</label>
                    <input style={inputStyle} type="text" name="postal_code" value={userData.postal_code} onChange={handleUserChange} />
                </div>

                {/* ── MENTOR SECTION ── */}
                {isMentor && (
                    <>
                        <h3>Mentor Details</h3>
                        <div>
                            <label style={labelStyle}>Experience (years) *</label>
                            <input style={inputStyle} type="number" name="experience" value={mentorData.experience} onChange={handleMentorChange} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Charge per session</label>
                            <input style={inputStyle} type="number" name="charge" value={mentorData.charge} onChange={handleMentorChange} />
                        </div>
                        {mentorData.charge && (
                            <div>
                                <label style={labelStyle}>Currency</label>
                                <select style={inputStyle} name="currency" value={mentorData.currency} onChange={handleMentorChange}>
                                    <option value="">Select Currency</option>
                                    {currencies.map((crncy: any, i: number) => (
                                        <option key={i + "cny"} value={crncy.code}>{crncy.name}-{crncy.symbol}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label style={labelStyle}>Available From</label>
                            <input style={inputStyle} type="time" name="available_from" value={mentorData.available_from} onChange={handleMentorChange} />
                        </div>
                        <div>
                            <label style={labelStyle}>Available To</label>
                            <input style={inputStyle} type="time" name="available_to" value={mentorData.available_to} onChange={handleMentorChange} />
                        </div>
                        <div>
                            <label style={labelStyle}>About</label>
                            <textarea style={inputStyle} name="about" value={mentorData.about} onChange={handleMentorChange} rows={3} />
                        </div>
                        <div>
                            <label style={labelStyle}>Achievements</label>
                            <textarea style={inputStyle} name="achievements" value={mentorData.achievements} onChange={handleMentorChange} rows={3} />
                        </div>
                    </>
                )}

                <button type="submit" disabled={loading} style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer", border: "1px solid black", backgroundColor: "transparent", color: "white" }}>
                    {loading ? "Updating..." : "Save Changes"}
                </button>
                {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
                {success && <p style={{ color: "green", marginTop: "10px" }}>{success}</p>}
            </form>
        </div>
    );
};
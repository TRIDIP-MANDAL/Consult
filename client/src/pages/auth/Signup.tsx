import { useState } from "react";
import countryList from "country-list";
import { professionCategories } from "../../assets/profession.json";
import { useOtpVerification } from '../../hooks/otpHook.ts'
// The body sent to backend will be:
// { user: {...}, mentor: {...} }  — mentor only if role is MENTOR

interface UserForm {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    dob: string;
    gender: string;
    role: "USER" | "MENTOR";
    profession_name: string;
    profession_category: string;
    country: string;
    postal_code: string;
}

interface MentorForm {
    experience: string;
    about: string;
    available_from: string;
    available_to: string;
    expertise: string;
    charge: string;
    achievements: string;
}

interface CombinedForm {
    user:UserForm
    mentor?:MentorForm
}
//make this mentor form type optional

export const Signup: React.FC = () => {
    const [userForm, setUserForm] = useState<UserForm>({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        dob: "",
        gender: "",
        role: "USER",
        profession_name: "",
        profession_category: "",
        country: "",
        postal_code: "",
    });

    const [mentorForm, setMentorForm] = useState<MentorForm>({
        experience: "",
        about: "",
        available_from: "",
        available_to: "",
        expertise: "",
        charge: "",
        achievements: "",
    });
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [prfsn, setPrfsn] = useState<string>("");
    const [professions, setProfessions] = useState<Array<string>>([]);
    const { otp, sendOtp, verifyOtp, otpValueHandler, resetOtp } = useOtpVerification();
    const isMentor = userForm.role === "MENTOR";

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserForm((prev) => ({ ...prev, [name]: value }));
        if (name === "profession_category") {
            setProfessions(professionCategories[value]);
        }
    };

    const handleMentorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMentorForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        userForm.profession_name = userForm.profession_name === "Other" ? prfsn:userForm.profession_name;
        const body: CombinedForm = { user: userForm };
        if (isMentor) body.mentor = mentorForm;
        // TODO: hit POST /auth/signup with callApi
        // reset logic after api success 
    };

    const handlePrfsn = (e) => {
        setPrfsn(e.target.value)
    }

    const handleSendOtp = async()=>{
        const result = await sendOtp(userForm.email);
        console.log("result of sending otp ",result)
    }

    const handleVerifyOtp = async()=>{
        const result = await verifyOtp(userForm.email);
        console.log("result of verifying otp ",result)
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Sign Up</h1>
            {/* ── ROLE TOGGLE ── */}
            <fieldset>
                <legend>I am signing up as:</legend>
                <label>
                    <input
                        type="radio"
                        name="role"
                        value="USER"
                        checked={userForm.role === "USER"}
                        onChange={handleUserChange}
                    />
                    User
                </label>
                <label>
                    <input
                        type="radio"
                        name="role"
                        value="MENTOR"
                        checked={userForm.role === "MENTOR"}
                        onChange={handleUserChange}
                    />
                    Mentor
                </label>
            </fieldset>

            {/* ── BASIC INFO ── */}
            <fieldset>
                <legend>Personal Information</legend>

                <label>First Name *
                    <input type="text" name="first_name" value={userForm.first_name} onChange={handleUserChange} required />
                </label>

                <label>Middle Name
                    <input type="text" name="middle_name" value={userForm.middle_name} onChange={handleUserChange} />
                </label>

                <label>Last Name *
                    <input type="text" name="last_name" value={userForm.last_name} onChange={handleUserChange} required />
                </label>

                <label>Date of Birth
                    <input type="date" name="dob" value={userForm.dob} onChange={handleUserChange} />
                </label>

                <label>Gender
                    <select name="gender" value={userForm.gender} onChange={handleUserChange}>
                        <option value="">Select</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>
                </label>
            </fieldset>

            {/* ── CONTACT & AUTH ── */}
            <fieldset>
                <legend>Account Details</legend>

                <label>Email *
                    <input type="email" name="email" value={userForm.email} onChange={handleUserChange} required />
                </label>
                  {!otp.verified && (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={!userForm.email}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition whitespace-nowrap"
                                >
                                    {otp.sent_otp ? "Resend OTP" : "Send OTP"}
                                    {/* here might need to put timer so that use can wait and then sends otp */}
                                </button>
                            )}
                            {otp.verified && (
                                <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium px-3">
                                    ✓ Verified
                                </span>
                            )}

                                                {otp.sent_otp && !otp.verified && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-300">Enter OTP</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="otp"
                                    value={otp.otp}
                                    onChange={otpValueHandler}
                                    placeholder="6-digit OTP"
                                    className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    disabled={!otp.otp}
                                    className="disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
                                >
                                    Verify
                                </button>
                            </div>
                        </div>
                    )}

                <label>Phone *
                    <input type="tel" name="phone" value={userForm.phone} onChange={handleUserChange} required />
                </label>

                <label>Password *
                    <input type="password" name="password" value={userForm.password} onChange={handleUserChange} required />
                </label>
            </fieldset>

            {/* ── PROFESSION ── */}
            <fieldset>
                <legend>Profession</legend>
                <label>Category
                    <select name="profession_category" value={userForm.profession_category} onChange={handleUserChange}>
                        <option value="">Select Category</option>
                        {Object.keys(professionCategories).map((v) => {
                            return <option key={v} value={v}>{v}</option>
                        })}
                    </select>
                </label>
                <label>Profession
                    <select name="profession_name" value={userForm.profession_name} onChange={handleUserChange}>
                        <option value="" disabled>Select Profession</option>
                        {professions.map((v) => {
                            return <option key={v} value={v}>{v}</option>
                        })}
                    </select>
                    {userForm.profession_name === "Other" && <input type="text" placeholder="type your profession" name="profession" value={prfsn} onChange={handlePrfsn} />}
                </label>
            </fieldset>

            {/* ── LOCATION ── */}
            <fieldset>
                <legend>Location</legend>

                <label>Country *
                    <select name="country" value={userForm.country} onChange={handleUserChange} required>
                        <option value="" disabled>Select Country</option>
                        {countryList.getData().map((country, index) => {
                            return <option key={index + "ctry"} value={country.code}>{country.name}</option>
                        })}
                    </select>
                </label>

                <label>Postal Code
                    <input type="text" name="postal_code" value={userForm.postal_code} onChange={handleUserChange} />
                </label>
            </fieldset>

            {/* ── MENTOR SECTION (conditionally rendered) ── */}
            {isMentor && (
                <fieldset>
                    <legend>Mentor Details</legend>

                    <label>Experience (years) *
                        <input type="number" name="experience" value={mentorForm.experience} onChange={handleMentorChange} required />
                    </label>

                    <label>About
                        <textarea name="about" value={mentorForm.about} onChange={handleMentorChange} />
                    </label>

                    <label>Available From
                        <input type="time" name="available_from" value={mentorForm.available_from} onChange={handleMentorChange} />
                    </label>

                    <label>Available To
                        <input type="time" name="available_to" value={mentorForm.available_to} onChange={handleMentorChange} />
                    </label>

                    <label>Charge per session (optional)
                        <input type="number" name="charge" value={mentorForm.charge} onChange={handleMentorChange} />
                    </label>

                    <label>Achievements
                        <textarea name="achievements" value={mentorForm.achievements} onChange={handleMentorChange} />
                    </label>
                </fieldset>
            )}

            <button type="submit">
                {isMentor ? "Sign Up as Mentor" : "Sign Up"}
            </button>
        </form>
    );
};

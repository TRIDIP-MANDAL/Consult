import { useState } from "react";
import countryList from "country-list";
import { useNavigate } from "react-router-dom";
import { professionCategories } from "../../assets/data/profession.json";
import { currencies } from "../../assets/data/currency.json";
import OtpVerification from "../../component/cards/OtpVerification.tsx";
import { callApi } from "../../config/api.ts";
import {isValidMobileNo, formatMobileNo, isStrongPassword, type CountryCode} from "../../config/others.ts"

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

interface CombinedForm {
    user: UserForm
    mentor?: MentorForm
}

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
        profession: "",
        profession_category: "",
        country: "",
        postal_code: "",
    });

    const [mentorForm, setMentorForm] = useState<MentorForm>({
        experience: "",
        about: "",
        available_from: "",
        available_to: "",
        charge: "",
        currency: "",
        achievements: "",
    });
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [prfsn, setPrfsn] = useState<string>("");
    const [otpVerified, setOtpVerified] = useState<boolean>(false);
    const [professions, setProfessions] = useState<Array<string>>([]);
    const isMentor = userForm.role === "MENTOR";
    const navigate = useNavigate();

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
        if (!otpVerified) {
            setError("Please verify your email");
            return;
        }
        if (isMentor && mentorForm.charge && !mentorForm.currency) {
            setError("Please select currency to accept credit");
            return;
        }
        if(!isValidMobileNo(userForm.phone, userForm.country as CountryCode)){
            setError("Please enter a valid phone number");
            return;
        }
        if(!isStrongPassword(userForm.password)){
            setError("Password must be at least 6 characters and include a capital letter, a small letter, a number, and a special character.");
            return;
        }

        const userPayload = {
            ...userForm,
            phone: formatMobileNo(userForm.phone, userForm.country as CountryCode),
            profession: userForm.profession === "Other" ? prfsn : userForm.profession,
        };

        const body: CombinedForm = { user: userPayload };
        if (isMentor) body.mentor = mentorForm;
        console.log("Whole form data ", body)
        const result = await callApi("auth/signup", "POST", body);
        console.log("response of api call ", result)
        if (result.success) {
            setError("");
            setSuccess(result.message);
            setTimeout(() => {
              navigate('/login');
            }, 5000);
        } else {
            setSuccess("");
            setError(result.message)
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Sign Up</h1>
                    <p className="text-gray-400 mt-2 text-sm">Join our platform and start connecting.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    
                    {/* ── ROLE TOGGLE ── */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-gray-300">I am signing up as:</label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 text-white cursor-pointer font-medium">
                                <input
                                    type="radio"
                                    name="role"
                                    value="USER"
                                    checked={userForm.role === "USER"}
                                    onChange={handleUserChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 focus:ring-blue-500 focus:ring-2"
                                />
                                User
                            </label>
                            <label className="flex items-center gap-2 text-white cursor-pointer font-medium">
                                <input
                                    type="radio"
                                    name="role"
                                    value="MENTOR"
                                    checked={userForm.role === "MENTOR"}
                                    onChange={handleUserChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 focus:ring-blue-500 focus:ring-2"
                                />
                                Mentor
                            </label>
                        </div>
                    </div>

                    {/* ── BASIC INFO ── */}
                    <fieldset className="border border-gray-800 rounded-xl p-6 flex flex-col gap-5">
                        <legend className="text-lg font-semibold text-white px-2">Personal Information</legend>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">First Name *</label>
                                <input type="text" name="first_name" value={userForm.first_name} onChange={handleUserChange} required className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Middle Name</label>
                                <input type="text" name="middle_name" value={userForm.middle_name} onChange={handleUserChange} className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Last Name *</label>
                                <input type="text" name="last_name" value={userForm.last_name} onChange={handleUserChange} required className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Date of Birth</label>
                                <input type="date" name="dob" value={userForm.dob} onChange={handleUserChange} className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Gender</label>
                                <select name="gender" value={userForm.gender} onChange={handleUserChange} className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                    <option value="">Select</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    {/* ── CONTACT & AUTH ── */}
                    <fieldset className="border border-gray-800 rounded-xl p-6 flex flex-col gap-5">
                        <legend className="text-lg font-semibold text-white px-2">Account Details</legend>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-sm font-medium text-gray-300">Email *</label>
                                <input type="email" name="email" value={userForm.email} onChange={handleUserChange} required className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                            </div>
                            
                            <div className="md:col-span-2">
                                <OtpVerification email={userForm.email} onVerified={setOtpVerified} />
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Phone *</label>
                                <input type="tel" name="phone" value={userForm.phone} onChange={handleUserChange} required className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Password *</label>
                                <input type="password" name="password" value={userForm.password} onChange={handleUserChange} required className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                                {!isStrongPassword(userForm.password) && userForm.password.length > 0 && (
                                    <span className="text-red-400 text-xs mt-1">Must be more than 6 chars with uppercase, lowercase, number & symbol.</span>
                                )}
                            </div>
                        </div>
                    </fieldset>

                    {/* ── PROFESSION ── */}
                    <fieldset className="border border-gray-800 rounded-xl p-6 flex flex-col gap-5">
                        <legend className="text-lg font-semibold text-white px-2">Profession</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Category</label>
                                <select name="profession_category" value={userForm.profession_category} onChange={handleUserChange} className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                    <option value="">Select Category</option>
                                    {Object.keys(professionCategories).map((v) => {
                                        return <option key={v} value={v}>{v}</option>
                                    })}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Profession</label>
                                <select name="profession" value={userForm.profession} onChange={handleUserChange} className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                    <option value="" disabled>Select Profession</option>
                                    {professions.map((v) => {
                                        return <option key={v} value={v}>{v}</option>
                                    })}
                                </select>
                                {userForm.profession === "Other" && (
                                    <input type="text" placeholder="Type your profession" name="profession" value={prfsn} onChange={(e) => setPrfsn(e.target.value)} className="mt-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                                )}
                            </div>
                        </div>
                    </fieldset>

                    {/* ── LOCATION ── */}
                    <fieldset className="border border-gray-800 rounded-xl p-6 flex flex-col gap-5">
                        <legend className="text-lg font-semibold text-white px-2">Location</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Country *</label>
                                <select name="country" value={userForm.country} onChange={handleUserChange} required className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                    <option value="" disabled>Select Country</option>
                                    {countryList.getData().map((country, index) => {
                                        return <option key={index + "ctry"} value={country.code}>{country.name}</option>
                                    })}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Postal Code</label>
                                <input type="text" name="postal_code" value={userForm.postal_code} onChange={handleUserChange} className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                            </div>
                        </div>
                    </fieldset>

                    {/* ── MENTOR SECTION (conditionally rendered) ── */}
                    {isMentor && (
                        <fieldset className="border border-blue-900 bg-blue-950/20 rounded-xl p-6 flex flex-col gap-5">
                            <legend className="text-lg font-semibold text-blue-400 px-2">Mentor Details</legend>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-300">Experience (years) *</label>
                                    <input type="number" name="experience" value={mentorForm.experience} onChange={handleMentorChange} required className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-300">Charge per session</label>
                                    <input type="number" name="charge" value={mentorForm.charge} onChange={handleMentorChange} className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                                </div>
                                {mentorForm.charge && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-300">Currency</label>
                                        <select name="currency" value={mentorForm.currency} onChange={handleMentorChange} className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                            <option value="">Select Currency</option>
                                            {currencies.map((crncy, i) => {
                                                return <option key={i + "cny"} value={crncy.code}>{crncy.name}-{crncy.symbol}</option>
                                            })}
                                        </select>
                                    </div>
                                )}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-300">Available From</label>
                                    <input type="time" name="available_from" value={mentorForm.available_from} onChange={handleMentorChange} className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-300">Available To</label>
                                    <input type="time" name="available_to" value={mentorForm.available_to} onChange={handleMentorChange} className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-300">About</label>
                                    <textarea name="about" value={mentorForm.about} onChange={handleMentorChange} rows={3} className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none" />
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-300">Achievements</label>
                                    <textarea name="achievements" value={mentorForm.achievements} onChange={handleMentorChange} rows={3} className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none" />
                                </div>
                            </div>
                        </fieldset>
                    )}

                    <button type="submit" disabled={!otpVerified} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition text-base mt-2 shadow-lg shadow-blue-500/20">
                        {isMentor ? "Sign Up as Mentor" : "Sign Up"}
                    </button>
                    {error && <p className="text-red-400 text-sm text-center font-medium bg-red-900/30 py-2 rounded border border-red-800">{error}</p>}
                    {success && <p className="text-green-400 text-sm text-center font-medium bg-green-900/30 py-2 rounded border border-green-800">{success}</p>}
                </form>
            </div>
        </div>
    );
};

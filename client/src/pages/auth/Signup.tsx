import { useState } from "react";
import countryList from "country-list";
import { useNavigate } from "react-router-dom";
import { professionCategories } from "../../assets/data/profession.json";
import { currencies } from "../../assets/data/currency.json";
import { countries } from "../../assets/data/country_dialCode.json";
import { callApi } from "../../config/api.ts";
import { isStrongPassword, type CountryCode } from "../../config/others.ts";
import OtpVerification from "../../component/ui/OtpVerification";
import PasswordInput from "../../component/ui/PasswordInput";
import FormAlert from "../../component/ui/FormAlert";
import PhoneInput from "../../component/ui/PhoneInput";

const inputCls = "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

interface UserForm {
    full_name: string;
    email: string;
    phone: string;
    cntryCode: string;
    cntry_dial_code: string;
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
        full_name: "",
        email: "",
        phone: "",
        cntryCode: "",
        cntry_dial_code: "",
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
    const [mobileVerified, setMobileVerified] = useState<boolean>(false);
    const [professions, setProfessions] = useState<Array<string>>([]);
    const isMentor = userForm.role === "MENTOR";
    const navigate = useNavigate();

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "cntry_dial_code") {
            const country = countries.find(v => value === v.code);
            if (country) {
                setUserForm(prev => ({ ...prev, cntryCode: country.code, cntry_dial_code: country.dial_code }));
            }
            return;
        }
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
        if (!otpVerified || !mobileVerified) {
            setError("Please verify both your email and phone number");
            return;
        }
        if (isMentor && mentorForm.charge && !mentorForm.currency) {
            setError("Please select currency to accept credit");
            return;
        }
        if (!isStrongPassword(userForm.password)) {
            setError("Password must be at least 6 characters and include a capital letter, a small letter, a number, and a special character.");
            return;
        }

        const userPayload = {
            ...userForm,
            phone: userForm.cntry_dial_code + userForm.phone,
            profession: userForm.profession === "Other" ? prfsn : userForm.profession,
        };
        delete (userPayload as any).cntryCode;
        delete (userPayload as any).cntry_dial_code;

        const body: CombinedForm = { user: userPayload };
        if (isMentor) body.mentor = mentorForm;
        console.log("Whole form data ", body);
        const result = await callApi("auth/signup", "POST", body);
        console.log("response of api call ", result);
        if (result.success) {
            setError("");
            setSuccess(result.message);
            setTimeout(() => { navigate('/login'); }, 5000);
        } else {
            setSuccess("");
            setError(result.message);
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
                            {["USER", "MENTOR"].map((r) => (
                                <label key={r} className="flex items-center gap-2 text-white cursor-pointer font-medium">
                                    <input type="radio" name="role" value={r} checked={userForm.role === r} onChange={handleUserChange} className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 focus:ring-blue-500 focus:ring-2" />
                                    {r.charAt(0) + r.slice(1).toLowerCase()}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ── PERSONAL INFO ── */}
                    <fieldset className="border border-gray-800 rounded-xl p-6 flex flex-col gap-5">
                        <legend className="text-lg font-semibold text-white px-2">Personal Information</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Full Name *</label>
                                <input type="text" name="full_name" value={userForm.full_name} onChange={handleUserChange} required className={inputCls} placeholder="e.g. John Doe" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Date of Birth</label>
                                <input type="date" name="dob" value={userForm.dob} onChange={handleUserChange} className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Gender</label>
                                <select name="gender" value={userForm.gender} onChange={handleUserChange} className={inputCls}>
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
                                <input type="email" name="email" value={userForm.email} onChange={handleUserChange} required className={inputCls} />
                            </div>

                            <div className="md:col-span-2">
                                <OtpVerification channel="email" email={userForm.email} onVerified={setOtpVerified} />
                            </div>

                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-sm font-medium text-gray-300">Phone *</label>
                                <PhoneInput
                                    phoneValue={userForm.phone}
                                    cntryCodeValue={userForm.cntryCode}
                                    onPhoneChange={handleUserChange}
                                    onCountryChange={handleUserChange}
                                    phoneName="phone"
                                    phoneRequired
                                    selectRequired
                                    selectClassName={`w-1/3 ${inputCls}`}
                                    inputClassName={`w-2/3 ${inputCls}`}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <OtpVerification channel="mobile" phone={userForm.cntry_dial_code + userForm.phone} cntryCode={userForm.cntryCode as CountryCode} onVerified={setMobileVerified} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Password *</label>
                                <PasswordInput name="password" value={userForm.password} onChange={handleUserChange} required className={`w-full ${inputCls}`} />
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
                                <select name="profession_category" value={userForm.profession_category} onChange={handleUserChange} className={inputCls}>
                                    <option value="">Select Category</option>
                                    {Object.keys(professionCategories).map((v) => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Profession</label>
                                <select name="profession" value={userForm.profession} onChange={handleUserChange} className={inputCls}>
                                    <option value="" disabled>Select Profession</option>
                                    {professions.map((v) => <option key={v} value={v}>{v}</option>)}
                                </select>
                                {userForm.profession === "Other" && (
                                    <input type="text" placeholder="Type your profession" name="profession" value={prfsn} onChange={(e) => setPrfsn(e.target.value)} className={`mt-2 ${inputCls}`} />
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
                                <select name="country" value={userForm.country} onChange={handleUserChange} required className={inputCls}>
                                    <option value="" disabled>Select Country</option>
                                    {countryList.getData().map((country, index) => (
                                        <option key={index + "ctry"} value={country.code}>{country.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Postal Code</label>
                                <input type="text" name="postal_code" value={userForm.postal_code} onChange={handleUserChange} className={inputCls} />
                            </div>
                        </div>
                    </fieldset>

                    {/* ── MENTOR SECTION ── */}
                    {isMentor && (
                        <fieldset className="border border-blue-900 bg-blue-950/20 rounded-xl p-6 flex flex-col gap-5">
                            <legend className="text-lg font-semibold text-blue-400 px-2">Mentor Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-300">Experience (years) *</label>
                                    <input type="number" name="experience" value={mentorForm.experience} onChange={handleMentorChange} required className={inputCls} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-300">Charge per session</label>
                                    <input type="number" name="charge" value={mentorForm.charge} onChange={handleMentorChange} className={inputCls} />
                                </div>
                                {mentorForm.charge && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-300">Currency</label>
                                        <select name="currency" value={mentorForm.currency} onChange={handleMentorChange} className={inputCls}>
                                            <option value="">Select Currency</option>
                                            {currencies.map((crncy, i) => <option key={i + "cny"} value={crncy.code}>{crncy.name}-{crncy.symbol}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-300">Available From</label>
                                    <input type="time" name="available_from" value={mentorForm.available_from} onChange={handleMentorChange} className={inputCls} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-300">Available To</label>
                                    <input type="time" name="available_to" value={mentorForm.available_to} onChange={handleMentorChange} className={inputCls} />
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-300">About</label>
                                    <textarea name="about" value={mentorForm.about} onChange={handleMentorChange} rows={3} className={`${inputCls} resize-none`} />
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-300">Achievements</label>
                                    <textarea name="achievements" value={mentorForm.achievements} onChange={handleMentorChange} rows={3} className={`${inputCls} resize-none`} />
                                </div>
                            </div>
                        </fieldset>
                    )}

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition text-base mt-2 shadow-lg shadow-blue-500/20">
                        {isMentor ? "Sign Up as Mentor" : "Sign Up"}
                    </button>
                    <FormAlert message={error} type="error" variant="dark" />
                    <FormAlert message={success} type="success" variant="dark" />
                </form>
            </div>
        </div>
    );
};

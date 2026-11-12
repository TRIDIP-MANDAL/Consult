import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { countries } from "../../assets/data/country_dialCode.json";
import { callApi } from "../../config/api";
import { isValidEmail, isValidMobileNo, type CountryCode } from "../../config/others";
import useUser from "../../lib/UserState";
import PasswordInput from "../../component/ui/PasswordInput";
import FormAlert from "../../component/ui/FormAlert";
import PhoneInput from "../../component/ui/PhoneInput";
import SubmitButton from "../../component/ui/SubmitButton";

const inputCls = "w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
const selectCls = "w-1/3 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer";

export const Login: React.FC = () => {
    const [loginType, setLoginType] = useState<"email" | "phone">("email");
    const [loginForm, setLoginForm] = useState({
        identifier: "",
        password: "",
        role: "USER",
        cntryCode: "",
        cntry_dial_code: ""
    });

    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const navigate = useNavigate();

    const setLogin = useUser((state) => state.setLogin);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "cntry_dial_code") {
            const country = countries.find(v => value === v.code);
            if (country) setLoginForm(prev => ({ ...prev, cntryCode: country.code, cntry_dial_code: country.dial_code }));
        } else {
            setLoginForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTypeToggle = (type: "email" | "phone") => {
        setLoginType(type);
        setLoginForm(prev => ({ ...prev, identifier: "" }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError(""); setSuccess("");

        const formData: any = { password: loginForm.password, role: loginForm.role };

        if (loginType === "email") {
            if (!isValidEmail(loginForm.identifier)) {
                setError("Invalid email or empty email"); setSubmitting(false); return;
            }
            formData.email = loginForm.identifier.trim();
        } else {
            if (!loginForm.cntry_dial_code) {
                setError("Please select a country code"); setSubmitting(false); return;
            }
            if (!isValidMobileNo(loginForm.cntry_dial_code + loginForm.identifier, loginForm.cntryCode as CountryCode)) {
                setError("Invalid mobile number or empty mobile number"); setSubmitting(false); return;
            }
            formData.phone = loginForm.cntry_dial_code + loginForm.identifier;
        }

        try {
            const result: any = await callApi('/auth/login', 'POST', formData);
            if (result.success) {
                setSuccess(result.message || "Logged in successfully!");
                setLogin(result.data);
                setTimeout(() => { navigate("/"); }, 2000);
            } else {
                setError(result.message || "Login failed");
                setSubmitting(false);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-16 font-sans">
            <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                    <p className="text-gray-400 mt-2 text-sm">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* ── ROLE TOGGLE ── */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-gray-300">I am logging in as:</label>
                        <div className="flex gap-6 justify-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                            {["USER", "MENTOR"].map((r) => (
                                <label key={r} className="flex items-center gap-2 text-white cursor-pointer font-medium">
                                    <input type="radio" name="role" value={r} checked={loginForm.role === r} onChange={handleChange} className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500 focus:ring-2" />
                                    {r.charAt(0) + r.slice(1).toLowerCase()}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ── METHOD TOGGLE ── */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-gray-300">Login method:</label>
                        <div className="flex gap-6 justify-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                            {(["email", "phone"] as const).map((t) => (
                                <label key={t} className="flex items-center gap-2 text-white cursor-pointer font-medium">
                                    <input type="radio" name="loginType" value={t} checked={loginType === t} onChange={() => handleTypeToggle(t)} className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500 focus:ring-2" />
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ── IDENTIFIER INPUT ── */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">
                            {loginType === "email" ? "Email Address" : "Phone Number"}
                        </label>
                        {loginType === "email" ? (
                            <input type="email" name="identifier" value={loginForm.identifier} onChange={handleChange} placeholder="Enter email" required className={inputCls} />
                        ) : (
                            <PhoneInput
                                phoneValue={loginForm.identifier}
                                cntryCodeValue={loginForm.cntryCode}
                                onPhoneChange={handleChange}
                                onCountryChange={handleChange}
                                phoneName="identifier"
                                phoneRequired
                                selectRequired
                                selectClassName={selectCls}
                                inputClassName={`${inputCls} w-2/3`}
                            />
                        )}
                    </div>

                    {/* ── PASSWORD ── */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <Link to="/reset-password" className="text-sm text-blue-400 hover:text-blue-300 transition">Forgot password?</Link>
                        </div>
                        <PasswordInput name="password" value={loginForm.password} onChange={handleChange} placeholder="Enter your password" required className={inputCls} />
                    </div>

                    <FormAlert message={error} type="error" variant="dark" />
                    <FormAlert message={success} type="success" variant="dark" />

                    <SubmitButton
                        loading={submitting}
                        label="Login"
                        loadingLabel="Logging in..."
                        className={`w-full py-3.5 px-4 rounded-lg text-white font-bold text-base mt-2 shadow-lg transition-all duration-200 ${submitting ? "bg-blue-800 cursor-not-allowed opacity-70 shadow-none" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"}`}
                    />

                    <p className="text-center text-gray-400 text-sm mt-4">
                        Don't have an account? <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

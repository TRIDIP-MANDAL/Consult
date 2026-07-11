import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { countries } from "../../assets/data/country_dialCode.json";
import { callApi } from "../../config/api";
import { isValidEmail, isValidMobileNo, type CountryCode } from "../../config/others";
import useUser from "../../lib/UserState";

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
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const setLogin = useUser((state) => state.setLogin);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "cntry_dial_code") {
            const country = countries.find(v => value === v.code);
            if (country) {
                setLoginForm(prev => ({ ...prev, cntryCode: country.code, cntry_dial_code: country.dial_code }));
            }
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
        setError("");
        setSuccess("");

        const formData: any = {
            password: loginForm.password,
            role: loginForm.role
        };

        if (loginType === "email") {
            if (!isValidEmail(loginForm.identifier)) {
                setError("Invalid email or empty email");
                setSubmitting(false);
                return;
            }
            formData.email = loginForm.identifier.trim();
        } else {
            if (!loginForm.cntry_dial_code) {
                setError("Please select a country code");
                setSubmitting(false);
                return;
            }
            if (!isValidMobileNo(loginForm.cntry_dial_code + loginForm.identifier, loginForm.cntryCode as CountryCode)) {
                setError("Invalid mobile number or empty mobile number");
                setSubmitting(false);
                return;
            }
            formData.phone = loginForm.cntry_dial_code + loginForm.identifier;
        }

        try {
            const result: any = await callApi('/auth/login', 'POST', formData);
            if (result.success) {
                setSuccess(result.message || "Logged in successfully!");
                setLogin(result.data);

                setTimeout(() => {
                    navigate("/");
                }, 2000);
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
                            <label className="flex items-center gap-2 text-white cursor-pointer font-medium">
                                <input
                                    type="radio"
                                    name="role"
                                    value="USER"
                                    checked={loginForm.role === "USER"}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500 focus:ring-2"
                                />
                                User
                            </label>
                            <label className="flex items-center gap-2 text-white cursor-pointer font-medium">
                                <input
                                    type="radio"
                                    name="role"
                                    value="MENTOR"
                                    checked={loginForm.role === "MENTOR"}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500 focus:ring-2"
                                />
                                Mentor
                            </label>
                        </div>
                    </div>

                    {/* ── METHOD TOGGLE (Email vs Phone) ── */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-gray-300">Login method:</label>
                        <div className="flex gap-6 justify-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                            <label className="flex items-center gap-2 text-white cursor-pointer font-medium">
                                <input
                                    type="radio"
                                    name="loginType"
                                    value="email"
                                    checked={loginType === "email"}
                                    onChange={() => handleTypeToggle("email")}
                                    className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500 focus:ring-2"
                                />
                                Email
                            </label>
                            <label className="flex items-center gap-2 text-white cursor-pointer font-medium">
                                <input
                                    type="radio"
                                    name="loginType"
                                    value="phone"
                                    checked={loginType === "phone"}
                                    onChange={() => handleTypeToggle("phone")}
                                    className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500 focus:ring-2"
                                />
                                Phone
                            </label>
                        </div>
                    </div>

                    {/* ── IDENTIFIER INPUT ── */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">
                            {loginType === "email" ? "Email Address" : "Phone Number"}
                        </label>

                        {loginType === "email" ? (
                            <input
                                type="email"
                                name="identifier"
                                value={loginForm.identifier}
                                onChange={handleChange}
                                placeholder="Enter email"
                                required
                                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        ) : (
                            <div className="flex gap-2">
                                <select
                                    name="cntry_dial_code"
                                    value={loginForm.cntryCode}
                                    onChange={handleChange}
                                    required
                                    className="w-1/3 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
                                >
                                    <option value="" disabled>Code</option>
                                    {countries.map((country) => (
                                        <option key={country.code} value={country.code}>{country.code} ({country.dial_code})</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    name="identifier"
                                    value={loginForm.identifier}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    required
                                    className="w-2/3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                        )}
                    </div>

                    {/* ── PASSWORD INPUT ── */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <Link to="/reset-password" className="text-sm text-blue-400 hover:text-blue-300 transition">Forgot password?</Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={loginForm.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="p-3 rounded-md bg-red-900/50 text-red-400 text-sm border border-red-800 flex items-center">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="p-3 rounded-md bg-green-900/50 text-green-400 text-sm border border-green-800 flex items-center">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <span>{success}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-3.5 px-4 rounded-lg text-white font-bold text-base mt-2 shadow-lg transition-all duration-200 flex justify-center items-center
                            ${submitting
                                ? "bg-blue-800 cursor-not-allowed opacity-70 shadow-none"
                                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                            }`}
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </>
                        ) : "Login"}
                    </button>

                    <p className="text-center text-gray-400 text-sm mt-4">
                        Don't have an account? <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

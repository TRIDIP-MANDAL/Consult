import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OtpVerification from "../../component/cards/EmailOtpVerification.tsx";
import MobOtpVerification from "../../component/cards/MobileOtpVerification.tsx";
import { isStrongPassword, type CountryCode } from "../../config/others.ts";
import { countries } from "../../assets/data/country_dialCode.json"
import { callApi } from "../../config/api.ts";

interface FormData {
  email: string;
  phone: string;
  password: string;
  cntryCode: string;
  cntry_dial_code:string;
  cnf_password: string;
}
const ResetPassword = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    password: "",
    cntryCode: "",
    cntry_dial_code:"",
    cnf_password: ""
  })
  const navigateTo = useNavigate();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [mobileVerified, setMobileVerified] = useState<boolean>(false);
  const [submitting,setSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCnfPassword, setShowCnfPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if(name === "cntry_dial_code") {
      const country = countries.find(v => value === v.code);
      if (country) {
        setFormData(prev =>({...prev, cntryCode: country.code, cntry_dial_code: country.dial_code}))
      }
    }
    else{
    setFormData(prev => ({ ...prev, [name]: value }));
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    if (formData.password !== formData.cnf_password) {
      setError("Passwords do not match");
      setSubmitting(false);
      return;
    }
    if (!(emailVerified && mobileVerified)) {
      setError("Either email or phone is not verified");
      setSubmitting(false);
      return;
    }
    if (!isStrongPassword(formData.password)) {
      setError("Password is not strong");
      setSubmitting(false);
      return;
    }
    
    setError("");
    const sendData = { ...formData };
    sendData.phone = sendData.cntry_dial_code + sendData.phone;
    delete sendData.cnf_password;
    delete sendData.cntryCode;
    delete sendData.cntry_dial_code;
    const result = await callApi('/auth/reset-passwd', 'PATCH', sendData);
    if (result.success) {
      setError("");
      setSuccess(result.message);
          setTimeout(() => {
      navigateTo("/login");
    }, 5000);
    }
    else {
      setSubmitting(false);
      setSuccess("");
      setError(result.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-500 text-sm">Verify your details to create a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Section */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Enter your email" 
              required 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white outline-none"
            />
            <div className="pt-2">
              <OtpVerification email={formData.email} onVerified={setEmailVerified} />
            </div>
          </div>

          {/* Phone Section */}
          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="flex gap-2">
              <select 
                name="cntry_dial_code" 
                id="cntry_dial_code" 
                value={formData.cntryCode} 
                onChange={handleChange} 
                required
                className="w-1/3 px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white text-sm outline-none cursor-pointer"
              >
                <option value="" disabled>Code</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code} >{country.code} ({country.dial_code})</option>
                ))}
              </select>
              <input 
                type="text" 
                name="phone" 
                id="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="Enter your phone" 
                required 
                className="w-2/3 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white outline-none"
              />
            </div>
            <div className="pt-2">
              <MobOtpVerification phone={formData.cntry_dial_code + formData.phone} cntryCode={formData.cntryCode as CountryCode} onVerified={setMobileVerified} />
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  id="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Enter your new password" 
                  required 
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white outline-none"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    )}
                </button>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="cnf_password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
                <input 
                  type={showCnfPassword ? "text" : "password"} 
                  name="cnf_password" 
                  id="cnf_password" 
                  value={formData.cnf_password} 
                  onChange={handleChange} 
                  placeholder="Confirm your new password" 
                  required 
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white outline-none"
                />
                <button
                    type="button"
                    onClick={() => setShowCnfPassword(!showCnfPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    {showCnfPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    )}
                </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-200 flex items-center animate-pulse">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm border border-green-200 flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span>{success}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={submitting}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-md transition-all duration-200 flex justify-center items-center mt-2
              ${submitting 
                ? "bg-indigo-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
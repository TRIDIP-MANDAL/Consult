import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isStrongPassword, type CountryCode } from "../../config/others.ts";
import { countries } from "../../assets/data/country_dialCode.json";
import { callApi } from "../../config/api.ts";
import OtpVerification from "../../component/ui/OtpVerification";
import PasswordInput from "../../component/ui/PasswordInput";
import FormAlert from "../../component/ui/FormAlert";
import PhoneInput from "../../component/ui/PhoneInput";
import SubmitButton from "../../component/ui/SubmitButton";

type Channel = "email" | "mobile";

interface FormData {
  email: string;
  phone: string;
  password: string;
  cntryCode: string;
  cntry_dial_code: string;
  cnf_password: string;
}

const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white outline-none";

const ResetPassword = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    password: "",
    cntryCode: "",
    cntry_dial_code: "",
    cnf_password: ""
  });
  const navigateTo = useNavigate();
  const [channel, setChannel] = useState<Channel>("email");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [mobileVerified, setMobileVerified] = useState<boolean>(false);
  const [resetToken, setResetToken] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Reset OTP state when the user switches channel
  const switchChannel = (next: Channel) => {
    if (next === channel) return;
    setChannel(next);
    setEmailVerified(false);
    setMobileVerified(false);
    setResetToken("");
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "cntry_dial_code") {
      const country = countries.find(v => value === v.code);
      if (country) {
        setFormData(prev => ({ ...prev, cntryCode: country.code, cntry_dial_code: country.dial_code }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Channel-specific field validation
    if (channel === "email" && !formData.email) {
      setError("Please enter your email address"); setSubmitting(false); return;
    }
    if (channel === "mobile") {
      if (!formData.cntryCode) { setError("Please select your country code"); setSubmitting(false); return; }
      if (!formData.phone) { setError("Please enter your phone number"); setSubmitting(false); return; }
    }

    // OTP verification check for active channel
    if (channel === "email" && !emailVerified) {
      setError("Please verify your email address via OTP"); setSubmitting(false); return;
    }
    if (channel === "mobile" && !mobileVerified) {
      setError("Please verify your phone number via OTP"); setSubmitting(false); return;
    }

    if (!resetToken) {
      setError("Verification session missing. Please verify OTP again."); setSubmitting(false); return;
    }
    if (formData.password !== formData.cnf_password) {
      setError("Passwords do not match"); setSubmitting(false); return;
    }
    if (!isStrongPassword(formData.password)) {
      setError("Password is not strong enough"); setSubmitting(false); return;
    }

    // Build payload — only send the identifier that was verified
    const sendData: Record<string, string> = { password: formData.password, resetToken };
    if (channel === "email") {
      sendData.email = formData.email;
      sendData.phone = "";
    } else {
      sendData.phone = formData.cntry_dial_code + formData.phone;
      sendData.email = "";
    }

    const result = await callApi('/auth/reset-passwd', 'PATCH', sendData);
    if (result.success) {
      setError("");
      setSuccess(result.message);
      setTimeout(() => { navigateTo("/login"); }, 5000);
    } else {
      setSubmitting(false);
      setSuccess("");
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-500 text-sm">Verify your identity to create a new password.</p>
        </div>

        {/* Channel toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-6">
          {(["email", "mobile"] as Channel[]).map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => switchChannel(ch)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${channel === ch ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
            >
              Via {ch.charAt(0).toUpperCase() + ch.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email channel */}
          {channel === "email" && (
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required className={inputCls} />
              <div className="pt-2">
                <OtpVerification
                  channel="email"
                  email={formData.email}
                  onVerified={(verified, token) => {
                    setEmailVerified(verified);
                    if (token) setResetToken(token);
                  }}
                />
              </div>
            </div>
          )}

          {/* Mobile channel */}
          {channel === "mobile" && (
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <PhoneInput
                phoneValue={formData.phone}
                cntryCodeValue={formData.cntryCode}
                onPhoneChange={handleChange}
                onCountryChange={handleChange}
                phoneName="phone"
                phoneRequired
                selectRequired
                selectClassName={`w-1/3 px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white text-sm outline-none cursor-pointer`}
                inputClassName={`w-2/3 ${inputCls}`}
              />
              <div className="pt-2">
                <OtpVerification
                  channel="mobile"
                  phone={formData.cntry_dial_code + formData.phone}
                  cntryCode={formData.cntryCode as CountryCode}
                  onVerified={(verified, token) => {
                    setMobileVerified(verified);
                    if (token) setResetToken(token);
                  }}
                />
              </div>
            </div>
          )}

          {/* New Password */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <PasswordInput name="password" id="password" value={formData.password} onChange={handleChange} placeholder="Enter your new password" required className={inputCls} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label htmlFor="cnf_password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <PasswordInput name="cnf_password" id="cnf_password" value={formData.cnf_password} onChange={handleChange} placeholder="Confirm your new password" required className={inputCls} />
          </div>

          <FormAlert message={error} type="error" variant="light" />
          <FormAlert message={success} type="success" variant="light" />

          <SubmitButton
            loading={submitting}
            label="Reset Password"
            loadingLabel="Processing..."
            disabled={!emailVerified && !mobileVerified}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-md transition-all duration-200 mt-2 ${submitting || (!emailVerified && !mobileVerified) ? "bg-indigo-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"}`}
          />
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

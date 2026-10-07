import React, { useState } from "react";
import { isValidEmail, isValidMobileNo, type CountryCode } from "../../config/others";
import { callApi } from "../../config/api";

interface OtpVerificationProps {
  channel: "email" | "mobile";
  // For email channel
  email?: string;
  // For mobile channel
  phone?: string;
  cntryCode?: CountryCode;
  onVerified?: (verified: boolean, resetToken?: string) => void;
}

// Single unified OTP verification component replacing the two separate ones.
// channel="email" → hits otp/sendOtp + otp/verifyOtp
// channel="mobile" → hits otp-mob/send + otp-mob/verify
// onVerified callback is identical to the original cards — (boolean, resetToken?) signature.
const OtpVerification: React.FC<OtpVerificationProps> = ({
  channel,
  email = "",
  phone = "",
  cntryCode,
  onVerified,
}) => {
  const [otp, setOtp] = useState({ value: "", sent: false, verified: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sendOtp = async () => {
    setError(""); setSuccess("");
    if (channel === "email") {
      if (!email || !isValidEmail(email)) {
        setError("Wrong email format or empty email"); return;
      }
      const res = await callApi("otp/sendOtp", "POST", { email });
      if (res.success) { setOtp((p) => ({ ...p, sent: true })); setSuccess(res.message); }
      else setError(res.message);
    } else {
      if (!cntryCode) { setError("Please select country code"); return; }
      if (!phone || !isValidMobileNo(phone, cntryCode)) {
        setError("Wrong phone format or empty phone"); return;
      }
      const res = await callApi("otp-mob/send", "POST", { phone });
      if (res.success) { setOtp((p) => ({ ...p, sent: true })); setSuccess(res.message); }
      else setError(res.message);
    }
  };

  const verifyOtp = async () => {
    setError(""); setSuccess("");
    if (otp.value.length !== 6) { setError("Please enter 6 digit OTP"); return; }

    let res: any;
    if (channel === "email") {
      res = await callApi("otp/verifyOtp", "POST", { email, otp: otp.value });
    } else {
      res = await callApi("otp-mob/verify", "POST", { phone, otp: otp.value });
    }

    if (res && res.success) {
      setOtp((p) => ({ ...p, verified: true }));
      onVerified?.(true, res.resetToken);
      setSuccess(res.message);
    } else {
      setError(res?.message ?? "Verification failed");
    }
  };

  return (
    <div className="max-w-sm w-full bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
      {/* Send / Resend button */}
      {!otp.verified && (
        <button
          type="button"
          onClick={sendOtp}
          disabled={channel === "email" ? !email : !phone}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition"
        >
          {otp.sent ? "Resend OTP" : "Send OTP"}
        </button>
      )}

      {/* Verified badge */}
      {otp.verified && (
        <div className="flex items-center justify-center text-green-400 font-medium">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Verified
        </div>
      )}

      {/* OTP input */}
      {otp.sent && !otp.verified && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Enter OTP</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={otp.value}
              onChange={(e) => setOtp((p) => ({ ...p, value: e.target.value }))}
              placeholder="6-digit code"
              className="flex-1 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={verifyOtp}
              disabled={!otp.value}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}
    </div>
  );
};

export default OtpVerification;

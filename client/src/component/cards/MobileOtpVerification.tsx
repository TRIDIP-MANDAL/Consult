import React, { useState } from "react"
import { isValidMobileNo,type CountryCode } from '../../config/others.ts'
import { callApi } from '../../config/api.ts'

interface OtpData {
    otp: string;
    sent_otp: boolean;
    verified: boolean;
}

interface OtpProp { 
    phone: string;
    cntryCode:CountryCode;
    onVerified?: (verified: boolean) => void 
}

const MobOtpVerification: React.FC<OtpProp> = (props:OtpProp) => {
    const { phone, cntryCode, onVerified } = props;
    const [otp, setOtp] = useState<OtpData>({
        otp: "",
        sent_otp: false,
        verified: false
    })
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const sendOtp = async (): Promise<void> => {
        if(!cntryCode){
            setSuccess("");
            setError("Please select country code");
            return;
        }
        console.log("phone dring otp ", phone)

        if (!phone || !isValidMobileNo(phone, cntryCode)) {
            setSuccess("");
            setError("Wrong phone format or empty phone");
            return;
        }
        const response = await callApi("otp-mob/send", "POST", { phone:phone });
        if (response.success) {
            setOtp((prev) => ({ ...prev, sent_otp: true }))
            setError("");
            setSuccess(response.message);
        } else {
            setSuccess("");
            setError(response.message);
        }
    };

    const verifyOtp = async (): Promise<void> => {
        if (otp.otp.length !== 6) {
            setSuccess("");
            setError("Please enter 6 digit otp");
            return;
        }
        const response = await callApi("otp-mob/verify", "POST", { phone:phone, otp: otp.otp });
        if (response.success) {
            setOtp((p) => ({ ...p, verified: true }));
            onVerified(true);
            setError("");
            setSuccess(response.message);
        } else {
            setSuccess("");
            setError(response.message);
        }
    };

    const otpValueHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setOtp((prev) => ({ ...prev, otp: e.target.value }))
    }

    // const resetOtp = (): void => setOtp({
    //     otp: "",
    //     sent_otp: false,
    //     verified: false
    // })

    return (
        <div className="max-w-sm w-full bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
            {/* Send / Resend OTP */}
            {!otp.verified && (
                <button
                    type="button"
                    onClick={sendOtp}
                    disabled={!phone}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition"
                >
                    {otp.sent_otp ? "Resend OTP" : "Send OTP"}
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

            {/* OTP entry */}
            {otp.sent_otp && !otp.verified && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Enter OTP</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            name="otp"
                            value={otp.otp}
                            onChange={otpValueHandler}
                            placeholder="6‑digit code"
                            className="flex-1 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={verifyOtp}
                            disabled={!otp.otp}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition"
                        >
                            Verify
                        </button>
                    </div>
                </div>
            )}

            {/* Feedback */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
        </div>
    );
};

export default MobOtpVerification;
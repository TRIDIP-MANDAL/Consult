import { useState } from "react"
import { isValidEmail } from '../config/others.ts'
import { callApi } from '../config/api.ts'

interface OtpData {
    otp: string,
    sent_otp: boolean,
    verified: boolean
}

interface OtpResult {
    success:string,
    error:string
}

export const useOtpVerification = () => {
    const [otp, setOtp] = useState<OtpData>({
        otp: "",
        sent_otp: false,
        verified: false
    })

    const sendOtp = async (email: string): Promise<OtpResult> => {
        if (!email || !isValidEmail(email)) {
            return {error:"Wrong email format or empty email", success:""};
        }
        const response = await callApi("otp/sendOtp", "POST", { email })
        if (response.success) {
            setOtp((prev) => ({ ...prev, sent_otp: true }))
            return {error:"", success:response.message};
        }

        return {error:response.message, success:""};
    }

    const verifyOtp = async (email: string): Promise<OtpResult> => {
        if (otp.otp.length !== 6) {
            return {error:"Please enter 6 digit otp", success:""};
        }
        const response = await callApi("otp/verifyOtp", "POST", { email, otp: otp.otp })
        if (response.success) {
            setOtp((prev) => ({ ...prev, verified: true }))
            return {error:"", success:response.message};
        }

        return {error:response.message, success:""};
    }

    const otpValueHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setOtp((prev) => ({ ...prev, otp: e.target.value }))
    }

    const resetOtp = ():void => setOtp({
        otp: "",
        sent_otp: false,
        verified: false
    })

    return { otp, sendOtp, verifyOtp, otpValueHandler, resetOtp };
}
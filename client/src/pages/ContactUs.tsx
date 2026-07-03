import { useState } from "react"
import { callApi } from '../config/api.ts'
import { isValidEmail } from '../config/others.ts';

interface FormInput {
    name: string,
    email: string,
    message: string
}

interface OtpData {
    otp: string,
    sent_otp: boolean,
    verified: boolean
}

export const ContactUs: React.FC = () => {
    const [otp, setOtp] = useState<OtpData>({
        otp: "",
        sent_otp: false,
        verified: false
    });
    const [formData, setFormData] = useState<FormInput>({
        name: "",
        email: "",
        message: ""
    })
    const [error, setError] = useState<string>("");
    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => { return { ...prev, [name]: value } })
        console.log(" Form data changing ", formData)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!otp.verified) {
            setError("At first verify your email address.");
            return;
        }
        const response = await callApi('contactus/create', 'POST', formData);
        console.log("response of sending data ", response);
        // if(response.success){
        //     setFormData({
        //         name: "",
        //         email: "",
        //         message: ""
        //     })
        //     setOtp({
        //         otp: "",
        //         sent_otp: false,
        //         verified: false
        //     })
        //     setError("");
        //     return;
        // }
        // else{
        //     setError(response.message);
        //     return;
        // }
        if (response.error) {
            setError(response.message);
            return;
        }
        else {
            setFormData({
                name: "",
                email: "",
                message: ""
            })
            setOtp({
                otp: "",
                sent_otp: false,
                verified: false
            })
            setError("");
        }
    }

    const sendOtp = async () => { // this part might need to store in a different folder
        console.log(" most updated form data ", formData)
        const { email } = formData;
        if (!email || !isValidEmail(email)) {
            console.log("wrong email format ")
            setError("Wrong email format or empty email")
            return;
        }
        const response = await callApi("otp/sendOtp", "POST", { email })
        console.log("response of sending otp ", response)
        if (response.success) {
            setError("");
            setOtp((prev) => ({ ...prev, sent_otp: true }))
        }
        else {
            setError(response.message);
            return;
        }
    }

    const verifyOtp = async () => {
        console.log('Otp value ', otp)
        if (otp.otp.length != 6) {
            setError("Please enter 6 digit otp");
            return;
        }
        const response = await callApi("otp/verifyOtp", "POST", { email: formData.email, otp: otp.otp })
        console.log("response of verify otp ", response)
        if (response.success) {
            setError("");
            console.log("Otp verified success ")
            setOtp((prev) => ({ ...prev, verified: true }))
        }
        else {
            setError(response.message);
            return;
        }
    }

    const otpValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtp((prev) => ({ ...prev, otp: e.target.value }))
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Contact Us</h1>
                    <p className="text-gray-400 mt-2 text-sm">We'll get back to you as soon as possible.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFieldChange}
                            placeholder="John Doe"
                            className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* Email + Send OTP */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFieldChange}
                                placeholder="john@example.com"
                                disabled={otp.verified}
                                className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {!otp.verified && (
                                <button
                                    type="button"
                                    onClick={sendOtp}
                                    disabled={!formData.email}
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
                        </div>
                    </div>

                    {/* OTP Box (shown after OTP is sent) */}
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
                                    onClick={verifyOtp}
                                    disabled={!otp.otp}
                                    className="disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
                                >
                                    Verify
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Message */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">Message</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleFieldChange}
                            placeholder="Type your message here..."
                            rows={5}
                            className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!otp.verified}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition text-sm mt-2"
                    >
                        Send Message
                    </button>
                </form>
                <p className="text-red-500 text-sm mt-2">{error}</p>
            </div>
        </div>
    )
}

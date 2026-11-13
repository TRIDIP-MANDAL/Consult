import { useState } from "react"
import { callApi } from '../config/api.ts'

interface FormInput {
    name: string,
    email: string,
    message: string
}

export const ContactUs: React.FC = () => {
   const [formData, setFormData] = useState<FormInput>({
        name: "",
        email: "",
        message: ""
    })
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => { return { ...prev, [name]: value } })
        if (success) setSuccess("");
        if (error) setError("");
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await callApi('contactus/create', 'POST', formData);
        console.log("response of sending data ", response);
        if (response.success) {
            setFormData({
                name: "",
                email: "",
                message: ""
            })
            setError("");
            setSuccess(response.message);
        }
        else {
            setSuccess("");
            setError(response.message);
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Contact Us</h1>
                    <p className="text-gray-400 mt-2 text-sm">We'll get back to you as soon as possible.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleFieldChange}
                            placeholder="john@example.com"
                            className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

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

                    <button
                        type="submit"
                        disabled={!formData.name || !formData.email || !formData.name}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition text-sm mt-2"
                    >
                        Send Message
                    </button>
                </form>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
            </div>
        </div>
    )
}

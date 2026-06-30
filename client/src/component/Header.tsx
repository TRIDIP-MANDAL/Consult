// home, find talent, how it works, About us, Contact us, feedbacks, login, sign up, toogle button for dark and white mode in nav bar
import type React from "react";
import { Link } from "react-router-dom";

export const Header: React.FC = () => {
    return (
        <nav className="sticky top-0 z-50 w-full bg-gray-950 border-b border-gray-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="text-violet-400 font-extrabold text-xl tracking-tight">
                    Vriddhi
                </Link>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/"            className="text-gray-300 hover:text-violet-400 text-sm font-medium transition-colors duration-200">Home</Link>
                    <Link to="/find-talent" className="text-gray-300 hover:text-violet-400 text-sm font-medium transition-colors duration-200">Find Talent</Link>
                    <Link to="/how-it-works"className="text-gray-300 hover:text-violet-400 text-sm font-medium transition-colors duration-200">How It Works</Link>
                    <Link to="/aboutus"     className="text-gray-300 hover:text-violet-400 text-sm font-medium transition-colors duration-200">About Us</Link>
                    <Link to="/contactus"   className="text-gray-300 hover:text-violet-400 text-sm font-medium transition-colors duration-200">Contact Us</Link>
                    <Link to="/feedbacks"   className="text-gray-300 hover:text-violet-400 text-sm font-medium transition-colors duration-200">Feedbacks</Link>
                </div>

                {/* Auth + Theme toggle */}
                <div className="flex items-center gap-3">
                    <Link to="/login"  className="text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200">Login</Link>
                    <Link to="/signup" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
                        Sign Up
                    </Link>
                    {/* Dark / Light mode toggle */}
                    <button className="text-gray-400 hover:text-white text-lg transition-colors duration-200 cursor-pointer">
                        🌙
                    </button>
                </div>

            </div>
        </nav>
    )
}

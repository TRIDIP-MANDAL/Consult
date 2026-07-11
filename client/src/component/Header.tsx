// home, find talent, how it works, About us, Contact us, feedbacks, login, sign up, toogle button for dark and white mode in nav bar
import type React from "react";
import { useState ,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUser from "../lib/UserState";
import { callApi } from "../config/api";

export const Header: React.FC = () => {
    const userStore = useUser((state) => state);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownOpen && event.target instanceof Element && !event.target.closest('nav')) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen]);

    const handleLogout = async () => {
        const result = await callApi('/auth/logout', "GET");
        if (result.success) {
            userStore.setLogout();
            navigate("/login");
        } else {
            console.log("Logout failed ");
        }
    }
    return (
        <nav className="sticky top-0 z-50 w-full bg-gray-950 border-b border-gray-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="text-violet-400 font-extrabold text-xl tracking-tight">
                    Vriddhi
                </Link>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/" className="text-gray-300 hover:text-violet-400 text-sm font-medium transition-colors duration-200">Home</Link>
                    <Link to="/find-talent" className="text-gray-300 hover:text-violet-400 text-sm font-medium transition-colors duration-200">Find Talent</Link>
                    <Link to="/how-it-works" className="text-gray-300 hover:text-violet-400 text-sm font-medium transition-colors duration-200">How It Works</Link>
                    <Link to="/aboutus" className="text-gray-300 hover:text-violet-400 text-sm font-medium transition-colors duration-200">About Us</Link>
                    <Link to="/contactus" className="text-gray-300 hover:text-violet-400 text-sm font-medium transition-colors duration-200">Contact Us</Link>
                    <Link to="/feedbacks" className="text-gray-300 hover:text-violet-400 text-sm font-medium transition-colors duration-200">Feedbacks</Link>
                </div>

                {/* Auth + Theme toggle */}
                <div className="flex items-center gap-3">

                    {!userStore.isloggedin ? <><Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200">Login</Link>
                        <Link to="/signup" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
                            Sign Up
                        </Link></> : <div className="relative">
                        <img
                            className="w-10 h-10 rounded-full object-cover cursor-pointer ring-2 ring-violet-500/30"
                            src={userStore.image || "/logos/user.png"}
                            alt="User"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        />
                        {/* Dropdown overlay */}
                        <div className={`absolute right-0 top-full mt-2 w-56 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl shadow-xl py-2 transition-all duration-200 origin-top-right ${dropdownOpen ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none scale-95"}`}>
                            <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-violet-900/40 hover:text-white transition-colors cursor-pointer">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <span>My Profile</span>
                            </Link>
                            <div className="h-px bg-gray-700 my-1"></div>
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-red-300 hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer w-full">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                </div>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>}
                    {/* Dark / Light mode toggle */}
                    <button className="text-gray-400 hover:text-white text-lg transition-colors duration-200 cursor-pointer">
                        🌙
                    </button>
                </div>

            </div>
        </nav>
    )
}

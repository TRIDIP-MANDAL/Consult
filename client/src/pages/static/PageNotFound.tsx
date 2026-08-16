import React from "react";
import { useNavigate, Link } from "react-router-dom";

const PageNotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-24 animate-in fade-in duration-500">
            <div className="text-center max-w-lg mx-auto">
                <div className="relative mb-6">
                    <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-500 to-indigo-700 drop-shadow-xl tracking-tighter">
                        404
                    </h1>
                    <div className="absolute inset-0 bg-violet-500/10 blur-3xl rounded-full -z-10 animate-pulse"></div>
                </div>
                
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
                    Oops! Page not found
                </h2>
                <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                    The page you're looking for seems to have vanished into the void. We are not even able to find it out in the entire multiverse. It might have been moved, renamed, or perhaps it never existed.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 hover:text-white hover:border-gray-600 transition-all duration-200 shadow-sm"
                    >
                        Go Back
                    </button>
                    <Link
                        to="/"
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 shadow-lg shadow-violet-600/25 transition-all duration-200 active:scale-95"
                    >
                        Take me Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PageNotFound;
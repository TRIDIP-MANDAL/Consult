import React from 'react';

interface LoadingProps {
    text?: string;
    size?: 'sml' | 'mdm' | 'lrg';
}

const Loading: React.FC<LoadingProps> = ({ 
    text = "Loading...", 
    size = 'mdm' 
}) => {
    
    const sizeClasses = {
        sml: "w-6 h-6 border-2",
        mdm: "w-10 h-10 border-4",
        lrg: "w-16 h-16 border-4"
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-950 flex flex-col items-center justify-center w-full" >
            <div className="relative flex items-center justify-center">
                <div className={`${sizeClasses[size]} border-violet-500/20 rounded-full absolute`}></div>
                <div className={`${sizeClasses[size]} border-violet-500 border-t-transparent rounded-full animate-spin`}></div>
            </div>
            {text && (
                <p className="mt-4 text-gray-400 text-sm font-medium animate-pulse tracking-wide">
                    {text}
                </p>
            )}
        </div>
    );
};

export default Loading;

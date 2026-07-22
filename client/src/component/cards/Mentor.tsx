import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface MentorData {
  id: string;
  experience: number;
  charge: string | number;
  currency: string;
  verified: boolean;
  rating: string | number;
  expertise?: string;
  user: {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    image?: string | null;
    profession: string;
    profession_category: string;
    country: string;
  };
}

interface MentorCardProps {
  mentor: MentorData;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor }) => {
  const navigate = useNavigate();
  const { user, experience, charge, currency, verified, rating } = mentor;
  const fullName = `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`;

  return (
    <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-violet-900/20 hover:border-violet-500/30 transition-all duration-300 group flex flex-col gap-4">
      {/* Header: Image & Name */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {user.image ? (
            <img src={user.image} alt={fullName} className="w-16 h-16 rounded-full object-cover border-2 border-gray-700 group-hover:border-violet-500 transition-colors" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-xl font-bold text-gray-400 group-hover:border-violet-500 group-hover:text-violet-400 transition-colors">
              {user.first_name[0]}{user.last_name[0]}
            </div>
          )}
          {verified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-gray-900" title="Verified Mentor">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors truncate">{fullName}</h3>
          <p className="text-sm font-medium text-gray-400 truncate">{user.profession}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md border border-gray-700">{user.profession_category}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
               <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
               {user.country}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 py-4 border-y border-gray-800/50 mt-2">
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 text-center">Exp</span>
          <span className="text-sm font-semibold text-gray-200 text-center">{experience} yrs</span>
        </div>
        <div className="flex flex-col items-center justify-center border-x border-gray-800/50">
          <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 text-center">Rating</span>
          <span className="text-sm font-semibold text-yellow-400 flex items-center gap-1 text-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            {rating}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 text-center">Session</span>
          <span className="text-sm font-semibold text-green-400 text-center">{charge} {currency}</span>
        </div>
      </div>

      {/* Action */}
      <div className="flex items-center gap-3 mt-2">
        <div className="w-[60%] flex items-center justify-center bg-gray-800/80 border border-gray-700 rounded-lg py-2.5 group-hover:border-gray-600 transition-colors">
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest">{mentor.expertise || 'BEGINNER'}</span>
        </div>
        <button onClick={() => navigate(`/mentor/${user.id}`)} className="w-[40%] py-2.5 bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white border border-violet-500/20 hover:border-violet-500 rounded-lg font-medium transition-all duration-300 text-sm">
          Profile
        </button>
      </div>
    </div>
  );
};

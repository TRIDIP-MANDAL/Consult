import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { callApi } from '../../config/api';

// Interface for detailed mentor
interface MentorDetailed {
  id: string;
  experience: number;
  about: string | null;
  available_from: string | null;
  available_to: string | null;
  rating: string | number;
  verified: boolean;
  expertise: string;
  level: string | null;
  no_of_consultancy: number;
  charge: string | number | null;
  currency: string | null;
  achievements: string | null;
  created_at: string;
  user: {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    image: string | null;
    gender: string | null;
    dob: string | null;
    profession: string;
    profession_category: string;
    country: string;
    created_at: string;
  }
}

export const MentorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [mentor, setMentor] = useState<MentorDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const response: any = await callApi(`/auth/mentor/${id}`, 'GET');
        if (response.success && response.data) {
          setMentor(response.data);
        } else {
          setError("Failed to load mentor profile");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMentor();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-red-400 mb-4 bg-red-400/10 p-4 rounded-xl border border-red-500/20 max-w-md text-center">{error || "Profile not found"}</div>
        <button onClick={() => navigate(-1)} className="text-violet-400 hover:text-violet-300 underline font-medium">Go Back</button>
      </div>
    );
  }

  const { user } = mentor;
  const fullName = `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors font-medium">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Search
        </button>

        {/* Profile Header Card */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 md:p-10 mb-8 flex flex-col md:flex-row gap-8 items-start backdrop-blur-xl">
          <div className="relative shrink-0 mx-auto md:mx-0">
            {user.image ? (
              <img src={user.image} alt={fullName} className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-gray-800 shadow-2xl" />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gray-800 border-4 border-gray-700 flex items-center justify-center text-5xl font-bold text-gray-400 shadow-2xl">
                {user.first_name[0]}{user.last_name[0]}
              </div>
            )}
            {mentor.verified && (
              <div className="absolute -bottom-3 -right-3 bg-green-500 rounded-xl p-2 border-4 border-black" title="Verified Mentor">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{fullName}</h1>
                <p className="text-lg text-violet-400 font-medium">{user.profession}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gray-800/80 px-4 py-2 rounded-xl border border-gray-700 flex items-center gap-2">
                  <span className="text-yellow-400 flex items-center gap-1 font-bold text-xl">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    {mentor.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
              <span className="bg-gray-800/50 text-gray-300 px-3 py-1.5 rounded-lg text-sm border border-gray-700">{user.profession_category}</span>
              <span className="bg-gray-800/50 text-gray-300 px-3 py-1.5 rounded-lg text-sm border border-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                {user.country}
              </span>
              <span className="bg-gray-800/50 text-gray-300 px-3 py-1.5 rounded-lg text-sm border border-gray-700 uppercase tracking-wider font-semibold text-violet-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                  {mentor.expertise}
              </span>
              {user.gender && (
                <span className="bg-gray-800/50 text-gray-300 px-3 py-1.5 rounded-lg text-sm border border-gray-700 capitalize flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {user.gender.toLowerCase()}
                </span>
              )}
              {user.dob && (
                <span className="bg-gray-800/50 text-gray-300 px-3 py-1.5 rounded-lg text-sm border border-gray-700 flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Born {new Date(user.dob).toLocaleDateString()}
                </span>
              )}
              <span className="bg-gray-800/50 text-gray-300 px-3 py-1.5 rounded-lg text-sm border border-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Joined {new Date(mentor.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-2 text-center">Experience</span>
            <span className="text-3xl font-bold text-white">{mentor.experience} <span className="text-base text-gray-400 font-normal">Years</span></span>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-2 text-center">Sessions</span>
            <span className="text-3xl font-bold text-white">{mentor.no_of_consultancy}</span>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-2 text-center">Session Fee</span>
            <span className="text-3xl font-bold text-green-400">{mentor.charge} <span className="text-base text-gray-400 font-normal">{mentor.currency}</span></span>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-2 text-center">Availability</span>
            <span className="text-sm font-medium text-white text-center">
              {mentor.available_from ? new Date(mentor.available_from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} 
              <br/><span className="text-gray-500">to</span><br/> 
              {mentor.available_to ? new Date(mentor.available_to).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </span>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                About Me
              </h3>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">
                {mentor.about || "This mentor hasn't added a bio yet."}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                Key Achievements
              </h3>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">
                {mentor.achievements || "No achievements listed yet."}
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            {/* Action Card */}
            <div className="bg-gradient-to-b from-gray-900/80 to-gray-900/40 border border-gray-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl sticky top-8">
              <h3 className="text-xl font-bold mb-6 text-center text-white">Ready to accelerate your career?</h3>
              <button className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-violet-900/50 hover:shadow-violet-600/50 mb-4 active:scale-[0.98]">
                Book a Session
              </button>
              <button className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all duration-300 border border-gray-700">
                Message Mentor
              </button>
              
              <div className="mt-6 pt-6 border-t border-gray-800 text-center">
                <p className="text-sm font-medium text-gray-500">Usually responds within 24 hours</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

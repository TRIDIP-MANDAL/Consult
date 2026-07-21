//  here a search option will be available, and each profile will use the template from   client\src\component\Person.tsx

import React, { useEffect,useState } from 'react';
import { MentorCard, type MentorData } from '../component/cards/Mentor';
import { callApi } from '../config/api';

export const FindTalent: React.FC = () => {
  // Mock data to demonstrate the MentorCard
  // Helper to determine optimal limit based on CSS grid columns
  const getOptimalLimit = () => {
    if (typeof window === 'undefined') return 8;
    const w = window.innerWidth;
    if (w >= 1280) return 12;
    if (w >= 1024) return 9;
    if (w >= 768) return 6;
    return 4;
  };

  const [mentors, setMentors] = useState<MentorData[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(getOptimalLimit());
  const [hasMore, setHasMore] = useState(true);

  useEffect(()=>{
    const fetchMentors = async()=>{
      const response: any = await callApi(`/auth/our-mentors?page=${page}&limit=${limit}`, "GET");
      console.log("mentors found ", response)
      
      const newMentors = response?.data || response || [];
      
      if (newMentors.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (page === 1) {
        setMentors(newMentors);
      } else {
        setMentors(prev => [...prev, ...newMentors]);
      }
    }
    fetchMentors();
  },[page, limit])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Find Talent</h1>
        
        {/* Render a grid of mentor cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mentors.map((mentor, index) => (
                <MentorCard key={`${mentor.id}-${index}`} mentor={mentor} />
            ))}
        </div>
        
        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <button 
              onClick={() => setPage(prev => prev + 1)}
              className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-semibold transition-all duration-300 shadow-lg shadow-violet-900/50 hover:shadow-violet-600/50"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

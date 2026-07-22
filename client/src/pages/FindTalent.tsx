//  here a search option will be available, and each profile will use the template from   client\src\component\Person.tsx

import React, { useEffect, useState, useRef } from 'react';
import { MentorCard, type MentorData } from '../component/cards/Mentor';
import { callApi } from '../config/api';
import { countries } from '../assets/data/country_dialCode.json'
import { currencies } from '../assets/data/currency.json'
import { professionCategories } from '../assets/data/profession.json'

export const FindTalent: React.FC = () => {
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
    const [loading, setLoading] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        verified: false,
        expertise: '',
        experience: '',
        rating: '',
        price: '',
        profession_category: '',
        currency: null,
        profession: '',
        country: ''
    });

    // State applied when user clicks "Apply Filters"
    const [appliedFilters, setAppliedFilters] = useState(filters);
    const resetFilter = () => {
        setFilters({ verified: false, expertise: '', experience: '', rating: '', price: '', profession_category: '', profession: '', country: '', currency: null });
        setAppliedFilters({ verified: false, expertise: '', experience: '', rating: '', price: '', profession_category: '', profession: '', country: '', currency: null });
        setPage(1);
    }
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("created filters ", filters)
        setAppliedFilters(filters);
        setPage(1); // Reset page on new search
    };

    useEffect(()=>{ //to get the limit based on the screen sixe, each time component is rendered
       setLimit(getOptimalLimit());
    },[])

    useEffect(() => {
        const fetchMentors = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                });

                // Append applied filters to query parameters
                if (appliedFilters.verified) queryParams.append('verified', 'true');
                if (appliedFilters.expertise) queryParams.append('expertise', appliedFilters.expertise);
                if (appliedFilters.experience) queryParams.append('experience', appliedFilters.experience);
                if (appliedFilters.rating) queryParams.append('rating', appliedFilters.rating);
                if (appliedFilters.price) queryParams.append('price', appliedFilters.price);
                if (appliedFilters.profession_category) queryParams.append('profession_category', appliedFilters.profession_category);
                if (appliedFilters.profession) queryParams.append('profession', appliedFilters.profession);
                if (appliedFilters.country) queryParams.append('country', appliedFilters.country);
                
                console.log(queryParams.toString())
                const response: any = await callApi(`/auth/our-mentors?${queryParams.toString()}`, "GET");
                console.log("mentors found ", response);

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
            } catch (error) {
                console.error("Failed to fetch mentors", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMentors();
    }, [page, appliedFilters])

    // Infinite scroll observer setup
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage((prev) => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loading]);

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Find Talent</h1>

                {/* Horizontal Filters Bar */}
                <div className="w-full bg-gray-900/50 p-6 rounded-2xl border border-gray-800 mb-8 backdrop-blur-xl">
                    <form onSubmit={handleSearch} className="flex flex-col gap-5">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-2">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                </svg>
                                Filters
                            </h2>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" name="verified" checked={filters.verified} onChange={handleFilterChange} className="peer appearance-none w-5 h-5 border border-gray-600 rounded bg-gray-800 checked:bg-violet-600 checked:border-violet-600 transition-all" />
                                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Verified Mentors Only</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                            {/* Category */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                                <select name="profession_category" value={filters.profession_category} onChange={handleFilterChange} className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all">
                                    <option value="">All Categories</option>
                                    {Object.keys(professionCategories).map((v) => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>

                            {/* Profession */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Profession</label>
                                <select name="profession" value={filters.profession} onChange={handleFilterChange} disabled={!filters.profession_category} className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    <option value="">All Professions</option>
                                    {filters.profession_category && (professionCategories as Record<string, string[]>)[filters.profession_category]?.map((v) => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>

                            {/* Expertise */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 truncate" title="MINIMUM EXPERIENCE IN VRIDDHI">Experience Level</label>
                                <select name="expertise" value={filters.expertise} onChange={handleFilterChange} className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all">
                                    <option value="">Not Specified</option>
                                    <option value="BEGINNER">BEGINNER</option>
                                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                                    <option value="EXPERT">EXPERT</option>
                                </select>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Min Rating</label>
                                <select name="rating" value={filters.rating} onChange={handleFilterChange} className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all">
                                    <option value="">Any Rating</option>
                                    <option value="4.5">4.5 & up</option>
                                    <option value="4.0">4.0 & up</option>
                                    <option value="3.0">3.0 & up</option>
                                </select>
                            </div>

                            {/* Experience */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Min Exp (Yrs)</label>
                                <input type="number" name="experience" value={filters.experience} onChange={handleFilterChange} min="0" placeholder="0" className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder-gray-500" />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Max Price</label>
                                <input type="number" name="price" value={filters.price} onChange={handleFilterChange} min="0" placeholder="e.g. 1000" className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder-gray-500" />
                            </div>
                            
                            {/* Currency */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Currency</label>
                                <select name="currency" value={filters.currency || ''} onChange={handleFilterChange} className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all">
                                    <option value="">Not Specified</option>
                                    {currencies.map((v) => <option key={v.code} value={v.code}>{v.code}-{v.symbol}</option>)}
                                </select>
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Country Code</label>
                                <select name="country" value={filters.country} onChange={handleFilterChange} className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all">
                                    <option value="">Not Specified</option>
                                    {countries.map((v) => <option key={v.code} value={v.code}>{v.name}-{v.code}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-4 border-t border-gray-800/50">
                            <button type="button" onClick={resetFilter} className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all border border-gray-700 hover:border-gray-600">
                                Reset Filters
                            </button>
                            <button type="submit" className="w-full sm:w-auto px-8 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-900/50 hover:shadow-violet-600/50 active:scale-[0.98]">
                                Apply Filters
                            </button>
                        </div>
                    </form>
                </div>

                {/* Main Content Area */}
                <div className="w-full">
                    {loading && page === 1 ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4"></div>
                            <p className="text-gray-400">Loading mentors...</p>
                        </div>
                    ) : mentors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-900/30 rounded-2xl border border-gray-800/50 border-dashed">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg">No mentors found matching your filters.</p>
                            <button onClick={resetFilter} className="mt-4 text-violet-500 hover:text-violet-400 underline text-sm transition-colors">Clear all filters</button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {mentors.map((mentor, index) => (
                                    <MentorCard key={`${mentor.id}-${index}`} mentor={mentor} />
                                ))}
                            </div>

                            {/* Infinite Scroll Sentinel */}
                            {hasMore && (
                                <div ref={observerTarget} className="flex justify-center mt-12 mb-8 h-10 w-full">
                                    {loading && page > 1 && (
                                        <div className="flex items-center gap-3 text-gray-400 font-medium">
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-violet-500"></div>
                                            Loading more mentors...
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

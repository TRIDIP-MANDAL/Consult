import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MentorCard, type MentorData } from '../component/cards/Mentor';
import { callApi } from '../config/api';
import { countries } from '../assets/data/country_dialCode.json';
import { currencies } from '../assets/data/currency.json';
import { professionCategories } from '../assets/data/profession.json';
import useUser from '../lib/UserState';

type Mode = 'search' | 'filter';

const emptyFilters = {
    verified: false,
    expertise: '',
    experience: '',
    rating: '',
    price: '',
    profession_category: '',
    currency: null as string | null,
    profession: '',
    country: '',
};

export const FindTalent: React.FC = () => {
    const getOptimalLimit = () => {
        if (typeof window === 'undefined') return 8;
        const w = window.innerWidth;
        if (w >= 1280) return 12;
        if (w >= 1024) return 9;
        if (w >= 768) return 6;
        return 4;
    };

    const userProfessionCategory = useUser((s) => s.profession_category);

    const [mode, setMode] = useState<Mode>('search');

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [filters, setFilters] = useState(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

    const [mentors, setMentors] = useState<MentorData[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(getOptimalLimit);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const observerTarget = useRef<HTMLDivElement>(null); // DOUBT

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchInput(val);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setDebouncedSearch(val);
            setPage(1);
        }, 2000);
    };

    useEffect(() => () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleApplyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("created filters ", filters)
        setAppliedFilters(filters);
        setPage(1);
    };

    const resetFilter = () => {
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setPage(1);
    };

    /* ────────────────────────────────────────────────────
       Mode toggle — reset relevant state when switching
    ──────────────────────────────────────────────────── */
    const switchMode = (next: Mode) => {
        setMode(next);
        setMentors([]);
        setPage(1);
        setHasMore(true);
        if (next === 'search') {
            setAppliedFilters(emptyFilters);
        } else {
            setSearchInput('');
            setDebouncedSearch('');
        }
    };

    /* ────────────────────────────────────────────────────
       Fetch mentors
    ──────────────────────────────────────────────────── */
    const fetchMentors = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (mode === 'search') {
                /* search mode: send query string; if empty, pre-fill
                   with the logged-in user's profession_category         */
                if (debouncedSearch.trim()) {
                    params.append('search', debouncedSearch.trim());
                } else if (userProfessionCategory) {
                    params.append('profession_category', userProfessionCategory);
                }
            } else {
                /* filter mode */
                if (appliedFilters.verified)           params.append('verified', 'true');
                if (appliedFilters.expertise)          params.append('expertise', appliedFilters.expertise);
                if (appliedFilters.experience)         params.append('experience', appliedFilters.experience);
                if (appliedFilters.rating)             params.append('rating', appliedFilters.rating);
                if (appliedFilters.price)              params.append('price', appliedFilters.price);
                if (appliedFilters.profession_category) params.append('profession_category', appliedFilters.profession_category);
                if (appliedFilters.profession)         params.append('profession', appliedFilters.profession);
                if (appliedFilters.country)            params.append('country', appliedFilters.country);
            }

            const response: any = await callApi(`/auth/our-mentors?${params.toString()}`, 'GET');
            const newMentors: MentorData[] = response?.data || response || [];

            setHasMore(newMentors.length >= limit);

            setMentors(prev => (page === 1 ? newMentors : [...prev, ...newMentors]));
        } catch (err) {
            console.error('Failed to fetch mentors', err);
        } finally {
            setLoading(false);
        }
    }, [page, limit, mode, debouncedSearch, appliedFilters, userProfessionCategory]);

    useEffect(() => { fetchMentors(); }, [fetchMentors]);

    /* ────────────────────────────────────────────────────
       Infinite scroll
    ──────────────────────────────────────────────────── */
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );
        const el = observerTarget.current;
        if (el) observer.observe(el);
        return () => { if (el) observer.unobserve(el); };
    }, [hasMore, loading]);

    /* ────────────────────────────────────────────────────
       Shared classes
    ──────────────────────────────────────────────────── */
    const inputCls = 'w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all';
    const labelCls = 'block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2';

    /* ────────────────────────────────────────────────────
       Render
    ──────────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* ── Page title ── */}
                <h1 className="text-3xl font-bold mb-6">Find Talent</h1>

                {/* ── Mode Toggle ── */}
                <div className="flex items-center gap-1 mb-6 bg-gray-900/60 border border-gray-800 rounded-2xl p-1 w-fit">
                    <button
                        onClick={() => switchMode('search')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            mode === 'search'
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {/* search icon */}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                        </svg>
                        Search
                    </button>
                    <button
                        onClick={() => switchMode('filter')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            mode === 'filter'
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {/* filter icon */}
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                        Filters
                    </button>
                </div>

                {/* ══════════════════════════════════════════════
                    SEARCH BAR
                ══════════════════════════════════════════════ */}
                {mode === 'search' && (
                    <div className="w-full md:w-1/2 mb-8 mx-auto">
                        <div className="relative group">
                            {/* magnifier */}
                            <svg
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                            </svg>

                            <input
                                id="mentor-search"
                                type="text"
                                value={searchInput}
                                onChange={handleSearchInput}
                                placeholder="Search mentors by name…"
                                className="w-full bg-gray-900/60 border border-gray-800 hover:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-2xl pl-12 pr-16 py-4 text-base text-white placeholder-gray-500 outline-none transition-all backdrop-blur-xl"
                            />

                            {/* debounce indicator / clear button */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {searchInput && searchInput !== debouncedSearch && (
                                    <span className="text-xs text-gray-500 animate-pulse select-none">searching…</span>
                                )}
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchInput('');
                                            setDebouncedSearch('');
                                            setPage(1);
                                        }}
                                        className="text-gray-500 hover:text-white transition-colors"
                                        title="Clear search"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* context hint */}
                        {!searchInput && userProfessionCategory && (
                            <p className="mt-2 text-xs text-gray-500 pl-1">
                                Showing mentors in your field: <span className="text-violet-400 font-medium">{userProfessionCategory}</span>
                            </p>
                        )}
                        {!searchInput && !userProfessionCategory && (
                            <p className="mt-2 text-xs text-gray-500 pl-1">
                                Showing all mentors. Log in to see recommendations for your field.
                            </p>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════
                    FILTER PANEL
                ══════════════════════════════════════════════ */}
                {mode === 'filter' && (
                    <div className="w-full bg-gray-900/50 p-6 rounded-2xl border border-gray-800 mb-8 backdrop-blur-xl">
                        <form onSubmit={handleApplyFilters} className="flex flex-col gap-5">

                            {/* header + verified toggle */}
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-2">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <svg className="h-5 w-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                    </svg>
                                    Filters
                                </h2>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input type="checkbox" name="verified" checked={filters.verified} onChange={handleFilterChange} className="peer appearance-none w-5 h-5 border border-gray-600 rounded bg-gray-800 checked:bg-violet-600 checked:border-violet-600 transition-all" />
                                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Verified Mentors Only</span>
                                </label>
                            </div>

                            {/* filter grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">

                                <div>
                                    <label className={labelCls}>Category</label>
                                    <select name="profession_category" value={filters.profession_category} onChange={handleFilterChange} className={inputCls}>
                                        <option value="">All Categories</option>
                                        {Object.keys(professionCategories).map((v) => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelCls}>Profession</label>
                                    <select name="profession" value={filters.profession} onChange={handleFilterChange} disabled={!filters.profession_category} className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                        <option value="">All Professions</option>
                                        {filters.profession_category && (professionCategories as Record<string, string[]>)[filters.profession_category]?.map((v) => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelCls} title="MINIMUM EXPERIENCE IN VRIDDHI">Experience Level</label>
                                    <select name="expertise" value={filters.expertise} onChange={handleFilterChange} className={inputCls}>
                                        <option value="">Not Specified</option>
                                        <option value="BEGINNER">BEGINNER</option>
                                        <option value="INTERMEDIATE">INTERMEDIATE</option>
                                        <option value="EXPERT">EXPERT</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelCls}>Min Rating</label>
                                    <select name="rating" value={filters.rating} onChange={handleFilterChange} className={inputCls}>
                                        <option value="">Any Rating</option>
                                        <option value="4.5">4.5 &amp; up</option>
                                        <option value="4.0">4.0 &amp; up</option>
                                        <option value="3.0">3.0 &amp; up</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelCls}>Min Exp (Yrs)</label>
                                    <input type="number" name="experience" value={filters.experience} onChange={handleFilterChange} min="0" placeholder="0" className={`${inputCls} placeholder-gray-500`} />
                                </div>

                                <div>
                                    <label className={labelCls}>Max Price</label>
                                    <input type="number" name="price" value={filters.price} onChange={handleFilterChange} min="0" placeholder="e.g. 1000" className={`${inputCls} placeholder-gray-500`} />
                                </div>

                                <div>
                                    <label className={labelCls}>Currency</label>
                                    <select name="currency" value={filters.currency || ''} onChange={handleFilterChange} className={inputCls}>
                                        <option value="">Not Specified</option>
                                        {currencies.map((v) => <option key={v.code} value={v.code}>{v.code}-{v.symbol}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelCls}>Country Code</label>
                                    <select name="country" value={filters.country} onChange={handleFilterChange} className={inputCls}>
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
                )}

                {/* ══════════════════════════════════════════════
                    MENTOR GRID
                ══════════════════════════════════════════════ */}
                <div className="w-full">
                    {loading && page === 1 ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4" />
                            <p className="text-gray-400">Loading mentors…</p>
                        </div>
                    ) : mentors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-900/30 rounded-2xl border border-gray-800/50 border-dashed">
                            <svg className="h-12 w-12 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg">No mentors found.</p>
                            {mode === 'filter' && (
                                <button onClick={resetFilter} className="mt-4 text-violet-500 hover:text-violet-400 underline text-sm transition-colors">
                                    Clear all filters
                                </button>
                            )}
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
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-violet-500" />
                                            Loading more mentors…
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

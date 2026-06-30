export const HowItWorks: React.FC = () => {
    const steps = [
        { step: "01", title: "Create Your Profile", desc: "Sign up and tell us about your goals, skills, and what you're looking to learn. It takes less than 2 minutes." },
        { step: "02", title: "Browse Expert Mentors", desc: "Explore mentors across 120+ categories. Filter by skills, availability, ratings, and price to find the perfect match." },
        { step: "03", title: "Book a Session", desc: "Pick a time that works for you. Instantly confirm your booking with secure payment and calendar integration." },
        { step: "04", title: "Grow & Achieve", desc: "Attend your session, take notes, and track progress. Rebook anytime and build a long-term mentoring relationship." },
    ];

    const faqs = [
        { q: "How do I choose the right mentor?", a: "You can filter mentors by skill, experience, rating, and availability. Each mentor profile has reviews and a short intro video." },
        { q: "Can I cancel or reschedule a session?", a: "Yes. You can cancel or reschedule up to 24 hours before the session for a full refund or credit." },
        { q: "Are sessions live or recorded?", a: "All sessions are live 1-on-1 video calls. Recordings are optional and only saved with both parties' consent." },
        { q: "What if I'm not satisfied with my session?", a: "We offer a satisfaction guarantee. If your first session doesn't meet expectations, we'll refund or rebook it for free." },
    ];

    return (
        <main className="bg-gray-950 text-gray-200 min-h-screen">

            {/* Page Header */}
            <section className="bg-gradient-to-br from-gray-900 via-gray-950 to-violet-950 py-24 px-6 text-center border-b border-gray-800">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                    How It <span className="text-violet-400">Works</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Getting started with Vriddhi is simple. Four steps to your first mentoring session.
                </p>
            </section>

            {/* Steps */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="space-y-8">
                    {steps.map((s, i) => (
                        <div key={s.step} className={`flex gap-8 items-start p-8 rounded-2xl border border-gray-800 bg-gray-900 hover:border-violet-600 transition-colors duration-300 ${i % 2 === 1 ? "flex-row-reverse" : ""}`}>
                            <div className="text-6xl font-extrabold text-violet-600 opacity-40 flex-shrink-0 w-20 text-center">{s.step}</div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">{s.title}</h2>
                                <p className="text-gray-400 leading-relaxed">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why it works */}
            <section className="border-t border-gray-800 py-20 px-6 bg-gray-900/50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">Why Our Approach Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Personalized Matching", desc: "Our algorithm considers your goals, learning style, and schedule to suggest the best mentor fit." },
                            { title: "Structured Sessions", desc: "Each session follows a clear agenda. Mentors send a pre-session brief so you arrive prepared." },
                            { title: "Progress Tracking", desc: "Set goals with your mentor and track milestones. See measurable improvement after every session." },
                        ].map((f) => (
                            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                                <div className="w-10 h-10 rounded-lg bg-violet-700 mb-4" />
                                <h3 className="text-lg font-bold text-violet-400 mb-2">{f.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <div key={faq.q} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

        </main>
    )
}

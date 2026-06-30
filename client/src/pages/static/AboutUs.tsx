export const AboutUs: React.FC = () => {
    const team = [
        { name: "Anish Bot", role: "Co-Founder & CEO", desc: "10+ years in EdTech. Passionate about bridging the gap between talent and opportunity." },
        { name: "Botter Anish", role: "Co-Founder & CTO", desc: "Full-stack engineer with a background in AI and scalable platforms." },
        { name: "Bottest Anish", role: "Head of Mentors", desc: "Curates and onboards top mentors across industries. Former talent strategist at a Fortune 500." },
        { name: "Shreeman Tridip Mandal", role: "Product Lead", desc: "Obsessed with user experience. Leads product vision and roadmap at Vriddhi." },
    ];

    return (
        <main className="bg-gray-950 text-gray-200 min-h-screen">

            {/* Page Header */}
            <section className="bg-gradient-to-br from-gray-900 via-gray-950 to-violet-950 py-24 px-6 text-center border-b border-gray-800">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                    About <span className="text-violet-400">Vriddhi</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    We believe every person deserves access to a great mentor. Vriddhi is our answer to that belief.
                </p>
            </section>

            {/* Mission & Vision */}
            <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10">
                    <h2 className="text-2xl font-bold text-violet-400 mb-4">Our Mission</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10">
                    <h2 className="text-2xl font-bold text-violet-400 mb-4">Our Vision</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.
                        Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                    </p>
                </div>
            </section>

            {/* Our Story */}
            <section className="border-t border-gray-800 py-20 px-6">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Story</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui
                        ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
                        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.
                    </p>
                </div>

                {/* Stats row */}
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {[
                        { value: "2021", label: "Founded" },
                        { value: "10K+", label: "Mentors" },
                        { value: "50K+", label: "Learners" },
                        { value: "120+", label: "Categories" },
                    ].map((s) => (
                        <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl py-8">
                            <div className="text-3xl font-extrabold text-violet-400">{s.value}</div>
                            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Meet the Team</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {team.map((member) => (
                        <div key={member.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center hover:border-violet-600 transition-colors duration-300">
                            {/* Avatar placeholder */}
                            <div className="w-16 h-16 rounded-full bg-violet-700 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                {member.name[0]}
                            </div>
                            <h3 className="text-white font-bold text-lg">{member.name}</h3>
                            <p className="text-violet-400 text-sm mb-3">{member.role}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{member.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

        </main>
    )
}

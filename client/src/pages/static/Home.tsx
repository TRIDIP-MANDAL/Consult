import heroBanner from "../../assets/hero_banner.png";

export const Home: React.FC = () => {
    return (
        <main className="bg-gray-950 text-gray-200 min-h-screen">

            {/* Hero Section — image with floating tagline */}
            <section className="relative w-full h-[85vh] overflow-hidden">
                <img
                    src={heroBanner}
                    alt="Vriddhi hero banner"
                    className="w-full h-full object-cover object-center"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/50" />

                {/* Floating tagline */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg tracking-tight leading-tight">
                        Where there is a will,
                        <br />
                        <span className="text-violet-400">there is a way.</span>
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl">
                        Connect with world-class mentors and unlock your true potential through personalized guidance.
                    </p>
                    <button className="mt-8 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-3 rounded-xl text-lg transition-colors duration-200 cursor-pointer">
                        Get Started
                    </button>
                </div>
            </section>

            {/* Content Section — lorem ipsum */}
            <section className="max-w-7xl mx-auto px-6 py-20">

                {/* Intro paragraph */}
                <div className="mb-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Vriddhi?</h2>
                    <p className="text-gray-400 max-w-3xl mx-auto text-base leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                </div>

                {/* 3 feature cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {[
                        { title: "Expert Mentors", desc: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint." },
                        { title: "Flexible Sessions", desc: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum consectetur." },
                        { title: "Proven Results", desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque." },
                    ].map((card) => (
                        <div key={card.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-violet-600 transition-colors duration-300">
                            <h3 className="text-xl font-bold text-violet-400 mb-3">{card.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Long text block */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10">
                    <h2 className="text-2xl font-bold text-white mb-6">About the Platform</h2>
                    <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <p>
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                        <p>
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam,
                            eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                        </p>
                    </div>
                </div>

            </section>
        </main>
    )
}
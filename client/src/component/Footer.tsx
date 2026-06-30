import type React from "react";
import { Link } from "react-router-dom";

const TwitterIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const LinkedInIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const GithubIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const YoutubeIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const MailIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const PhoneIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const LocationIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const ArrowRightIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Find Talent", to: "/find-talent" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "About Us", to: "/aboutus" },
  { label: "Contact Us", to: "/contactus" },
  { label: "Feedbacks", to: "/feedbacks" },
];

const talentCategories = [
  { label: "Software Development", to: "/category/software" },
  { label: "UI/UX Design", to: "/category/design" },
  { label: "Data Science & AI", to: "/category/data-science" },
  { label: "Digital Marketing", to: "/category/marketing" },
  { label: "Business Strategy", to: "/category/business" },
  { label: "Content Creation", to: "/category/content" },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Cookie Policy", to: "/cookies" },
  { label: "Refund Policy", to: "/refund" },
];

const socialLinks = [
  { icon: <TwitterIcon />, href: "https://twitter.com", label: "Twitter" },
  { icon: <LinkedInIcon />, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: <InstagramIcon />, href: "https://instagram.com", label: "Instagram" },
  { icon: <GithubIcon />, href: "https://github.com", label: "GitHub" },
  { icon: <YoutubeIcon />, href: "https://youtube.com", label: "YouTube" },
];

const stats = [
  { value: "10K+", label: "Expert Mentors" },
  { value: "50K+", label: "Sessions Booked" },
  { value: "120+", label: "Categories" },
  { value: "98%", label: "Satisfaction Rate" },
];

const FooterLinkItem: React.FC<{ label: string; to: string }> = ({ label, to }) => (
  <li>
    <Link
      to={to}
      className="group flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-all duration-300 text-sm"
    >
      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-violet-400">
        <ArrowRightIcon />
      </span>
      <span className="group-hover:translate-x-1 transition-transform duration-300">{label}</span>
    </Link>
  </li>
);

const SocialButton: React.FC<{ icon: React.ReactNode; href: string; label: string }> = ({ icon, href, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-violet-600 hover:border-violet-500 transition-all duration-300 hover:-translate-y-0.5"
  >
    {icon}
  </a>
);

const NewsletterForm: React.FC = () => (
  <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 mt-4">
    <div className="relative flex-1">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <MailIcon />
      </span>
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all duration-300"
      />
    </div>
    <button
      type="submit"
      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap cursor-pointer"
    >
      Subscribe
    </button>
  </form>
);

const StatsBanner: React.FC = () => (
  <div className="border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-2xl font-bold text-violet-400">{stat.value}</div>
          <div className="text-slate-400 text-sm mt-0.5">{stat.label}</div>
        </div>
      ))}
    </div>
  </div>
);

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative text-white overflow-hidden" style={{ backgroundColor: "#0d0f1a" }}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 right-0 w-80 h-80 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #4f46e5, transparent 70%)" }}
      />

      <StatsBanner />

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Brand Column */}
        <div className="space-y-5">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base text-white transition-all duration-300 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
              }}
            >
              V
            </div>
            <span className="text-xl font-extrabold tracking-tight text-violet-400">Vriddhi</span>
          </Link>

          <p className="text-slate-400 text-sm leading-relaxed">
            Connecting ambitious professionals with world-class mentors. Unlock your potential
            through personalized 1-on-1 sessions with industry experts.
          </p>

          <div className="space-y-2.5">
            <a
              href="mailto:hello@vriddhi.io"
              className="flex items-center gap-2.5 text-slate-400 hover:text-violet-400 transition-colors duration-300 text-sm group"
            >
              <span className="text-violet-500 group-hover:text-violet-400 transition-colors flex-shrink-0">
                <MailIcon />
              </span>
              hello@vriddhi.io
            </a>
            <a
              href="tel:+911234567890"
              className="flex items-center gap-2.5 text-slate-400 hover:text-violet-400 transition-colors duration-300 text-sm group"
            >
              <span className="text-violet-500 group-hover:text-violet-400 transition-colors flex-shrink-0">
                <PhoneIcon />
              </span>
              +91 12345 67890
            </a>
            <p className="flex items-start gap-2.5 text-slate-400 text-sm">
              <span className="text-violet-500 mt-0.5 flex-shrink-0">
                <LocationIcon />
              </span>
              Bengaluru, Karnataka, India
            </p>
          </div>

          <div className="flex gap-2 pt-1 flex-wrap">
            {socialLinks.map((s) => (
              <SocialButton key={s.label} {...s} />
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
            Quick Links
          </h3>
          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <FooterLinkItem key={link.label} {...link} />
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
            Explore Categories
          </h3>
          <ul className="space-y-3">
            {talentCategories.map((link) => (
              <FooterLinkItem key={link.label} {...link} />
            ))}
          </ul>
        </div>

        {/* Newsletter + Legal */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
            Stay in the Loop
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Get weekly insights, mentor spotlights, and exclusive booking deals delivered to your inbox.
          </p>
          <NewsletterForm />
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-slate-500 hover:text-violet-400 text-xs transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs text-center sm:text-left">
            &copy; {currentYear} Vriddhi. All rights reserved. Made with &hearts; in India.
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" aria-hidden="true" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
};
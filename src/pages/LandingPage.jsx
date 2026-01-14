import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "@tsparticles/react";
import { loadBasic } from "@tsparticles/basic";
import { ShieldAlert, ArrowRightCircle, Zap, Users, BarChart2, ShieldCheck, Sparkles } from "lucide-react";

const PARTICLES_OPTIONS = {
  fullScreen: { enable: true, zIndex: -1 },
  particles: {
    number: { value: 45, density: { enable: true, area: 900 } },
    color: { value: ["#7dd3fc", "#a78bfa", "#f472b6"] },
    size: { value: { min: 1, max: 4 } },
    opacity: { value: 0.4, random: true },
    move: { enable: true, speed: 0.9 },
    links: { enable: true, color: "#a855f7", opacity: 0.25, width: 1 },
  },
};

const HERO_WORDS = ["Reporting", "Tracking", "Supporting"];
const FEATURES = [
  { icon: <Zap className="w-7 h-7" />, title: "Structured intake", description: "Capture critical reports quickly with guided forms." },
  { icon: <ShieldCheck className="w-7 h-7" />, title: "Role-aware access", description: "Secure login with JWT, protected routes, and admin-only controls." },
  { icon: <BarChart2 className="w-7 h-7" />, title: "Progress visibility", description: "See filed vs. resolved counts and simple trends to stay aligned." },
];

const LandingPage = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadBasic(engine);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#060913] via-[#090f1f] to-[#0c1229] text-white">
      <Particles id="tsparticles" options={PARTICLES_OPTIONS} init={particlesInit} />
      <Header />
      <main className="flex flex-col gap-24 pb-16">
        <HeroSection />
        <FeaturesSection />
        <ImpactSection />
      </main>
      <Footer />
    </div>
  );
};

const Header = () => (
  <motion.header
    initial={{ y: -30, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6 }}
    className="sticky top-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10"
  >
    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-cyan-300 font-semibold tracking-wide">
        <ShieldAlert className="w-6 h-6" />
        CrisisConnect
      </Link>
      <nav className="hidden md:flex items-center gap-2 text-sm">
        <Link to="/login" className="px-3 py-2 rounded-lg hover:bg-white/10 transition">Login</Link>
        <Link
          to="/register"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-lg shadow-purple-500/25 hover:translate-y-[-1px] transition"
        >
          Get Started
        </Link>
      </nav>
      <Link to="/register" className="md:hidden text-sm px-3 py-2 rounded-lg bg-white/10">
        Join
      </Link>
    </div>
  </motion.header>
);

const HeroSection = () => {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setWordIndex((i) => (i + 1) % HERO_WORDS.length), 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 pt-12 grid gap-12 lg:grid-cols-2 items-center">
      <div className="space-y-8">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Crisis response platform
        </p>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          <span className="text-white">Modern tooling for </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-transparent bg-clip-text"
            >
              {HERO_WORDS[wordIndex]} teams
            </motion.span>
          </AnimatePresence>
        </h1>
        <p className="text-lg text-slate-200/80 max-w-xl">
          Coordinate incidents, triage reports, and keep communities informed with a secure, responsive workspace
          built for real-world urgency.
        </p>
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/register")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 font-semibold shadow-xl shadow-purple-500/25"
          >
            Launch your workspace
          </motion.button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-xl border border-white/15 hover:border-white/30 text-slate-100"
          >
            Sign in
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm text-slate-300">
          {[
            { label: "Secure access", value: "JWT sessions" },
            { label: "User roles", value: "Member / Admin" },
            { label: "Status insight", value: "Filed / Resolved" },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-400">{item.label}</div>
              <div className="text-lg font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative"
      >
        <div className="absolute -inset-6 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-transparent blur-3xl" aria-hidden />
        <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live status</p>
              <p className="text-2xl font-semibold">Operational</p>
            </div>
            <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">Healthy</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {["Triage", "Routing", "Analytics", "Escalation"].map((label, idx) => (
              <div key={label} className="p-3 rounded-lg bg-black/30 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">{label}</span>
                  <span className={`w-2 h-2 rounded-full ${idx === 1 ? "bg-amber-300" : "bg-emerald-300"}`} />
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/10">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400" style={{ width: `${60 + idx * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10">
            <p className="text-xs text-slate-400">Escalations today</p>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold">32</p>
              <span className="text-sm text-emerald-300">+12% vs yesterday</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const FeaturesSection = () => (
  <section className="max-w-6xl mx-auto px-6">
    <div className="flex items-center gap-3 mb-6">
      <Users className="w-6 h-6 text-cyan-300" />
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Built for response teams</p>
    </div>
    <div className="grid gap-6 md:grid-cols-3">
      {FEATURES.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: index * 0.06 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-xl hover:-translate-y-1 transition"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center text-cyan-100">
            {feature.icon}
          </div>
          <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
          <p className="mt-2 text-slate-300">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

const ImpactSection = () => (
  <section className="max-w-6xl mx-auto px-6">
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/3 to-transparent p-8 md:p-10 shadow-2xl backdrop-blur-xl">
      <div className="grid gap-8 md:grid-cols-2 items-center">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Why teams switch</p>
          <h3 className="text-3xl font-semibold text-white">Operational calm in moments that matter most.</h3>
          <p className="text-slate-200/80">
            CrisisConnect combines structured reporting, governed access, and lightweight analytics so your teams can
            move from noise to action without losing context.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Badge>Private reports</Badge>
            <Badge>Role-aware access</Badge>
            <Badge>Admin dashboard</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {["Report filing", "Status tracking", "Admin user oversight", "Support & FAQ"]
            .map((item) => (
              <div key={item} className="p-4 rounded-2xl bg-black/30 border border-white/10">
                <p className="font-semibold text-white">{item}</p>
                <p className="text-xs text-slate-400 mt-1">Available in the current release.</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  </section>
);

const Badge = ({ children }) => (
  <span className="px-3 py-1.5 text-xs rounded-full bg-white/10 border border-white/15 text-slate-100">
    {children}
  </span>
);

const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="border-t border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-slate-400 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} CrisisConnect. Built for rapid, trusted response.</span>
        <span className="text-cyan-200">Live clock: {currentTime.toLocaleTimeString()}</span>
      </div>
    </footer>
  );
};

export default LandingPage;

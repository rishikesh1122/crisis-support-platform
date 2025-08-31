import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "@tsparticles/react";
import { loadBasic } from "@tsparticles/basic";
import { ShieldAlert, ArrowRightCircle, Zap, Users, BarChart2 } from "lucide-react";

// --- Configuration ---
const PARTICLES_OPTIONS = {
  fullScreen: { enable: true, zIndex: -1 },
  background: { color: { value: "#0f0f1c" } },
  particles: {
    number: { value: 60, density: { enable: true, value_area: 800 } },
    color: { value: "#14b8a6" },
    shape: { type: "circle" },
    opacity: { value: 0.5, random: true },
    size: { value: { min: 1, max: 3 }, random: true },
    links: { enable: true, distance: 150, color: "#38bdf8", opacity: 0.3, width: 1 },
    move: { enable: true, speed: 0.8, direction: "none", out_mode: "out" },
  },
  interactivity: {
    events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
    modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } },
  },
};
const HERO_WORDS = ["Empowering", "Connecting", "Supporting"];
const FEATURES = [
  { icon: <Zap className="w-8 h-8 text-cyan-400" />, title: "Real-time Reporting", description: "Instantly file and track crisis reports with precise details, ensuring swift response and action." },
  { icon: <Users className="w-8 h-8 text-sky-400" />, title: "Secure Communication", description: "Engage with support teams and community leaders through a secure, dedicated communication platform." },
  { icon: <BarChart2 className="w-8 h-8 text-indigo-400" />, title: "Data-Driven Insights", description: "Admins can access powerful analytics to understand trends, track resolution times, and improve outcomes." },
];

const LandingPage = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadBasic(engine);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-[#0f0f1c] text-white animated-gradient">
      <Particles id="tsparticles" options={PARTICLES_OPTIONS} init={particlesInit} />
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

// --- Sub-components for Cleaner Code ---

const Header = () => (
  <motion.header initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}
    className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-4 bg-black/20 backdrop-blur-lg border-b border-cyan-400/20 z-50"
  >
    <Link to="/" className="flex items-center gap-2 text-cyan-400">
      <ShieldAlert className="w-7 h-7" />
      <span className="text-xl font-bold tracking-wide">CrisisConnect</span>
    </Link>
    <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
      <motion.div whileHover={{ y: -2 }}><Link to="/login" className="text-cyan-300 hover:text-white transition px-3 py-2">Login</Link></motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link to="/register" className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition">Register</Link>
      </motion.div>
    </nav>
    <div className="md:hidden"><Link to="/login" className="text-cyan-300">Login</Link></div>
  </motion.header> 
);

const HeroSection = () => {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prevIndex) => (prevIndex + 1) % HERO_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center px-6 text-center pt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="max-w-3xl space-y-8">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
          <AnimatePresence mode="wait">
            <motion.span key={wordIndex} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="inline-block bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              {HERO_WORDS[wordIndex]}
            </motion.span>
          </AnimatePresence>
          <span className="block text-white mt-2">Communities in Crisis</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Connect with help, file reports, and stay informed during difficult times — all in one safe, real-time platform.
        </p>
        <motion.button onClick={() => navigate("/login")} whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(56, 189, 248, 0.6)" }} whileTap={{ scale: 0.98 }} className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-semibold text-lg rounded-xl shadow-lg flex items-center gap-3 justify-center mx-auto">
          Get Started <ArrowRightCircle className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </section>
  );
};

const FeaturesSection = () => (
  <section className="py-20 px-6">
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8 }} className="max-w-5xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Why CrisisConnect?</h2>
      <p className="text-lg text-center text-gray-400 mb-12">Everything you need to manage and respond effectively.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {FEATURES.map((feature, index) => <FeatureCard key={index} feature={feature} index={index} />)}
      </div>
    </motion.div>
  </section>
);

const FeatureCard = ({ feature, index }) => (
  <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6, delay: index * 0.15 }} whileHover={{ y: -10, scale: 1.03, boxShadow: "0px 10px 30px rgba(0, 255, 255, 0.1)" }} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-8 text-center space-y-4">
    <div className="inline-block p-4 bg-cyan-900/50 rounded-full mb-4">{feature.icon}</div>
    <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
    <p className="text-gray-300">{feature.description}</p>
  </motion.div>
);

const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="p-4 text-center text-sm text-gray-500 bg-black/20 backdrop-blur-sm border-t border-cyan-900/20">
      Current Time: <span className="text-cyan-400">{currentTime.toLocaleTimeString()}</span> &nbsp;|&nbsp; &copy; {new Date().getFullYear()} CrisisConnect Platform. All rights reserved.
    </footer>
  );
};

export default LandingPage;

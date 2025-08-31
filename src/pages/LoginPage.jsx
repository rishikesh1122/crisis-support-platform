import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios"; // Using axios for consistency
import Particles from "@tsparticles/react";
import { loadBasic } from "@tsparticles/basic";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from "react-icons/fa";

// --- Configuration for Particles.js ---
const PARTICLES_OPTIONS = {
  fullScreen: { enable: true, zIndex: -1 },
  background: { color: { value: "#0f0f1c" } },
  particles: {
    number: { value: 60, density: { enable: true, value_area: 800 } },
    color: { value: "#14b8a6" },
    shape: { type: "circle" },
    opacity: { value: 0.5, random: true },
    size: { value: { min: 1, max: 3 }, random: true },
    links: {
      enable: true,
      distance: 150,
      color: "#38bdf8",
      opacity: 0.3,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.8,
      direction: "none",
      out_mode: "out",
    },
  },
  interactivity: {
    events: {
      onhover: { enable: true, mode: "repulse" },
      onclick: { enable: true, mode: "push" },
    },
    modes: {
      repulse: { distance: 100 },
      push: { particles_nb: 4 },
    },
  },
};

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const particlesInit = async (engine) => await loadBasic(engine);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    setError("");
    setIsLoading(true);
    
    try {
      // Using axios for cleaner syntax and error handling
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      
      setIsSuccess(true);
      localStorage.setItem("token", res.data.token);
      
      // Navigate after a short delay to show success feedback
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Variants for staggered animations
  const formVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' } },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#0f0f1c]">
      <Particles id="tsparticles" init={particlesInit} options={PARTICLES_OPTIONS} />

      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl border border-cyan-400/30 text-white p-8 sm:p-10 rounded-3xl w-full max-w-md shadow-[0_0_40px_rgba(13,255,245,0.2)]"
      >
        <motion.h2 variants={itemVariants} className="text-4xl font-extrabold text-center mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-lg">
          Welcome Back
        </motion.h2>
        <motion.p variants={itemVariants} className="text-center text-gray-300 mb-8">Sign in to access your dashboard.</motion.p>
        
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-red-400 bg-red-950/80 border border-red-500/50 p-3 rounded-lg mb-4 text-center text-sm overflow-hidden"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants} className="relative">
            <FaEnvelope className="absolute top-1/2 left-4 -translate-y-1/2 text-cyan-400/70" />
            <input name="email" type="email" placeholder="Email" required onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow duration-300" />
          </motion.div>
          <motion.div variants={itemVariants} className="relative">
            <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-cyan-400/70" />
            <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" required onChange={handleChange} className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow duration-300" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition" aria-label="Toggle password visibility">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </motion.div>
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`w-full py-3 rounded-lg text-white font-semibold text-lg transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed
                ${isSuccess ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 hover:shadow-cyan-500/50'}
              `}
              whileHover={{ scale: (isLoading || isSuccess) ? 1 : 1.05 }}
              whileTap={{ scale: (isLoading || isSuccess) ? 1 : 0.98 }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={isLoading ? 'loading' : isSuccess ? 'success' : 'ready'}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center gap-2"
                >
                  {isLoading && <><FaSpinner className="animate-spin" /> Signing In...</>}
                  {isSuccess && <><FaCheckCircle /> Success!</>}
                  {!isLoading && !isSuccess && "Sign In"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>

        <motion.p variants={itemVariants} className="text-sm text-center mt-8 text-gray-400">
          Don’t have an account?{" "}
          <motion.span
            className="text-cyan-400 hover:underline cursor-pointer font-semibold"
            onClick={() => navigate("/register")}
            whileHover={{ textShadow: "0px 0px 4px rgb(34 211 238)" }}
          >
            Register here
          </motion.span>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;

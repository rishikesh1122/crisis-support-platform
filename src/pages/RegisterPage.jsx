import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Particles from "@tsparticles/react";
import { loadBasic } from "@tsparticles/basic";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from "react-icons/fa";

// --- Configuration ---
const PARTICLES_OPTIONS = { /* Omitted for brevity, but same as LoginPage */
  fullScreen: { enable: true, zIndex: -1 }, background: { color: { value: "#0f0f1c" } },
  particles: { number: { value: 60 }, color: { value: "#14b8a6" }, shape: { type: "circle" },
    opacity: { value: 0.5 }, size: { value: { min: 1, max: 3 } },
    links: { enable: true, distance: 150, color: "#38bdf8", opacity: 0.3, width: 1, },
    move: { enable: true, speed: 0.8, },
  },
  interactivity: { events: { onhover: { enable: true, mode: "repulse" }, }, },
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const particlesInit = async (engine) => await loadBasic(engine);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    setError("");
    setIsLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' } },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#0f0f1c]">
      <Particles id="tsparticles" init={particlesInit} options={PARTICLES_OPTIONS} />
      <motion.div
        variants={formVariants} initial="hidden" animate="visible"
        className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl border border-cyan-400/30 text-white p-8 sm:p-10 rounded-3xl w-full max-w-md shadow-[0_0_40px_rgba(13,255,245,0.2)]"
      >
        <motion.h2 variants={itemVariants} className="text-4xl font-extrabold text-center mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-lg">
          Create Account
        </motion.h2>
        <motion.p variants={itemVariants} className="text-center text-gray-300 mb-8">Join the community today.</motion.p>
        
        <AnimatePresence>
          {error && (
            <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="text-red-400 bg-red-950/80 border border-red-500/50 p-3 rounded-lg mb-4 text-center text-sm overflow-hidden"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants} className="relative">
            <FaUser className="absolute top-1/2 left-4 -translate-y-1/2 text-cyan-400/70" />
            <input name="name" placeholder="Full Name" required onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow" />
          </motion.div>
          <motion.div variants={itemVariants} className="relative">
            <FaEnvelope className="absolute top-1/2 left-4 -translate-y-1/2 text-cyan-400/70" />
            <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow" />
          </motion.div>
          <motion.div variants={itemVariants} className="relative">
            <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-cyan-400/70" />
            <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" required onChange={handleChange} className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition" aria-label="Toggle password visibility">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <PasswordStrengthMeter password={formData.password} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.button type="submit" disabled={isLoading || isSuccess}
              className={`w-full py-3 rounded-lg text-white font-semibold text-lg transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${isSuccess ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 hover:shadow-cyan-500/50'}`}
              whileHover={{ scale: (isLoading || isSuccess) ? 1 : 1.05 }}
              whileTap={{ scale: (isLoading || isSuccess) ? 1 : 0.98 }}
            >
              <AnimatePresence mode="wait">
                <motion.span key={isLoading ? 'loading' : isSuccess ? 'success' : 'ready'} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center justify-center gap-2">
                  {isLoading && <><FaSpinner className="animate-spin" /> Creating Account...</>}
                  {isSuccess && <><FaCheckCircle /> Success!</>}
                  {!isLoading && !isSuccess && "Create Account"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>

        <motion.p variants={itemVariants} className="text-sm text-center mt-8 text-gray-400">
          Already have an account?{" "}
          <motion.span className="text-cyan-400 hover:underline cursor-pointer font-semibold" onClick={() => navigate("/login")} whileHover={{ textShadow: "0px 0px 4px rgb(34 211 238)" }}>
            Login here
          </motion.span>
        </motion.p>
      </motion.div>
    </div>
  );
};

// --- Password Strength Sub-component ---
const PasswordStrengthMeter = ({ password }) => {
  const getStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strength = getStrength;
  const config = {
    0: { width: '0%', color: 'bg-transparent', label: '' },
    1: { width: '25%', color: 'bg-red-500', label: 'Weak' },
    2: { width: '50%', color: 'bg-yellow-500', label: 'Medium' },
    3: { width: '75%', color: 'bg-sky-500', label: 'Good' },
    4: { width: '100%', color: 'bg-emerald-500', label: 'Strong' },
  }[strength];

  return (
    <div className="h-6 -mt-2">
      {password.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${config.color}`}
              initial={{ width: '0%' }}
              animate={{ width: config.width }}
              transition={{ duration: 0.3 }}
            ></motion.div>
          </div>
          <span className="text-xs font-semibold w-20 text-right">{config.label}</span>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;

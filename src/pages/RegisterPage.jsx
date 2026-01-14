import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Particles from "@tsparticles/react";
import { loadBasic } from "@tsparticles/basic";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from "react-icons/fa";

const PARTICLES_OPTIONS = {
  fullScreen: { enable: true, zIndex: -1 },
  particles: {
    number: { value: 40, density: { enable: true, area: 1000 } },
    color: { value: ["#67e8f9", "#a855f7", "#f472b6"] },
    links: { enable: true, opacity: 0.2, color: "#a855f7" },
    move: { enable: true, speed: 1 },
  },
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
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <Particles id="tsparticles" init={particlesInit} options={PARTICLES_OPTIONS} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/6 via-transparent to-white/6 pointer-events-none" aria-hidden />

      <div className="grid max-w-6xl w-full mx-auto gap-10 lg:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Create workspace</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Set up your CrisisConnect access.</h1>
          <p className="mt-3 text-slate-200/80">
            Secure reporting, guided triage, and analytics ready from day one. No extra setup needed.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            {["Guided onboarding", "Role-aware controls", "Encrypted uploads", "Analytics-ready"].map((item) => (
              <div key={item} className="p-3 rounded-xl bg-black/30 border border-white/10 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-8 rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Create account</p>
              <h2 className="text-2xl font-semibold">Join the response network</h2>
            </div>
            <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-xs text-white border border-white/10">
              Secure by default
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-100 p-3 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field icon={<FaUser />} name="name" placeholder="Full name" onChange={handleChange} autoComplete="name" />
            <Field icon={<FaEnvelope />} name="email" type="email" placeholder="Work email" onChange={handleChange} autoComplete="email" />
            <Field
              icon={<FaLock />}
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              onChange={handleChange}
              autoComplete="new-password"
              trailing={
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-slate-300">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              }
            />
            <PasswordStrengthMeter password={formData.password} />

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 font-semibold text-white shadow-xl shadow-purple-500/25 disabled:opacity-70"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={isLoading ? "loading" : isSuccess ? "success" : "ready"}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center gap-2"
                >
                  {isLoading && <><FaSpinner className="animate-spin" /> Creating...</>}
                  {isSuccess && <><FaCheckCircle /> Done</>}
                  {!isLoading && !isSuccess && "Create account"}
                </motion.span>
              </AnimatePresence>
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-300 text-center">
            Already have an account?
            <button onClick={() => navigate("/login")} className="ml-2 text-cyan-200 hover:text-white">Sign in</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const Field = ({ icon, trailing, ...props }) => (
  <div className="relative">
    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-200/80">{icon}</div>
    <input
      {...props}
      className="w-full pr-12 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/40 outline-none"
      style={{ paddingLeft: "3.25rem" }}
      required
    />
    {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
  </div>
);

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
    0: { width: "0%", color: "bg-transparent", label: "" },
    1: { width: "25%", color: "bg-red-500", label: "Weak" },
    2: { width: "50%", color: "bg-yellow-500", label: "Medium" },
    3: { width: "75%", color: "bg-sky-500", label: "Good" },
    4: { width: "100%", color: "bg-emerald-500", label: "Strong" },
  }[strength];

  return (
    <div className="h-6 -mt-1">
      {password.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${config.color}`}
              initial={{ width: "0%" }}
              animate={{ width: config.width }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs font-semibold w-20 text-right text-slate-200">{config.label}</span>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;

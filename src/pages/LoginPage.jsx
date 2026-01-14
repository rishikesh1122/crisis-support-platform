import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Particles from "@tsparticles/react";
import { loadBasic } from "@tsparticles/basic";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from "react-icons/fa";

const PARTICLES_OPTIONS = {
  fullScreen: { enable: true, zIndex: -1 },
  particles: {
    number: { value: 35, density: { enable: true, area: 1000 } },
    color: { value: ["#67e8f9", "#a855f7", "#f472b6"] },
    links: { enable: true, opacity: 0.2, color: "#67e8f9" },
    move: { enable: true, speed: 1 },
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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;
    setError("");
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      setIsSuccess(true);
      localStorage.setItem("token", res.data.token);
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-height-screen min-h-screen flex items-center justify-center px-4 py-10">
      <Particles id="tsparticles" init={particlesInit} options={PARTICLES_OPTIONS} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 pointer-events-none" aria-hidden />

      <div className="grid max-w-5xl w-full mx-auto gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">CrisisConnect</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Welcome back.</h1>
          <p className="mt-3 text-slate-200/80">
            Rejoin your command center, pick up triage where you left off, and keep your teams aligned.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            {["Live triage", "Audit-ready", "Secure files", "24/7 uptime"].map((item) => (
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
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Sign in</p>
              <h2 className="text-2xl font-semibold">Access your workspace</h2>
            </div>
            <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-xs text-white border border-white/10">
              Secure session
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
            <Field
              icon={<FaEnvelope />}
              name="email"
              type="email"
              placeholder="you@organization.com"
              onChange={handleChange}
              autoComplete="email"
            />
            <Field
              icon={<FaLock />}
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              onChange={handleChange}
              autoComplete="current-password"
              trailing={
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-slate-300">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              }
            />

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
                  {isLoading && <><FaSpinner className="animate-spin" /> Signing in</>}
                  {isSuccess && <><FaCheckCircle /> Success</>}
                  {!isLoading && !isSuccess && "Continue"}
                </motion.span>
              </AnimatePresence>
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-300 text-center">
            New to CrisisConnect?
            <button onClick={() => navigate("/register")} className="ml-2 text-cyan-200 hover:text-white">Create an account</button>
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

export default LoginPage;

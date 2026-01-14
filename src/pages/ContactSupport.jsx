import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeadset, FaCheckCircle, FaTimesCircle, FaSpinner, FaChevronDown } from "react-icons/fa";

// --- Configuration ---
const SUPPORT_CATEGORIES = [
  "General Inquiry",
  "Technical Problem",
  "Billing Question",
  "Feedback & Suggestions",
  "Account Issues",
];

const FAQ_DATA = [
  {
    q: "How do I update my profile information?",
    a: "You can update your profile by navigating to the Dashboard, where you'll find options to edit your details and change your avatar.",
  },
  {
    q: "What is the response time for reports?",
    a: "Our team aims to review all pending reports within 24-48 hours. You will be notified once the status of your report changes.",
  },
  {
    q: "How do I reset my password?",
    a: "To reset your password, please log out and use the 'Forgot Password' link on the login page. Follow the instructions sent to your email.",
  },
];

// --- Main Component ---
const ContactSupport = () => {
  const [form, setForm] = useState({
    category: SUPPORT_CATEGORIES[0],
    subject: "",
    message: "",
  });
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(0); // Open the first FAQ by default

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", text: "" });

    // Simulate an API call
    setTimeout(() => {
      console.log("Submitting support message:", form);
      setLoading(false);
      setFeedback({ type: "success", text: "Message sent! Our team will get back to you shortly." });
      setForm({ category: SUPPORT_CATEGORIES[0], subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 text-slate-100">
      {/* Left side: The Form */}
      <div className="lg:col-span-3">
        <div className="flex items-center gap-3 mb-6">
          <FaHeadset className="text-3xl text-cyan-300" />
          <h2 className="text-3xl font-bold text-white">Contact Support</h2>
        </div>
        <p className="mb-6 text-sm text-slate-300">
          Have a question or need help? Fill out the form below, and we'll get back to you as soon as possible.
        </p>

        <Alert type={feedback.type} text={feedback.text} />
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
          <div>
            <label htmlFor="category" className="block mb-2 text-sm font-medium text-slate-200">How can we help?</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none">
              {SUPPORT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="subject" className="block mb-2 text-sm font-medium text-slate-200">Subject</label>
            <input id="subject" name="subject" value={form.subject} onChange={handleChange} placeholder="A brief summary of your message" required className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white placeholder:text-slate-400" />
          </div>
          <div>
            <label htmlFor="message" className="block mb-2 text-sm font-medium text-slate-200">Message</label>
            <textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder="Please provide details here..." required rows={6} className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white placeholder:text-slate-400" />
          </div>
          <div className="flex items-center justify-end">
            <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-40 py-2.5 rounded-lg text-white font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (<><FaSpinner className="animate-spin" /> Sending...</>) : "Send Message"}
            </button>
          </div>
        </form>
      </div>

      {/* Right side: FAQs and Info */}
      <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-xl shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">Quick Answers</h3>
        <div className="space-y-2">
          {FAQ_DATA.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openFaq === index}
              onToggle={() => setOpenFaq(openFaq === index ? null : index)}
            />
          ))}
        </div>
        <div className="mt-8 border-t border-white/10 pt-6">
          <h4 className="font-semibold text-white">Need other ways to reach us?</h4>
          <p className="mt-2 text-sm text-slate-300">
            You can also email us directly at <a href="mailto:support@crisisconnect.app" className="text-cyan-200 font-medium hover:underline">support@crisisconnect.app</a>.
            </p>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components for better organization ---

const FAQItem = ({ faq, isOpen, onToggle }) => (
  <div className="border-b border-white/10 last:border-b-0">
    <button onClick={onToggle} className="w-full flex justify-between items-center text-left py-4">
      <span className="font-semibold text-sm text-white">{faq.q}</span>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <FaChevronDown className={`text-slate-400 transition-transform ${isOpen ? 'text-cyan-300' : ''}`} />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <p className="pb-4 text-sm text-slate-200">{faq.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Alert = ({ type, text }) => {
  if (!text) return null;
  const styles = {
    success: "bg-emerald-500/15 border border-emerald-300/30 text-emerald-100",
    error: "bg-red-500/15 border border-red-300/30 text-red-100",
  };
  const icons = { success: <FaCheckCircle />, error: <FaTimesCircle /> };

  return (
    <div className={`flex items-center gap-3 p-3 mb-4 rounded-lg text-sm ${styles[type]}`}>
      <span className="text-xl">{icons[type]}</span>
      <span>{text}</span>
    </div>
  );
};

export default ContactSupport;

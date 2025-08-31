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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left side: The Form */}
      <div className="lg:col-span-3">
        <div className="flex items-center gap-3 mb-6">
          <FaHeadset className="text-3xl text-purple-600 dark:text-purple-400" />
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Contact Support</h2>
        </div>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Have a question or need help? Fill out the form below, and we'll get back to you as soon as possible.
        </p>

        <Alert type={feedback.type} text={feedback.text} />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">How can we help?</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition">
              {SUPPORT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="subject" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
            <input id="subject" name="subject" value={form.subject} onChange={handleChange} placeholder="A brief summary of your message" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition" />
          </div>
          <div>
            <label htmlFor="message" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
            <textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder="Please provide details here..." required rows={6} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition" />
          </div>
          <div className="flex items-center justify-end">
            <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-40 py-2.5 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (<><FaSpinner className="animate-spin" /> Sending...</>) : "Send Message"}
            </button>
          </div>
        </form>
      </div>

      {/* Right side: FAQs and Info */}
      <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Quick Answers</h3>
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
        <div className="mt-8 border-t dark:border-slate-700 pt-6">
            <h4 className="font-semibold text-slate-700 dark:text-slate-200">Need other ways to reach us?</h4>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                You can also email us directly at <a href="mailto:support@crisisconnect.app" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">support@crisisconnect.app</a>.
            </p>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components for better organization ---

const FAQItem = ({ faq, isOpen, onToggle }) => (
  <div className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
    <button onClick={onToggle} className="w-full flex justify-between items-center text-left py-4">
      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{faq.q}</span>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <FaChevronDown className={`text-slate-500 transition-transform ${isOpen ? 'text-purple-600' : ''}`} />
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
          <p className="pb-4 text-sm text-slate-600 dark:text-slate-400">{faq.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Alert = ({ type, text }) => {
  if (!text) return null;
  const styles = {
    success: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200",
    error: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200",
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

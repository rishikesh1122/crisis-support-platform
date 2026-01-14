import React, { useState } from "react";
import axios from "axios";
import { 
  FaPlusCircle, FaCheckCircle, 
  FaTimesCircle, FaSpinner 
} from "react-icons/fa";

// --- Configuration Constants ---
const REPORT_CATEGORIES = [
  "Technical Issue",
  "User Conflict",
  "Safety Concern",
  "Content Violation",
  "Billing Inquiry",
  "Other",
];
const URGENCY_LEVELS = ["Low", "Medium", "High"];
const MAX_DESC_LENGTH = 1000;

const FileReport = ({ onReportFiled }) => {
  // State is now simpler without the 'attachment' field
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    category: REPORT_CATEGORIES[0],
    urgency: URGENCY_LEVELS[1], // Default to Medium
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // The form reset is now simpler
  const resetForm = () => {
    setFormState({
      title: "",
      description: "",
      category: REPORT_CATEGORIES[0],
      urgency: URGENCY_LEVELS[1],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      const token = localStorage.getItem("token");
      
      // The payload is now a simple JSON object, not FormData
      await axios.post("/api/reports", formState, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Set the correct header for sending JSON data
          'Content-Type': 'application/json',
        },
      });

      setMessage({ type: "success", text: "Report filed successfully! The team has been notified." });
      resetForm();
      
      // Notify the parent component to refresh its data
      if (onReportFiled) {
        onReportFiled();
      }

    } catch (err) {
      console.error("Error filing report:", err.response || err);
      const errorMsg = err.response?.data?.message || "An unexpected error occurred. Please try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto text-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <FaPlusCircle className="text-3xl text-cyan-300" />
        <h2 className="text-3xl font-bold text-white">File a New Report</h2>
      </div>

      <Alert type={message.type} text={message.text} />

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-slate-200">Report Title</label>
          <input id="title" name="title" value={formState.title} onChange={handleChange} placeholder="e.g., System Bug in Profile Section" required className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white placeholder:text-slate-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block mb-2 text-sm font-medium text-slate-200">Category</label>
            <select id="category" name="category" value={formState.category} onChange={handleChange} className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none">
              {REPORT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-200">Urgency Level</label>
            <div className="flex bg-black/30 rounded-lg p-1 border border-white/10">
              {URGENCY_LEVELS.map(level => (
                <button type="button" key={level} onClick={() => setFormState(prev => ({...prev, urgency: level}))} className={`w-full py-2 text-sm font-semibold rounded-md transition-all duration-200 ${formState.urgency === level ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow" : "text-slate-200 hover:bg-white/5"}`}>
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 text-sm font-medium text-slate-200">Detailed Description</label>
          <textarea id="description" name="description" value={formState.description} onChange={handleChange} placeholder="Please provide as much detail as possible..." required rows={6} maxLength={MAX_DESC_LENGTH} className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white placeholder:text-slate-400" />
          <p className="text-xs text-right mt-1 text-slate-300">{formState.description.length} / {MAX_DESC_LENGTH}</p>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
          <button type="button" onClick={resetForm} disabled={loading} className="py-2 px-5 text-sm font-medium text-slate-200 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition disabled:opacity-50">Clear</button>
          <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-40 py-2.5 rounded-lg text-white font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-95 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? (<><FaSpinner className="animate-spin" /> Submitting...</>) : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Reusable Alert Component ---
const Alert = ({ type, text }) => {
  if (!text) return null;

  const styles = {
    success: "bg-emerald-500/15 border border-emerald-300/30 text-emerald-100",
    error: "bg-red-500/15 border border-red-300/30 text-red-100",
  };
  const icons = {
    success: <FaCheckCircle className="text-xl" />,
    error: <FaTimesCircle className="text-xl" />,
  };

  return (
    <div className={`flex items-center gap-3 p-3 mb-4 rounded-lg text-sm ${styles[type]}`}>
      {icons[type]}
      <span>{text}</span>
    </div>
  );
};

export default FileReport;

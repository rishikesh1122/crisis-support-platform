import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaQuestionCircle, FaSearch, FaChevronDown } from "react-icons/fa";

// --- Configuration ---
const faqs = [
  { 
    q: "How do I file a new report?", 
    a: "Navigate to the 'File Report' section from the main dashboard or the sidebar. Fill in all the required fields, including a title, detailed description, category, and urgency level, then click 'Submit Report'." 
  },
  { 
    q: "How can I check the status of my submitted reports?", 
    a: "You can view all your reports and their current statuses (Pending, In Progress, Resolved) in the 'View Reports' section. You will also receive a notification when a status changes." 
  },
  { 
    q: "How long does it take for a report to be resolved?", 
    a: "Our admin team aims to review and begin processing all new reports within 24-48 business hours. The total resolution time can vary depending on the complexity of the issue." 
  },
  {
    q: "Can I update my profile information?",
    a: "Currently, direct profile editing is not available. To change your name or other personal details, please contact support with your request, and an administrator will assist you."
  },
  {
    q: "What should I do if I can't find an answer here?",
    a: "If your question isn't covered in these FAQs, please head over to the 'Support' section to send a detailed message to our support team. We're happy to help!"
  }
];

// --- Main Component ---
const QuickHelp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openFaq, setOpenFaq] = useState(0); // Start with the first FAQ open

  // useMemo for efficient searching
  const filteredFaqs = useMemo(() => {
    if (!searchTerm) return faqs;
    const lowercasedTerm = searchTerm.toLowerCase();
    return faqs.filter(
      faq =>
        faq.q.toLowerCase().includes(lowercasedTerm) ||
        faq.a.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm]);

  return (
    <div className="max-w-4xl mx-auto text-slate-900 dark:text-slate-100">
      <div className="text-center mb-8">
        <FaQuestionCircle className="mx-auto text-5xl text-cyan-500 dark:text-cyan-300 mb-3" />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Find quick answers to common questions below.
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-8">
        <FaSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-cyan-500 dark:text-cyan-300" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search questions and answers..."
          className="w-full pr-4 py-3 rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10"
          style={{ paddingLeft: "3.5rem" }}
        />
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openFaq === index}
              onToggle={() => setOpenFaq(openFaq === index ? null : index)}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-white/5 border border-white/10 rounded-lg backdrop-blur-xl">
            <h3 className="font-semibold text-white">No results found</h3>
            <p className="text-sm text-slate-300 mt-1">Try a different search term.</p>
          </div>
        )}
      </div>
      
      {/* "Contact Us" Call-to-action */}
        <div className="mt-12 text-center p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white">Can't find the answer you're looking for?</h3>
            <p className="mt-1 text-sm text-slate-300">Our support team is here to help you.</p>
            <button className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition">
                Contact Support
            </button>
      </div>
    </div>
  );
};

// --- Sub-component for each FAQ item ---
const FAQItem = ({ faq, isOpen, onToggle }) => (
  <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border dark:border-slate-700 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center text-left p-5 cursor-pointer hover:bg-white/5"
    >
      <span className="font-semibold text-slate-800 dark:text-slate-100">{faq.q}</span>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
        <FaChevronDown className={`text-slate-500 transition-colors ${isOpen ? 'text-purple-600 dark:text-purple-400' : ''}`} />
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
          <div className="p-5 pt-0 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {faq.a}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default QuickHelp;

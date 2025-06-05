import React from "react";

const faqs = [
  { q: "How do I file a report?", a: "Go to the 'File Report' section and fill out the form." },
  { q: "How long does it take to resolve a report?", a: "It varies. Admins try to resolve within 48 hours." },
  { q: "Can I update my profile?", a: "Currently, profile updates are not supported." },
  { q: "How do I contact support?", a: "Use the 'Contact Support' section in your dashboard." }
];

const QuickHelp = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">Quick Help (FAQs)</h2>
      <ul className="space-y-4">
        {faqs.map((faq, index) => (
          <li key={index}>
            <p className="font-semibold text-purple-700">{faq.q}</p>
            <p className="text-sm text-gray-600">{faq.a}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickHelp;

import React, { useState } from "react";

const ContactSupport = () => {
  const [form, setForm] = useState({ subject: "", message: "" });
  const [feedback, setFeedback] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // You could add an API call here
    setFeedback("✅ Message sent successfully!");
    setForm({ subject: "", message: "" });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Contact Support</h2>
      {feedback && <p className="text-green-600 mb-4">{feedback}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Subject"
          required
          className="w-full border p-3 rounded-lg"
        />
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Message"
          required
          className="w-full border p-3 rounded-lg"
          rows={4}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactSupport;

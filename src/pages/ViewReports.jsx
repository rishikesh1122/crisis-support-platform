import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { FaClipboardList, FaSearch, FaTrash, FaUser, FaCalendarAlt, FaTag, FaExclamationCircle, FaFileDownload } from "react-icons/fa";

// Configuration for status styling (colors, icons) for better maintainability
const statusConfig = {
  Pending: {
    icon: <FaExclamationCircle />,
    classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  },
  "In Progress": {
    icon: <FaClipboardList />,
    classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  },
  Resolved: {
    icon: <FaClipboardList />,
    classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
};

const FILTER_OPTIONS = ["All", "Pending", "In Progress", "Resolved"];

const ViewReports = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [reportToDelete, setReportToDelete] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Sort reports by creation date, newest first
        setReports(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        setError("Failed to load reports. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // useMemo for efficient filtering and searching
  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        if (activeFilter === "All") return true;
        return report.status === activeFilter;
      })
      .filter((report) => {
        const search = searchTerm.toLowerCase();
        return (
          report.title.toLowerCase().includes(search) ||
          report.description.toLowerCase().includes(search)
        );
      });
  }, [reports, activeFilter, searchTerm]);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/reports/${id}/status`, { status }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (report) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/reports/${report.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (err) {
      alert("Failed to delete report.");
    } finally {
      setReportToDelete(null); // Close the modal
    }
  };

  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="max-w-7xl mx-auto text-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <FaClipboardList className="text-3xl text-cyan-300" />
          <h1 className="text-3xl font-bold text-white">
            View Reports
          </h1>
        </div>
        <div className="relative w-full md:w-64">
          <FaSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-cyan-300" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
            style={{ paddingLeft: "3rem" }}
          />
        </div>
      </div>
      
      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {FILTER_OPTIONS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200
              ${activeFilter === filter
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-md'
                : 'bg-white/5 border border-white/10 text-slate-200 hover:border-white/20'
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <ReportCard 
              key={report.id} 
              report={report} 
              user={user} 
              onUpdateStatus={updateStatus}
              onDelete={() => setReportToDelete(report)} 
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      
      {/* Confirmation Modal */}
      {reportToDelete && (
        <ConfirmationModal
          report={reportToDelete}
          onConfirm={() => handleDelete(reportToDelete)}
          onCancel={() => setReportToDelete(null)}
        />
      )}
    </div>
  );
};

// --- SUB-COMPONENTS for better organization ---

const ReportCard = ({ report, user, onUpdateStatus, onDelete }) => {
  const { title, description, status, createdAt, category, urgency, attachment, user: reportUser } = report;
  const config = statusConfig[status] || {};

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-xl p-5 flex flex-col">
      <div className="flex justify-between items-start gap-2">
        <h2 className="text-lg font-bold text-white break-words">{title}</h2>
        <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${config.classes}`}>{status}</span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
        <span className="flex items-center gap-1.5"><FaTag />{category || 'N/A'}</span>
        <span className="flex items-center gap-1.5"><FaExclamationCircle />{urgency || 'N/A'}</span>
      </div>

      <p className="mt-3 text-slate-200 text-sm flex-grow">{description}</p>
      
      {attachment && (
        <a href={attachment} target="_blank" rel="noopener noreferrer" className="mt-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-2">
          <FaFileDownload /> View Attachment
        </a>
      )}

      <div className="border-t border-white/10 mt-4 pt-3 text-xs text-slate-300 space-y-2">
        <div className="flex justify-between">
          <span className="flex items-center gap-1.5"><FaCalendarAlt /> Submitted:</span>
          <span>{new Date(createdAt).toLocaleString()}</span>
        </div>
        {user.role === 'admin' && reportUser && (
          <div className="flex justify-between">
            <span className="flex items-center gap-1.5"><FaUser /> Submitter:</span>
            <span>{reportUser.name}</span>
          </div>
        )}
      </div>
      
      {user.role === 'admin' && (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
          <select value={status} onChange={(e) => onUpdateStatus(report.id, e.target.value)} className="w-full text-sm bg-white/5 border border-white/10 rounded-md p-2 focus:ring-2 focus:ring-cyan-400 focus:outline-none">
            {Object.keys(statusConfig).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={onDelete} className="p-2 text-slate-200 hover:bg-red-500/20 hover:text-red-200 rounded-md transition-colors" aria-label="Delete report">
            <FaTrash />
          </button>
        </div>
      )}
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white/80 dark:bg-slate-800/50 shadow-md rounded-xl p-5 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/5"></div>
    </div>
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-4"></div>
    <div className="space-y-2 mt-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
    </div>
    <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-3">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl text-white">
    <FaClipboardList className="mx-auto text-5xl text-slate-300" />
    <h3 className="mt-4 text-xl font-semibold">No Reports Found</h3>
    <p className="mt-1 text-sm text-slate-300">Try adjusting your search or filter.</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="text-center py-20 bg-red-50 dark:bg-red-900/30 rounded-xl">
    <FaExclamationCircle className="mx-auto text-5xl text-red-400" />
    <h3 className="mt-4 text-xl font-semibold text-red-800 dark:text-red-200">An Error Occurred</h3>
    <p className="mt-1 text-sm text-red-600 dark:text-red-300">{message}</p>
  </div>
);

const ConfirmationModal = ({ report, onConfirm, onCancel }) => {
  const modal = (
    <div className="confirm-overlay fixed inset-0 z-50 flex items-center justify-center px-4" aria-modal="true" role="dialog">
      <div className="confirm-card bg-white/10 border border-white/10 backdrop-blur-2xl shadow-2xl rounded-xl p-6 max-w-sm w-full text-white">
        <h3 className="confirm-title text-lg font-bold">Delete report?</h3>
        <p className="confirm-text text-sm text-slate-200 mt-2">This action cannot be undone. The report will be permanently deleted.</p>
        {report?.title && (
          <p className="mt-3 text-sm text-slate-100 font-semibold line-clamp-2">“{report.title}”</p>
        )}
        <div className="confirm-actions flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="confirm-btn cancel px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-slate-100 hover:bg-white/20">Cancel</button>
          <button onClick={onConfirm} className="confirm-btn delete px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ViewReports;

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FaBars, FaUser, FaSignOutAlt, FaChartBar,
  FaClipboardList, FaPlusCircle, FaUsers,
  FaQuestionCircle, FaHeadset, FaBell,
  FaMoon, FaSun, FaCamera, FaEdit
} from "react-icons/fa";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import FileReport from "./fileReport";
import ViewReports from "./ViewReports";
import ContactSupport from "./ContactSupport";
import UserList from "./UserList";
import QuickHelp from "./QuickHelp";
import ReportTrends from "./ReportTrends";

const PIE_CHART_COLORS = ["#7dd3fc", "#34d399", "#fbbf24"];

function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("app-dark", dark);
    document.documentElement.classList.toggle("app-light", !dark);
    document.body.classList.toggle("dark", dark);
    document.body.classList.toggle("app-dark", dark);
    document.body.classList.toggle("app-light", !dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, setDark];
}

const DashboardPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [dark, setDark] = useDarkMode();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const sidebarRef = useRef(null);

  const refreshUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data);
    } catch (err) {
      console.error("Failed to refresh user data:", err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    refreshUserData().finally(() => setLoading(false));
  }, [refreshUserData]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const token = localStorage.getItem("token");
      await axios.put("/api/users/profile-picture", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      refreshUserData();
    } catch (err) {
      console.error("Avatar update failed:", err);
      alert("Failed to update avatar.");
    }
  };

  const navMenu = [
    { label: "Dashboard", icon: <FaUser />, key: "profile" },
    { label: "File Report", icon: <FaPlusCircle />, key: "report" },
    { label: "View Reports", icon: <FaClipboardList />, key: "reports" },
    { label: "Quick Help", icon: <FaQuestionCircle />, key: "faq" },
    { label: "Support", icon: <FaHeadset />, key: "contact" },
    { label: "All Users", icon: <FaUsers />, key: "users", adminOnly: true },
    { label: "Report Trends", icon: <FaChartBar />, key: "trends", adminOnly: true },
  ];

  const statusPie = user ? [
    { name: "Filed", value: user.reportCount || 0 },
    { name: "Resolved", value: user.resolvedCount || 0 },
    { name: "Pending", value: user.pendingCount || 0 },
  ] : [];

  const renderSection = () => {
    if (loading) return <LoadingScreen />;
    if (!user) return <ErrorScreen />;

    switch (activeSection) {
      case "profile": return <><ProfileHeader user={user} setShowEditModal={setShowEditModal} /><StatsOverview user={user} statusPie={statusPie} /><QuickActions user={user} setActiveSection={setActiveSection} /></>;
      case "report": return <FileReport onReportFiled={refreshUserData} />;
      case "reports": return <ViewReports user={user} onReportUpdate={refreshUserData} />;
      case "contact": return <ContactSupport />;
      case "users": return <UserList />;
      case "trends": return <ReportTrends />;
      case "faq": return <QuickHelp />;
      default: return <div className="text-center text-red-500">Unknown section</div>;
    }
  };

  const gradient = dark ? "from-[#0b1021] via-[#0d1328] to-[#101733]" : "from-[#eef2f7] via-[#f5f7fb] to-[#ffffff]";
  const textBase = dark ? "text-slate-100" : "text-slate-800";
  const sidebarText = dark ? "text-slate-200" : "text-slate-700";
  const sidebarMuted = dark ? "text-slate-300" : "text-slate-500";
  const mainClasses = `flex-1 min-h-screen relative overflow-y-auto px-3 sm:px-5 md:px-6 py-4 ${menuOpen ? 'lg:ml-72' : ''}`;

  return (
    <div className={`relative flex min-h-screen bg-gradient-to-br ${gradient} ${textBase}`}>
      {menuOpen && !isDesktop && <div className="fixed inset-0 bg-black/30 z-20" onClick={() => setMenuOpen(false)} />}
      
      <motion.aside
        ref={sidebarRef}
        initial={false}
        animate={{ x: menuOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 z-30 w-72 max-w-[92vw] h-screen card-panel shadow-2xl p-6 flex flex-col justify-between ${sidebarText}`}
      >
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">CrisisConnect</div>
          </div>
          <div className="flex items-start gap-3 mb-6 relative">
            <label className="relative cursor-pointer">
              <AvatarImg user={user} size={64} className="shadow" />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              <FaCamera className="absolute bottom-0 right-0 bg-cyan-600 text-white p-1 rounded-full text-xs" />
            </label>
            <div className="flex flex-col overflow-hidden">
              <h2 className="text-base font-semibold truncate">{user?.name}</h2>
              <span className={`text-xs ${sidebarMuted}`}>{user?.email}</span>
              <button onClick={() => setShowEditModal(true)} className="mt-1 text-xs text-cyan-500 hover:underline flex items-center gap-1"><FaEdit /> Edit Profile</button>
            </div>
          </div>
          <nav className="space-y-2">
            {navMenu.filter(item => !item.adminOnly || user?.role === "admin").map(item => (
              <SidebarBtn key={item.key} icon={item.icon} label={item.label} active={activeSection === item.key} dark={dark} onClick={() => { setActiveSection(item.key); if (!isDesktop) setMenuOpen(false); }} />
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex items-center justify-around">
            <button onClick={() => setDark(!dark)}>{dark ? <FaSun /> : <FaMoon />}</button>
            <button onClick={() => setShowNotif(!showNotif)}><FaBell /></button>
            <button onClick={() => setShowLogoutConfirm(true)}><FaSignOutAlt /></button>
          </div>
          {showNotif && <NotificationsPanel notifications={notifications} onClear={() => setNotifications([])} />}
        </div>
      </motion.aside>

      <main className={mainClasses}>
        <div className="mb-4 flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            className="text-purple-800 dark:text-purple-300 text-2xl"
          >
            <FaBars />
          </button>
        </div>
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-panel w-full p-4 sm:p-6 rounded-2xl shadow-2xl"
        >
          {renderSection()}
        </motion.div>
      </main>

      {showEditModal && <EditProfileModal user={user} onClose={() => setShowEditModal(false)} onSave={refreshUserData} />}
      {showLogoutConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-card">
            <h3 className="confirm-title">Log out?</h3>
            <p className="confirm-text">You will need to sign in again to access your dashboard.</p>
            <div className="confirm-actions">
              <button className="confirm-btn cancel" onClick={() => setShowLogoutConfirm(false)}>Stay logged in</button>
              <button
                className="confirm-btn delete"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- SUBCOMPONENTS --- */
const SidebarBtn = ({ icon, label, active, onClick, dark }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition duration-200 ${active
      ? "bg-gradient-to-r from-cyan-500/80 to-purple-500/80 text-white shadow-lg"
      : dark
        ? "text-slate-200 hover:bg-white/10"
        : "text-slate-700 hover:bg-slate-200/60"}`}
  >
    {icon}<span>{label}</span>
  </button>
);

const ProfileHeader = ({ user, setShowEditModal }) => (
  <div className="flex justify-between items-center">
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Dashboard</p>
      <h1 className="text-2xl font-bold">Welcome, {user.name.split(' ')[0]}!</h1>
    </div>
    <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 text-sm text-cyan-500 hover:underline"><FaEdit /> Edit Profile</button>
  </div>
);

const StatsOverview = ({ user, statusPie }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
    <div className="lg:col-span-1 card-panel p-6 rounded-xl text-center">
      <AvatarImg user={user} size={96} className="mx-auto mb-2" />
      <h2 className="font-bold text-white">{user.name}</h2>
      <p className="text-xs text-slate-300">{user.email}</p>
    </div>
    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Reports Filed" value={user.reportCount} />
      <StatCard label="Resolved" value={user.resolvedCount} />
      <StatCard label="Pending" value={user.pendingCount} />
      <div className="sm:col-span-3 card-panel p-4 rounded-xl">
        <ResponsiveContainer height={200}><PieChart><Pie data={statusPie} cx="50%" cy="50%" innerRadius={30} outerRadius={60} dataKey="value">{statusPie.map((e, i) => <Cell key={i} fill={PIE_CHART_COLORS[i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value }) => <div className="card-panel p-4 rounded-xl text-center shadow"><p className="text-2xl font-bold">{value}</p><p className="text-sm text-slate-400">{label}</p></div>;

const QuickActions = ({ user, setActiveSection }) => (
  <div className="mt-6">
    <h2 className="font-bold mb-3">Quick Actions</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <button onClick={() => setActiveSection("report")} className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white p-3 rounded-lg hover:scale-105 shadow-lg">File Report</button>
      <button onClick={() => setActiveSection("reports")} className="bg-white/5 border border-white/10 p-3 rounded-lg hover:scale-105">View Reports</button>
      {user.role === "admin" && <button onClick={() => setActiveSection("users")} className="bg-white/5 border border-white/10 p-3 rounded-lg hover:scale-105">All Users</button>}
    </div>
  </div>
);

const NotificationsPanel = ({ notifications, onClear }) => (
  <div className="absolute bottom-20 right-4 w-64 bg-white/10 border border-white/10 p-3 rounded-xl shadow-lg backdrop-blur-xl">
    <div className="font-bold text-white mb-2">Notifications</div>
    <ul>{notifications.length ? notifications.map((n, i) => <li key={i}>{n}</li>) : <li className="text-sm text-gray-500">No notifications</li>}</ul>
    {notifications.length > 0 && <button onClick={onClear} className="text-xs mt-2 underline">Clear All</button>}
  </div>
);

const AvatarImg = ({ user, size = 120, className = "" }) => {
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const fallback = `https://i.pravatar.cc/${size}?u=${user?.id}`;
  const normalized = user?.avatar && !user.avatar.startsWith("http")
    ? user.avatar.startsWith("/") ? user.avatar : `/${user.avatar}`
    : user?.avatar;
  const src = normalized
    ? normalized.startsWith("http")
      ? normalized
      : `${base}${normalized}`
    : fallback;
  return (
    <img
      src={src}
      alt="Avatar"
      style={{ width: size, height: size }}
      className={`rounded-full border-2 border-cyan-400/70 object-cover ${className}`}
    />
  );
};

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: user.name || "", email: user.email || "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/users/update-profile",
        { name: formData.name, email: formData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onSave) await onSave();
      onClose();
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white/10 border border-white/10 backdrop-blur-2xl p-6 rounded-xl shadow-2xl w-full max-w-md text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Edit Profile</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-200">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded-lg bg-black/30 border border-white/10 focus:border-cyan-400 outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-200">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 rounded-lg bg-black/30 border border-white/10 focus:border-cyan-400 outline-none"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/20 rounded-lg text-slate-100 hover:bg-white/10"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg shadow-lg disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoadingScreen = () => <div className="flex justify-center items-center min-h-[300px]">Loading...</div>;
const ErrorScreen = () => <div className="text-center text-red-500">Failed to load user data.</div>;

export default DashboardPage;

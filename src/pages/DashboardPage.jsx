import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FaBars, FaUser, FaSignOutAlt, FaChartBar,
  FaClipboardList, FaPlusCircle, FaUsers,
  FaQuestionCircle, FaHeadset, FaBell,
  FaMoon, FaSun, FaCheckDouble, FaHourglassHalf, FaCamera, FaEdit
} from "react-icons/fa";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import FileReport from "./FileReport";
import ViewReports from "./ViewReports";
import ContactSupport from "./ContactSupport";
import UserList from "./UserList";
import QuickHelp from "./QuickHelp";
import ReportTrends from "./ReportTrends";

const DASH_GRADIENT = "from-slate-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-slate-900";
const PIE_CHART_COLORS = ["#8b5cf6", "#10b981", "#f59e0b"];

function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
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
      await axios.post("/api/users/update-avatar", formData, {
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

  return (
    <div className={`flex min-h-screen bg-gradient-to-br ${DASH_GRADIENT}`}>
      {menuOpen && !isDesktop && <div className="fixed inset-0 bg-black/30 z-20" onClick={() => setMenuOpen(false)} />}
      
      <motion.aside
        ref={sidebarRef}
        initial={false}
        animate={{ x: menuOpen || isDesktop ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed lg:relative z-30 w-64 max-w-[90vw] h-screen bg-white/80 dark:bg-slate-950/80 shadow-xl p-6 border-r border-white/40 flex flex-col justify-between backdrop-blur-xl"
      >
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-500 text-transparent bg-clip-text">crisisConnect</div>
          </div>
          <div className="flex items-start gap-3 mb-6 relative">
            <label className="relative cursor-pointer">
              <img src={user?.avatar || `https://i.pravatar.cc/100?u=${user?.id}`} alt="User" className="w-14 h-14 rounded-full border-2 border-purple-400 shadow" />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              <FaCamera className="absolute bottom-0 right-0 bg-purple-600 text-white p-1 rounded-full text-xs" />
            </label>
            <div className="flex flex-col overflow-hidden">
              <h2 className="text-base font-semibold truncate text-slate-800 dark:text-slate-100">{user?.name}</h2>
              <span className="text-xs text-slate-600 dark:text-purple-100/80">{user?.email}</span>
              <button onClick={() => setShowEditModal(true)} className="mt-1 text-xs text-purple-600 hover:underline flex items-center gap-1"><FaEdit /> Edit Profile</button>
            </div>
          </div>
          <nav className="space-y-2">
            {navMenu.filter(item => !item.adminOnly || user?.role === "admin").map(item => (
              <SidebarBtn key={item.key} icon={item.icon} label={item.label} active={activeSection === item.key} onClick={() => { setActiveSection(item.key); if (!isDesktop) setMenuOpen(false); }} />
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex items-center justify-around">
            <button onClick={() => setDark(!dark)}>{dark ? <FaSun /> : <FaMoon />}</button>
            <button onClick={() => setShowNotif(!showNotif)}><FaBell /></button>
            <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}><FaSignOutAlt /></button>
          </div>
          {showNotif && <NotificationsPanel notifications={notifications} onClear={() => setNotifications([])} />}
        </div>
      </motion.aside>

      <main className="flex-1 p-4 sm:p-6 min-h-screen relative overflow-y-auto">
        <div className="lg:hidden mb-4 flex items-center">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-purple-800 dark:text-purple-300 text-2xl"><FaBars /></button>
        </div>
        <motion.div key={activeSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white/70 dark:bg-slate-950/80 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-2xl max-w-7xl mx-auto">
          {renderSection()}
        </motion.div>
      </main>

      {showEditModal && <EditProfileModal user={user} onClose={() => setShowEditModal(false)} onSave={refreshUserData} />}
    </div>
  );
};

/* --- SUBCOMPONENTS --- */
const SidebarBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg ${active ? "bg-purple-600 text-white" : "hover:bg-purple-100 text-purple-700"}`}>{icon}<span>{label}</span></button>
);

const ProfileHeader = ({ user, setShowEditModal }) => (
  <div className="flex justify-between items-center">
    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome, {user.name.split(' ')[0]}!</h1>
    <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 text-sm text-purple-600 hover:underline"><FaEdit /> Edit Profile</button>
  </div>
);

const StatsOverview = ({ user, statusPie }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
    <div className="lg:col-span-1 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl text-center">
      <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} alt="Avatar" className="w-24 h-24 rounded-full mx-auto mb-2" />
      <h2 className="font-bold">{user.name}</h2>
      <p className="text-xs text-slate-500">{user.email}</p>
    </div>
    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Reports Filed" value={user.reportCount} />
      <StatCard label="Resolved" value={user.resolvedCount} />
      <StatCard label="Pending" value={user.pendingCount} />
      <div className="sm:col-span-3 bg-white dark:bg-slate-800/50 p-4 rounded-xl">
        <ResponsiveContainer height={200}><PieChart><Pie data={statusPie} cx="50%" cy="50%" innerRadius={30} outerRadius={60} dataKey="value">{statusPie.map((e, i) => <Cell key={i} fill={PIE_CHART_COLORS[i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value }) => <div className="bg-white dark:bg-slate-800 p-4 rounded-xl text-center shadow"><p className="text-2xl font-bold">{value}</p><p className="text-sm">{label}</p></div>;

const QuickActions = ({ user, setActiveSection }) => (
  <div className="mt-6">
    <h2 className="font-bold mb-3">Quick Actions</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <button onClick={() => setActiveSection("report")} className="bg-purple-600 text-white p-3 rounded-lg hover:scale-105">File Report</button>
      <button onClick={() => setActiveSection("reports")} className="bg-white dark:bg-slate-700 p-3 rounded-lg hover:scale-105">View Reports</button>
      {user.role === "admin" && <button onClick={() => setActiveSection("users")} className="bg-white dark:bg-slate-700 p-3 rounded-lg hover:scale-105">All Users</button>}
    </div>
  </div>
);

const NotificationsPanel = ({ notifications, onClear }) => (
  <div className="absolute bottom-20 right-4 w-64 bg-white dark:bg-slate-900 p-3 rounded-xl shadow-lg">
    <div className="font-bold mb-2">Notifications</div>
    <ul>{notifications.length ? notifications.map((n, i) => <li key={i}>{n}</li>) : <li className="text-sm text-gray-500">No notifications</li>}</ul>
    {notifications.length > 0 && <button onClick={onClear} className="text-xs mt-2 underline">Clear All</button>}
  </div>
);

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/users/update-profile", formData, { headers: { Authorization: `Bearer ${token}` } });
      onSave();
      onClose();
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="font-bold text-lg mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded" />
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 border rounded" />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
            <button type="submit" className="px-3 py-1 bg-purple-600 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoadingScreen = () => <div className="flex justify-center items-center min-h-[300px]">Loading...</div>;
const ErrorScreen = () => <div className="text-center text-red-500">Failed to load user data.</div>;

export default DashboardPage;

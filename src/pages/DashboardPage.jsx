import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FaBars, FaUser, FaSignOutAlt, FaChartBar,
  FaClipboardList, FaPlusCircle, FaUsers,
  FaQuestionCircle, FaHeadset, FaBell,
  FaMoon, FaSun, FaCheckDouble, FaHourglassHalf
} from "react-icons/fa";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// Import your other section components
import FileReport from "./FileReport";
import ViewReports from "./ViewReports";
import ContactSupport from "./ContactSupport";
import UserList from "./UserList";
import QuickHelp from "./QuickHelp";
import ReportTrends from "./ReportTrends";

// --- Configuration ---
const sampleNotifications = [
  { id: 1, text: "New support message available.", type: "info" },
  { id: 2, text: "2 reports were resolved.", type: "success" },
];
const DASH_GRADIENT = "from-slate-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-slate-900";
const PIE_CHART_COLORS = ["#8b5cf6", "#10b981", "#f59e0b"]; // Purple (Filed), Emerald (Resolved), Amber (Pending)

// --- Custom Hook for Dark Mode ---
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, setDark];
}

// --- Main Dashboard Component ---
const DashboardPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [showNotif, setShowNotif] = useState(false);
  const [dark, setDark] = useDarkMode();
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );
  const sidebarRef = useRef(null);

  // Callback to refresh user data, passed to children
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
    const handleOutsideClick = (e) => {
      if (!isDesktop && menuOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen, isDesktop]);

  useEffect(() => {
    setLoading(true);
    refreshUserData().finally(() => setLoading(false));
  }, [refreshUserData]);

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
      case "profile":
        return (
          <div className="space-y-8">
            <ProfileHeader user={user} />
            <StatsOverview user={user} statusPie={statusPie} />
            <QuickActions user={user} setActiveSection={setActiveSection} />
          </div>
        );
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
    <div className={`flex min-h-screen bg-gradient-to-br ${DASH_GRADIENT} transition-colors duration-300`}>
      {menuOpen && !isDesktop && <div className="fixed inset-0 bg-black/30 z-20" onClick={() => setMenuOpen(false)} />}
      
      <motion.aside
        ref={sidebarRef}
        initial={false}
        animate={{ x: menuOpen || isDesktop ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="fixed lg:relative z-30 w-64 max-w-[90vw] h-screen bg-white/75 dark:bg-slate-950/80 shadow-xl p-6 border-r border-white/40 flex flex-col justify-between transition-all backdrop-blur-xl"
      >
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-500 text-transparent bg-clip-text">crisisConnect</div>
          </div>
          <div className="flex items-start gap-3 mb-6">
            <img src={user?.avatar || `https://i.pravatar.cc/100?u=${user?.id}`} alt="User" className="w-14 h-14 rounded-full border-2 border-purple-400 shadow" />
            <div className="flex flex-col overflow-hidden">
              <h2 className="text-base font-semibold truncate text-slate-800 dark:text-slate-100">{user?.name || "..."}</h2>
              <span className="text-xs text-slate-600 dark:text-purple-100/80 break-all">{user?.email || ""}</span>
            </div>
          </div>
          <nav className="space-y-2">
            {navMenu.filter(item => !item.adminOnly || user?.role === "admin").map(item => (
              <SidebarBtn key={item.key} icon={item.icon} label={item.label} active={activeSection === item.key}
                onClick={() => {
                  setActiveSection(item.key);
                  if (!isDesktop) setMenuOpen(false);
                }}
              />
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex items-center justify-around">
                <button aria-label="Toggle dark mode" className="p-2 text-slate-500 dark:text-yellow-400 hover:text-purple-600 dark:hover:text-yellow-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition" onClick={() => setDark(!dark)}>
                    {dark ? <FaSun /> : <FaMoon />}
                </button>
                <button aria-label="Notifications" onClick={() => setShowNotif(!showNotif)} className="relative p-2 text-slate-500 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                    <FaBell />
                    {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-xs text-white rounded-full flex items-center justify-center shadow-md font-bold">{notifications.length}</span>}
                </button>
                <button aria-label="Logout" onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }} className="p-2 text-slate-500 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition">
                    <FaSignOutAlt />
                </button>
            </div>
            {showNotif && <NotificationsPanel notifications={notifications} onClear={() => setNotifications([])} />}
        </div>
      </motion.aside>

      <main className="flex-1 p-4 sm:p-6 min-h-screen relative overflow-y-auto">
        <div className="lg:hidden mb-4 flex items-center">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-purple-800 dark:text-purple-300 text-2xl p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-800 transition">
            <FaBars />
          </button>
        </div>
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-white/70 dark:bg-slate-950/80 backdrop-blur-lg border border-white/40 dark:border-slate-900/40 p-4 sm:p-6 rounded-2xl shadow-2xl max-w-7xl mx-auto min-h-[400px]"
        >
          {renderSection()}
        </motion.div>
      </main>

      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }} onClick={() => setActiveSection("faq")} className="fixed right-7 bottom-7 z-40 p-4 bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-pink-400/50 transition" aria-label="Quick Help">
        <FaQuestionCircle className="text-2xl" />
      </motion.button>
    </div>
  );
};

// --- Sub-components for Cleaner Code ---

const ProfileHeader = ({ user }) => (
  <div>
    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Welcome back, {user.name.split(' ')[0]}!</h1>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here’s a summary of your account and activities.</p>
  </div>
);

const StatsOverview = ({ user, statusPie }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-1 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl shadow-md flex flex-col items-center text-center">
      <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 shadow-lg" />
      <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-slate-100">{user.name}</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
      <span className="mt-2 text-xs font-semibold px-3 py-1 bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 rounded-full">{user.role}</span>
    </div>
    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatCard icon={<FaClipboardList className="text-purple-500" />} label="Reports Filed" value={user.reportCount || 0} />
      <StatCard icon={<FaCheckDouble className="text-emerald-500" />} label="Reports Resolved" value={user.resolvedCount || 0} />
      <StatCard icon={<FaHourglassHalf className="text-amber-500" />} label="Pending Review" value={user.pendingCount || 0} />
      <div className="sm:col-span-3 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/3 h-40"><ResponsiveContainer><PieChart><Pie data={statusPie} cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={5} dataKey="value">{statusPie.map((entry, idx) => <Cell key={`cell-${idx}`} fill={PIE_CHART_COLORS[idx]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        <div className="w-full sm:w-2/3 text-center sm:text-left"><h3 className="font-bold text-slate-700 dark:text-slate-200">Report Status Breakdown</h3><p className="text-xs text-slate-500 dark:text-slate-400 mb-2">A visual summary of your report statuses.</p><div className="flex justify-center sm:justify-start gap-4 text-xs"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Filed</span><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Resolved</span><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Pending</span></div></div>
      </div>
    </div>
  </div>
);

const QuickActions = ({ user, setActiveSection }) => (
  <div>
    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">Quick Actions</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <DashButton label="File Report" icon={<FaPlusCircle />} onClick={() => setActiveSection("report")} primary />
      <DashButton label="View Reports" icon={<FaClipboardList />} onClick={() => setActiveSection("reports")} />
      <DashButton label="Quick Help" icon={<FaQuestionCircle />} onClick={() => setActiveSection("faq")} />
      <DashButton label="Support" icon={<FaHeadset />} onClick={() => setActiveSection("contact")} />
      {user.role === 'admin' && <DashButton label="All Users" icon={<FaUsers />} onClick={() => setActiveSection("users")} />}
    </div>
  </div>
);

// --- Reusable UI Components ---

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px]"><svg className="animate-spin h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg><p className="mt-4 text-lg font-medium text-slate-600 dark:text-slate-300">Loading Dashboard...</p></div>
);

const ErrorScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px]"><h3 className="text-xl font-semibold text-red-500">Authentication Error</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Could not load user data. Please try logging in again.</p></div>
);

const SidebarBtn = ({ icon, label, active, ...props }) => (
  <button {...props} className={`group flex items-center gap-3 px-4 py-2 rounded-lg w-full transition font-medium ${active ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" : "text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/60"}`}><span className="text-lg">{icon}</span><span>{label}</span></button>
);

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white dark:bg-slate-800/50 p-5 rounded-xl shadow-md flex items-center gap-4 transition-transform hover:scale-105"><div className="text-3xl bg-slate-100 dark:bg-slate-700 p-3 rounded-full">{icon}</div><div><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p><p className="text-xs text-slate-500 dark:text-slate-400">{label}</p></div></div>
);

const DashButton = ({ label, icon, onClick, primary = false }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 ${primary ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border dark:border-slate-700"}`}><span className="text-2xl">{icon}</span><span className="text-sm font-semibold text-center">{label}</span></button>
);

const NotificationsPanel = ({ notifications, onClear }) => (
    <div className="absolute bottom-20 -right-2 w-64 bg-white/95 dark:bg-slate-900 shadow-lg rounded-xl ring-1 ring-purple-200 dark:ring-purple-900/50 p-3 z-50">
      <div className="font-bold text-purple-700 dark:text-purple-200">Notifications</div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800 mt-2 max-h-48 overflow-y-auto">
        {notifications.length === 0 ? <li className="text-slate-400 py-3 text-center text-sm">No new notifications</li> : notifications.map(n =>
            <li key={n.id} className={`flex items-start gap-2 py-2 text-sm ${n.type === "success" ? "text-emerald-700 dark:text-emerald-300" : "text-purple-700 dark:text-purple-300"}`}>
              <span className="mt-1">●</span> {n.text}
            </li>
        )}
      </ul>
      <button onClick={onClear} className="mt-2 w-full text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded py-1 hover:bg-purple-200 dark:hover:bg-purple-800">Clear all</button>
    </div>
);

export default DashboardPage;

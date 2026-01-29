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
  const [reportsLoading, setReportsLoading] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const lastSeenReportAtRef = useRef(null);
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

  const fetchRecentReports = useCallback(async (notifyNew = false) => {
    try {
      setReportsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/reports", { headers: { Authorization: `Bearer ${token}` } });
      const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentReports(sorted.slice(0, 5));

      if (user?.role === "admin") {
        const latest = sorted[0]?.createdAt ? new Date(sorted[0].createdAt).getTime() : null;
        const lastSeen = lastSeenReportAtRef.current;

        if (latest && lastSeen && notifyNew) {
          const newOnes = sorted.filter(r => new Date(r.createdAt).getTime() > lastSeen);
          if (newOnes.length) {
            setNotifications(prev => [
              ...newOnes.map(r => `New report: ${r.title}${r.user?.name ? ` by ${r.user.name}` : ""}`),
              ...prev,
            ].slice(0, 10));
            setShowNotif(true);
          }
        }

        if (latest) {
          lastSeenReportAtRef.current = latest;
        }
      }
    } catch (err) {
      console.error("Failed to fetch recent reports:", err);
    } finally {
      setReportsLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchRecentReports();
    }
  }, [fetchRecentReports]);

  // Set baseline once user role is known (important for admin notifications)
  useEffect(() => {
    if (!user || user.role !== "admin") return;
    fetchRecentReports();
  }, [user, fetchRecentReports]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    const id = setInterval(() => {
      fetchRecentReports(true);
    }, 7000); // poll for new reports every 7s
    return () => clearInterval(id);
  }, [user, fetchRecentReports]);

  const handleDataRefresh = useCallback(async () => {
    await Promise.all([refreshUserData(), fetchRecentReports()]);
  }, [refreshUserData, fetchRecentReports]);

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
      case "profile":
        return (
          <>
            <ProfileHeader user={user} setShowEditModal={setShowEditModal} />
            <StatsOverview user={user} statusPie={statusPie} />
            <ActivityHighlights user={user} reports={recentReports} />
            <QuickActions user={user} setActiveSection={setActiveSection} />
            <RecentReportsSection
              reports={recentReports}
              loading={reportsLoading}
              isAdmin={user.role === "admin"}
              onViewAll={() => setActiveSection("reports")}
            />
          </>
        );
      case "report": return <FileReport onReportFiled={handleDataRefresh} />;
      case "reports": return <ViewReports user={user} onReportUpdate={handleDataRefresh} />;
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
              <div className="flex items-center gap-2">
                <span className={`text-xs ${sidebarMuted}`}>{user?.email}</span>
                {user?.role && <RoleBadge role={user.role} compact />}
              </div>
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
            <button onClick={() => setShowLogoutConfirm(true)}><FaSignOutAlt /></button>
          </div>
        </div>
      </motion.aside>

      <main className={mainClasses}>
        <div className="mb-4 flex items-center justify-between gap-4 relative z-30">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            className="text-purple-800 dark:text-purple-300 text-2xl"
          >
            <FaBars />
          </button>
          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm flex items-center gap-2 hover:bg-white/10"
            >
              <FaBell />
              <span>Notifications</span>
              {notifications.length > 0 && <span className="text-xs bg-rose-500 text-white rounded-full px-2 py-0.5">{notifications.length}</span>}
            </button>
            {showNotif && <NotificationsPanel notifications={notifications} onClear={() => setNotifications([])} />}
          </div>
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
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
    <div className="card-panel p-5 rounded-xl flex items-center gap-4">
      <AvatarImg user={user} size={88} className="flex-shrink-0" />
      <div>
        <h2 className="font-bold text-white text-lg">{user.name}</h2>
        <div className="flex items-center gap-2 flex-wrap text-sm text-slate-300">
          <span>{user.email}</span>
          <RoleBadge role={user.role} />
        </div>
        <p className="text-xs text-slate-400 mt-1">Member since {user.joined}</p>
      </div>
    </div>
    <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Reports Filed" value={user.reportCount} />
      <StatCard label="Resolved" value={user.resolvedCount} />
      <StatCard label="Pending" value={user.pendingCount} />
      <div className="sm:col-span-3 card-panel p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Status Mix</h3>
          <span className="text-xs text-slate-400">Last updated now</span>
        </div>
        <ResponsiveContainer height={180}>
          <PieChart>
            <Pie data={statusPie} cx="50%" cy="50%" innerRadius={32} outerRadius={62} dataKey="value" paddingAngle={3}>
              {statusPie.map((e, i) => <Cell key={i} fill={PIE_CHART_COLORS[i]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value }) => <div className="card-panel p-4 rounded-xl text-center shadow"><p className="text-2xl font-bold">{value}</p><p className="text-sm text-slate-400">{label}</p></div>;

const QuickActions = ({ user, setActiveSection }) => (
  <div className="mt-6">
    <h2 className="font-bold mb-3">Quick Actions</h2>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <button onClick={() => setActiveSection("report")} className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white p-3 rounded-lg hover:scale-105 shadow-lg">File Report</button>
      <button onClick={() => setActiveSection("reports")} className="bg-white/5 border border-white/10 p-3 rounded-lg hover:scale-105">View Reports</button>
      <button onClick={() => setActiveSection("faq")} className="bg-white/5 border border-white/10 p-3 rounded-lg hover:scale-105">Quick Help</button>
      {user.role === "admin" && <button onClick={() => setActiveSection("users")} className="bg-white/5 border border-white/10 p-3 rounded-lg hover:scale-105">All Users</button>}
    </div>
  </div>
);

const ActivityHighlights = ({ user, reports }) => {
  const statusCounts = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const items = [
    { label: "Open this week", value: reports.filter(r => daysAgo(r.createdAt) <= 7).length },
    { label: "Pending", value: statusCounts["Pending"] || 0 },
    { label: "In Progress", value: statusCounts["In Progress"] || 0 },
    { label: "Resolved", value: statusCounts["Resolved"] || 0 },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="card-panel p-3 rounded-xl text-center">
          <p className="text-2xl font-bold text-white">{item.value}</p>
          <p className="text-xs text-slate-400">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

const RecentReportsSection = ({ reports, loading, isAdmin, onViewAll }) => (
  <div className="mt-6 card-panel p-5 rounded-2xl">
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Recent reports</p>
        <h3 className="text-lg font-semibold">Latest activity</h3>
      </div>
      <button onClick={onViewAll} className="text-sm text-cyan-400 hover:underline">View all</button>
    </div>
    {loading ? (
      <div className="text-slate-300 text-sm">Loading...</div>
    ) : reports.length === 0 ? (
      <div className="text-slate-300 text-sm">No reports yet. File your first report to get started.</div>
    ) : (
      <div className="space-y-2">
        {reports.map((report) => (
          <div key={report.id} className="flex items-start justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <div className="flex flex-col">
              <p className="font-semibold text-white text-sm">{report.title}</p>
              <p className="text-xs text-slate-400 line-clamp-1">{report.description}</p>
              <p className="text-xs text-slate-500 mt-1">{new Date(report.createdAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white">{report.status}</span>
              {isAdmin && report.user && (
                <p className="text-[11px] text-slate-400 mt-1">{report.user.name}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const NotificationsPanel = ({ notifications, onClear }) => (
  <div className="absolute top-full right-0 mt-2 w-64 bg-white/10 border border-white/10 p-3 rounded-xl shadow-lg backdrop-blur-xl z-50">
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

const daysAgo = (date) => {
  const then = new Date(date).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
};

const RoleBadge = ({ role, compact = false }) => {
  if (!role) return null;
  const isAdmin = role === "admin";
  const colors = isAdmin
    ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white"
    : "bg-white/10 text-slate-200 border border-white/10";
  const padding = compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";
  return (
    <span className={`rounded-full font-semibold uppercase tracking-wide ${colors} ${padding}`}>
      {isAdmin ? "Admin" : "User"}
    </span>
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

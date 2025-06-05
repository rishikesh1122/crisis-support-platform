import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaBars, FaUser, FaSignOutAlt, FaInfoCircle,
  FaClipboardList, FaEnvelope, FaPlusCircle,
  FaUsers, FaChartBar, FaQuestionCircle, FaHeadset
} from "react-icons/fa";
import axios from "axios";
import FileReport from "./FileReport";
import ViewReports from "./ViewReports";
import ContactSupport from "./ContactSupport";
import UserList from "./UserList";
import QuickHelp from "./QuickHelp";
import ReportTrends from "./ReportTrends";

const DashboardPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [user, setUser] = useState(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching /me:", err.response?.data || err.message);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  const renderSection = () => {
    if (!user) return <p className="text-center text-gray-600">Loading user data...</p>;

    switch (activeSection) {
      case "profile":
        return (
          <div className="flex flex-col items-center gap-6">
            <img
              src={user.avatar || "https://i.pravatar.cc/100?img=3"}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-purple-500 shadow-md"
            />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-800">{user.name}</h2>
              <p className="text-gray-500">Welcome back!</p>
              <span className="inline-block mt-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full shadow">
                {user.role || "User"}
              </span>
            </div>

            <div className="w-full max-w-md bg-white p-4 rounded-xl shadow-md border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-700 mb-4 border-b pb-2">Your Activity</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-purple-800">{user.reportCount || 0}</p>
                  <p className="text-sm text-gray-600">Reports Filed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{user.resolvedCount || 0}</p>
                  <p className="text-sm text-gray-600">Resolved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">{user.pendingCount || 0}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="text-md text-purple-700">{user.lastLogin || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 w-full max-w-3xl">
              <button onClick={() => setActiveSection("report")} className="bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition shadow">
                File Report
              </button>
              <button onClick={() => setActiveSection("reports")} className="bg-gray-200 text-purple-700 py-2 rounded-lg hover:bg-gray-300 transition shadow">
                View Reports
              </button>
              <button onClick={() => setActiveSection("contact")} className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition shadow flex items-center gap-2 justify-center">
                <FaHeadset /> Contact Support
              </button>
              <button onClick={() => setActiveSection("faq")} className="bg-yellow-400 text-white py-2 rounded-lg hover:bg-yellow-500 transition shadow flex items-center gap-2 justify-center">
                <FaQuestionCircle /> Quick Help
              </button>
              {user.role === "admin" && (
                <>
                  <button onClick={() => setActiveSection("users")} className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition shadow flex items-center gap-2 justify-center">
                    <FaUsers /> View All Users
                  </button>
                  <button onClick={() => setActiveSection("trends")} className="bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition shadow flex items-center gap-2 justify-center">
                    <FaChartBar /> Report Trends
                  </button>
                </>
              )}
            </div>
          </div>
        );
      case "account":
        return (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 border-b pb-2">Account Information</h2>
            <p><strong className="text-purple-600">Name:</strong> {user.name}</p>
            <p><strong className="text-purple-600">Email:</strong> {user.email}</p>
            <p><strong className="text-purple-600">Joined:</strong> {user.joined}</p>
          </div>
        );
      case "report":
        return <FileReport />;
      case "reports":
        return <ViewReports user={user} />;
      case "contact":
        return <ContactSupport />;
      case "users":
        return <UserList />;
      case "trends":
        return <ReportTrends />;
      case "faq":
        return <QuickHelp />;
      case "inbox":
        return <div className="text-center text-gray-500">Inbox feature coming soon.</div>;
      default:
        return <div className="text-center text-red-500">Unknown section</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100">
      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-10 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <motion.div
        ref={sidebarRef}
        initial={false}
        animate={{ x: menuOpen || window.innerWidth >= 1024 ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed lg:relative z-20 w-64 max-w-[85vw] h-screen bg-white/70 backdrop-blur-md shadow-xl p-6 border-r border-white/30 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-start gap-3 mb-6">
            <img
              src={user?.avatar || "https://i.pravatar.cc/100?img=3"}
              alt="User"
              className="w-14 h-14 rounded-full border-2 border-purple-400 shadow-md flex-shrink-0"
            />
            <div className="flex flex-col overflow-hidden">
              <h2 className="text-base font-semibold text-purple-800 truncate w-full">
                {user?.name || "User"}
              </h2>
              <p className="text-sm text-gray-600 break-words max-w-[10rem]">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <nav className="space-y-4">
            {[
              { label: "Profile", icon: <FaUser />, key: "profile" },
              { label: "Account Info", icon: <FaInfoCircle />, key: "account" },
              { label: "Crisis Reports", icon: <FaClipboardList />, key: "reports" },
              { label: "Support Inbox", icon: <FaEnvelope />, key: "inbox" },
              { label: "File Report", icon: <FaPlusCircle />, key: "report" },
              { label: "Quick Help", icon: <FaQuestionCircle />, key: "faq" },
              { label: "View All Users", icon: <FaUsers />, key: "users", adminOnly: true },
              { label: "Report Trends", icon: <FaChartBar />, key: "trends", adminOnly: true },
            ]
              .filter(item => !item.adminOnly || user?.role === "admin")
              .map(item => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveSection(item.key);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-purple-700 hover:bg-purple-100 hover:shadow transition-all duration-200 w-full text-left"
                >
                  {item.icon} {item.label}
                </button>
              ))}
          </nav>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-100 hover:shadow transition-all duration-200 mt-4"
        >
          <FaSignOutAlt /> Logout
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 p-6 min-h-screen">
        <div className="lg:hidden mb-4">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-purple-800 text-2xl focus:outline-none">
            <FaBars />
          </button>
        </div>

        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/70 backdrop-blur-lg border border-white/30 p-6 rounded-2xl shadow-xl"
        >
          {renderSection()}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FaUsers, FaSearch, FaSort, FaSortUp, FaSortDown, FaTrash } from "react-icons/fa";

// --- Configuration ---
const USERS_PER_PAGE = 10;
const roleConfig = {
  admin: { classes: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" },
  user: { classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
};

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const getAvatarUrl = (avatar, id) => {
  if (avatar) {
    if (avatar.startsWith("http")) return avatar;
    const normalized = avatar.startsWith("/") ? avatar : `/${avatar}`;
    return `${apiBase}${normalized}`;
  }
  return `https://i.pravatar.cc/80?u=${id}`;
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Interactive State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/users", { headers: { Authorization: `Bearer ${token}` } });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllUsers();
  }, []);

  const openConfirm = (user) => {
    if (user.role === "admin") {
      setError("Admin accounts cannot be deleted.");
      return;
    }
    setConfirmUser(user);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmUser) return;
    try {
      setDeletingId(confirmUser.id);
      setError(null);
      const token = localStorage.getItem("token");
      await axios.delete(`/api/users/${confirmUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== confirmUser.id));
      setShowConfirm(false);
      setConfirmUser(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setConfirmUser(null);
  };

  const processedUsers = useMemo(() => {
    let filtered = users
      .filter(user => filterRole === 'all' || user.role === filterRole)
      .filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [users, searchTerm, filterRole, sortConfig]);

  const totalPages = Math.ceil(processedUsers.length / USERS_PER_PAGE);
  const paginatedUsers = processedUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-slate-400" />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className="text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FaUsers className="text-3xl text-cyan-300" />
          <h2 className="text-3xl font-bold text-white">User Management</h2>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow min-w-[260px]">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full min-w-[240px] md:min-w-[320px] pl-4 pr-14 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
            />
            <FaSearch className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-400" />
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none transition">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-lg shadow-md backdrop-blur-xl">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-200 uppercase bg-white/5">
            <tr>
              <th scope="col" className="px-6 py-3 min-w-[250px] cursor-pointer" onClick={() => requestSort('name')}>
                <div className="flex items-center gap-2">User {getSortIcon('name')}</div>
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('role')}>
                <div className="flex items-center gap-2">Role {getSortIcon('role')}</div>
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('createdAt')}>
                <div className="flex items-center gap-2">Joined {getSortIcon('createdAt')}</div>
              </th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : error ? (
              <tr><td colSpan="4" className="text-center py-10 text-red-400">{error}</td></tr>
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map(user => (
                <UserRow
                  key={user.id}
                  user={user}
                  onDelete={openConfirm}
                  deletingId={deletingId}
                />
              ))
            ) : (
              <tr><td colSpan="4" className="text-center py-10 text-slate-300">No users match your criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-card">
            <h3 className="confirm-title">Delete user?</h3>
            <p className="confirm-text">
              {confirmUser ? `Are you sure you want to delete ${confirmUser.name}? This action cannot be undone.` : "Are you sure?"}
            </p>
            <div className="confirm-actions">
              <button onClick={handleCancelDelete} className="confirm-btn cancel">Cancel</button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId === confirmUser?.id}
                className="confirm-btn delete"
              >
                {deletingId === confirmUser?.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components for better organization ---

const UserRow = ({ user, onDelete, deletingId }) => (
  <tr className="bg-white/0 border-b border-white/10 hover:bg-white/5 transition text-white">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <img
          className="w-10 h-10 rounded-full border border-white/10 object-cover bg-white/20"
          src={getAvatarUrl(user.avatar, user.id)}
          alt={`${user.name}'s avatar`}
        />
        <div>
          <div className="font-semibold text-white">{user.name}</div>
          <div className="text-slate-300">{user.email}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={`text-xs font-medium px-3 py-1 rounded-full ${roleConfig[user.role]?.classes || 'bg-white/10 text-white'}`}>
        {user.role}
      </span>
    </td>
    <td className="px-6 py-4">
      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
    </td>
    <td className="px-6 py-4 text-right">
      <button
        onClick={() => onDelete(user)}
        disabled={user.role === "admin" || deletingId === user.id}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-red-500 text-red-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
        title={user.role === "admin" ? "Admin accounts cannot be deleted" : "Delete user"}
      >
        <FaTrash />
        {deletingId === user.id ? "Deleting..." : "Delete"}
      </button>
    </td>
  </tr>
);

const SkeletonRow = () => (
  <tr className="bg-white/0 border-b border-white/10 animate-pulse">
    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white/10"></div><div><div className="h-4 w-24 bg-white/10 rounded"></div><div className="h-3 w-32 bg-white/10 rounded mt-2"></div></div></div></td>
    <td className="px-6 py-4"><div className="h-5 w-16 bg-white/10 rounded-full"></div></td>
    <td className="px-6 py-4"><div className="h-4 w-20 bg-white/10 rounded"></div></td>
    <td className="px-6 py-4 text-right"><div className="h-9 w-20 bg-white/10 rounded"></div></td>
  </tr>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-between items-center mt-4 text-sm">
    <button onClick={() => onPageChange(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
      Previous
    </button>
    <span className="text-slate-600 dark:text-slate-300">Page {currentPage} of {totalPages}</span>
    <button onClick={() => onPageChange(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
      Next
    </button>
  </div>
);

export default UserList;

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FaUsers, FaSearch, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

// --- Configuration ---
const USERS_PER_PAGE = 10;
const roleConfig = {
  admin: { classes: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" },
  user: { classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FaUsers className="text-3xl text-purple-600 dark:text-purple-400" />
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">User Management</h2>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none transition" />
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none transition">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-slate-800/50 rounded-lg shadow-md border dark:border-slate-700">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : error ? (
              <tr><td colSpan="3" className="text-center py-10 text-red-500">{error}</td></tr>
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map(user => <UserRow key={user.id} user={user} />)
            ) : (
              <tr><td colSpan="3" className="text-center py-10 text-slate-500">No users match your criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  );
};

// --- Sub-components for better organization ---

const UserRow = ({ user }) => (
  <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50 transition">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <img className="w-10 h-10 rounded-full" src={user.avatar || `https://i.pravatar.cc/40?u=${user.id}`} alt={`${user.name}'s avatar`} />
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
          <div className="text-slate-500 dark:text-slate-400">{user.email}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={`text-xs font-medium px-3 py-1 rounded-full ${roleConfig[user.role]?.classes || 'bg-gray-100 text-gray-700'}`}>
        {user.role}
      </span>
    </td>
    <td className="px-6 py-4">
      {new Date(user.createdAt).toLocaleDateString()}
    </td>
  </tr>
);

const SkeletonRow = () => (
  <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 animate-pulse">
    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div><div><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div><div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded mt-2"></div></div></div></td>
    <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div></td>
    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
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

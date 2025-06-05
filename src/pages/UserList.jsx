import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const roleColors = {
  admin: "bg-red-100 text-red-700",
  user: "bg-blue-100 text-blue-700",
};

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err.response?.data || err.message);
      }
    };

    fetchAllUsers();
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-xl border border-purple-100">
      <h2 className="text-3xl font-extrabold text-purple-800 mb-6 border-b pb-2">
        👥 All Users
      </h2>

      {users.length === 0 ? (
        <p className="text-center text-gray-600">No users found.</p>
      ) : (
        <ul className="space-y-4">
          {users.map((user, index) => (
            <motion.li
              key={user.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg bg-white shadow-sm border hover:shadow-md transition"
            >
              <div className="flex flex-col">
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500 break-all">{user.email}</p>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  roleColors[user.role] || "bg-gray-100 text-gray-700"
                }`}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;

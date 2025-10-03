const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const reportRoutes = require("./routes/report");
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded files (e.g., profile avatars)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes); 
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ✅ Centralized error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const reportRoutes = require("./routes/report");

// Import routes AFTER app is initialized
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const userRoutes = require('./routes/users'); // ✅ NEW protected route

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes); // ✅ /api/dashboard is now protected
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

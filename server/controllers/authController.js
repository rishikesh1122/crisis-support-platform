const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

// Register Controller
const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user', // default role
        avatar: '',   // default empty avatar
      },
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Me Controller
const getMe = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    let reportCount = 0;
    let resolvedCount = 0;
    let pendingCount = 0;

    if (user.role === 'admin') {
      [reportCount, resolvedCount, pendingCount] = await Promise.all([
        prisma.report.count(),
        prisma.report.count({ where: { status: "Resolved" } }),
        prisma.report.count({ where: { status: "Pending" } }),
      ]);
    } else {
      [reportCount, resolvedCount, pendingCount] = await Promise.all([
        prisma.report.count({ where: { userId } }),
        prisma.report.count({ where: { userId, status: "Resolved" } }),
        prisma.report.count({ where: { userId, status: "Pending" } }),
      ]);
    }

    res.json({
      ...user,
      joined: new Date(user.createdAt).toLocaleDateString(),
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never",
      reportCount,
      resolvedCount,
      pendingCount,
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ New: Update Profile (Name / Avatar)
const updateProfile = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.file) updateData.avatar = `/uploads/avatars/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Optional utility
const fetchUserData = async (token) => {
  try {
    const res = await axios.get("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

module.exports = { register, login, getMe, updateProfile, fetchUserData };

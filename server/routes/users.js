const express = require("express");
const multer = require("multer");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Configure multer for storing profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/avatars"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});
const upload = multer({ storage });

// ✅ Fetch all users (Admin only)
router.get("/", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied" });

  try {
    const users = await prisma.user.findMany({
      // include createdAt (and avatar) so frontend can display "created at"
      select: { id: true, name: true, email: true, role: true, createdAt: true, avatar: true },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ Update Profile Picture (Any logged-in user)
router.put(
  "/profile-picture",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });

      // Store relative file path (for static serving)
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: avatarUrl },
      });

      res.json({
        message: "Profile picture updated successfully",
        avatar: avatarUrl,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ error: "Failed to update profile picture" });
    }
  }
);

// ✅ Update Profile (name/email) for logged-in user
router.post(
  "/update-profile",
  authenticateToken,
  async (req, res) => {
    try {
      const { name, email } = req.body;
      const updatedUser = await prisma.user.update({
        where: { id: Number(req.user.id) },
        data: { name, email },
      });
      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

module.exports = router;

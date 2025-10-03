const express = require("express");
const multer = require("multer");
const path = require("path");
const { register, login, getMe } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Setup Multer storage for avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/avatars"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only .jpg, .png, .webp files are allowed!"));
    }
    cb(null, true);
  },
});

// Routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);

// ✅ Route for profile picture upload
router.post("/upload-avatar", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    // Update user avatar in DB
    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: `/uploads/avatars/${req.file.filename}` },
    });

    res.json({ message: "Avatar updated", avatar: `/uploads/avatars/${req.file.filename}` });
  } catch (err) {
    console.error("Avatar Upload Error:", err);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});

module.exports = router;

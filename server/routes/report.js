const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");

// POST /api/reports - Create new report
router.post("/", authenticateToken, async (req, res) => {
  const { title, description } = req.body;

  try {
    const report = await prisma.report.create({
      data: {
        title,
        description,
        userId: req.user.id, // From JWT middleware
        status: "Pending", // default
      },
    });

    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create report." });
  }
});
// GET /api/reports - View all reports (admin) or own reports (user)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: req.user.role === "admin" ? {} : { userId: req.user.id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports." });
  }
});
 router.put("/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await prisma.report.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.report.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// GET /api/reports/stats - Admin-only analytics
router.get("/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rangeDays = Math.min(Math.max(parseInt(req.query.rangeDays || "30", 10) || 30, 1), 365);
    const totalReports = await prisma.report.count();

    const statusGroups = await prisma.report.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const statusMap = statusGroups.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    const pendingCount = statusMap["Pending"] || 0;
    const resolvedCount = statusMap["Resolved"] || 0;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (rangeDays - 1));

    const recentWindow = await prisma.report.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    });

    const dateBuckets = new Map();
    for (let i = 0; i < rangeDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = d.toISOString().split("T")[0];
      dateBuckets.set(key, 0);
    }
    recentWindow.forEach(({ createdAt }) => {
      const key = createdAt.toISOString().split("T")[0];
      if (dateBuckets.has(key)) dateBuckets.set(key, dateBuckets.get(key) + 1);
    });

    const reportsOverTime = Array.from(dateBuckets.entries()).map(([date, count]) => ({ date, count }));

    const recentReports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    });

    const statusCounts = ["Pending", "In Progress", "Resolved", "Other"].map((status) => ({
      name: status,
      count: status === "Other"
        ? Object.keys(statusMap).reduce((sum, key) => ["Pending", "In Progress", "Resolved"].includes(key) ? sum : sum + statusMap[key], 0)
        : statusMap[status] || 0,
    }));

    res.json({
      totalReports,
      pendingCount,
      resolvedCount,
      statusCounts,
      reportsOverTime,
      rangeDays,
      recentReports: recentReports.map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        user: r.user?.name || "Unknown",
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error building report stats:", err);
    res.status(500).json({ error: "Failed to load report stats" });
  }
});

module.exports = router;

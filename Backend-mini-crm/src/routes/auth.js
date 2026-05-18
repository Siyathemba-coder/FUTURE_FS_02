const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const db      = require("../db");
const auth    = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);
    const admin  = rows[0];

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/auth/me  — verify token & return current admin
router.get("/me", auth, (req, res) => {
  res.json({ admin: req.admin });
});

// POST /api/auth/change-password
router.post("/change-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM admins WHERE id = ?", [req.admin.id]);
    const admin  = rows[0];

    if (!(await bcrypt.compare(currentPassword, admin.password))) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE admins SET password = ? WHERE id = ?", [hash, admin.id]);
    res.json({ message: "Password updated." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;

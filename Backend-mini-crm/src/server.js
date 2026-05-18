require("dotenv").config();
const express     = require("express");
const cors        = require("cors");
const rateLimit   = require("express-rate-limit");

const authRoutes  = require("./routes/auth");
const leadsRoutes = require("./routes/leads");
const notesRoutes = require("./routes/notes");

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// ─── Body parsing ────────────────────────────────────────────────
app.use(express.json());

// ─── Rate limiting ───────────────────────────────────────────────
// Tighter limit on auth endpoints to slow brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many requests — please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  message: { error: "Too many requests — please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// ─── Routes ──────────────────────────────────────────────────────
app.use("/api/auth",  authRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/notes", notesRoutes);

// ─── Health check ────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ─── 404 catch-all ───────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Route not found." }));

// ─── Global error handler ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error." });
});

// ─── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`MiniCRM API running on http://localhost:${PORT}`);
});

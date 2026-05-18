const router = require("express").Router();
const db     = require("../db");
const auth   = require("../middleware/auth");

const VALID_SOURCES  = ["Contact Form","LinkedIn","Referral","Cold Email","Other"];
const VALID_STATUSES = ["new","contacted","converted"];

// ─── GET /api/leads ──────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM leads ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not fetch leads." });
  }
});

// ─── GET /api/leads/:id ──────────────────────────────────────────
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM leads WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Lead not found." });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not fetch lead." });
  }
});

// ─── POST /api/leads ─────────────────────────────────────────────
router.post("/", auth, async (req, res) => {
  const { name, email, phone, source, status } = req.body;

  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: "Name and email are required." });
  }
  if (source && !VALID_SOURCES.includes(source)) {
    return res.status(400).json({ error: "Invalid source value." });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO leads (name, email, phone, source, status) VALUES (?, ?, ?, ?, ?)",
      [
        name.trim(),
        email.trim().toLowerCase(),
        phone?.trim() || null,
        source || "Other",
        status || "new",
      ]
    );
    const [rows] = await db.query("SELECT * FROM leads WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not create lead." });
  }
});

// ─── PUT /api/leads/:id ──────────────────────────────────────────
router.put("/:id", auth, async (req, res) => {
  const { name, email, phone, source, status } = req.body;

  if (source && !VALID_SOURCES.includes(source)) {
    return res.status(400).json({ error: "Invalid source value." });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  try {
    const [check] = await db.query("SELECT id FROM leads WHERE id = ?", [req.params.id]);
    if (!check[0]) return res.status(404).json({ error: "Lead not found." });

    await db.query(
      `UPDATE leads SET
        name   = COALESCE(?, name),
        email  = COALESCE(?, email),
        phone  = ?,
        source = COALESCE(?, source),
        status = COALESCE(?, status)
      WHERE id = ?`,
      [
        name?.trim()          || null,
        email?.trim().toLowerCase() || null,
        phone !== undefined ? (phone?.trim() || null) : undefined,
        source || null,
        status || null,
        req.params.id,
      ]
    );

    const [rows] = await db.query("SELECT * FROM leads WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not update lead." });
  }
});

// ─── DELETE /api/leads/:id ───────────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    const [check] = await db.query("SELECT id FROM leads WHERE id = ?", [req.params.id]);
    if (!check[0]) return res.status(404).json({ error: "Lead not found." });

    await db.query("DELETE FROM leads WHERE id = ?", [req.params.id]);
    res.json({ message: "Lead deleted." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not delete lead." });
  }
});

// ─── GET /api/leads/:id/notes ────────────────────────────────────
router.get("/:id/notes", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at DESC",
      [req.params.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not fetch notes." });
  }
});

// ─── POST /api/leads/:id/notes ───────────────────────────────────
router.post("/:id/notes", auth, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) {
    return res.status(400).json({ error: "Note content is required." });
  }

  try {
    const [check] = await db.query("SELECT id FROM leads WHERE id = ?", [req.params.id]);
    if (!check[0]) return res.status(404).json({ error: "Lead not found." });

    const [result] = await db.query(
      "INSERT INTO notes (lead_id, content) VALUES (?, ?)",
      [req.params.id, content.trim()]
    );
    const [rows] = await db.query("SELECT * FROM notes WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not add note." });
  }
});

module.exports = router;

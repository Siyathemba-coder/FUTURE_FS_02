const router = require("express").Router();
const db     = require("../db");
const auth   = require("../middleware/auth");

// DELETE /api/notes/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const [check] = await db.query("SELECT id FROM notes WHERE id = ?", [req.params.id]);
    if (!check[0]) return res.status(404).json({ error: "Note not found." });

    await db.query("DELETE FROM notes WHERE id = ?", [req.params.id]);
    res.json({ message: "Note deleted." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not delete note." });
  }
});

module.exports = router;

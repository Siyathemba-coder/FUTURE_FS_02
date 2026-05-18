// Creates the first admin user from your .env credentials.
// Run ONCE after schema.sql:  node db/seed.js
// Then delete ADMIN_EMAIL and ADMIN_PASSWORD from your .env.

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const db = require("../src/db");

(async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env first.");
    process.exit(1);
  }
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const name = ADMIN_EMAIL.split("@")[0];
  try {
    await db.query(
      "INSERT INTO admins (email, password, name) VALUES (?, ?, ?)",
      [ADMIN_EMAIL, hash, name]
    );
    console.log(`✓ Admin created: ${ADMIN_EMAIL}`);
    console.log("  Remove ADMIN_EMAIL / ADMIN_PASSWORD from .env now.");
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") console.log("Admin already exists — skipping.");
    else throw e;
  }
  process.exit(0);
})();

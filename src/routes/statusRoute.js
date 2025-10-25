import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/status", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) AS total FROM users");
    res.json({ totalRecords: parseInt(result.rows[0].total) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

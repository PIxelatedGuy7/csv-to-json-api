import express from "express";
import { parseCSVStream } from "../csvParser.js";
import pool from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.get("/upload", async (req, res) => {
  const startTime = Date.now();
  const batchSize = 500; 

  try {
    const records = await parseCSVStream(process.env.CSV_FILE_PATH);
    let inserted = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      // Prepare a single query with multiple VALUES
      const values = [];
      const queryParams = [];
      let paramIndex = 1;

      for (let user of batch) {
        const name = `${user.name.firstName} ${user.name.lastName}`;
        const age = parseInt(user.age);
        const address = user.address || null;

        const additional_info = { ...user };
        delete additional_info.name;
        delete additional_info.age;
        delete additional_info.address;

        values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        queryParams.push(name, age, address, additional_info);
      }

      const query = `
        INSERT INTO users (name, age, address, additional_info)
        VALUES ${values.join(",")}
      `;

      await pool.query(query, queryParams);
      inserted += batch.length;
    }

    // Calculate age distribution
    const result = await pool.query("SELECT age FROM users");
    const ages = result.rows.map(r => r.age);
    const groups = { "<20": 0, "20-40": 0, "40-60": 0, ">60": 0 };

    ages.forEach(age => {
      if (age < 20) groups["<20"]++;
      else if (age <= 40) groups["20-40"]++;
      else if (age <= 60) groups["40-60"]++;
      else groups[">60"]++;
    });

    const total = ages.length;
    console.log("\n Age-Group % Distribution:");
    for (let [key, val] of Object.entries(groups)) {
      console.log(`${key} : ${(val / total * 100).toFixed(2)}%`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\nUpload Summary: Inserted ${inserted} records in ${duration}s`);

    res.json({ message: "Data uploaded successfully!", inserted, duration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

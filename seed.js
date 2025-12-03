// seed.js
const pool = require("./db");
const bcrypt = require("bcrypt");

async function seed() {
    try {
        console.log("⏳ Creating tables...");

        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(150) UNIQUE,
        phone VARCHAR(50),
        password VARCHAR(255),
        role VARCHAR(30) DEFAULT 'customer',
        enabled TINYINT DEFAULT 1,
        removed TINYINT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT,
        token TEXT,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await pool.query(`
      CREATE TABLE IF NOT EXISTS counters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150),
        enabled TINYINT DEFAULT 1,
        removed TINYINT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        counter_id INT,
        agent_id INT,
        status ENUM('pending','called','finished') DEFAULT 'pending',
        enabled TINYINT DEFAULT 1,
        removed TINYINT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        called_at DATETIME,
        finished_at DATETIME
      )
    `);

        await pool.query(`
      CREATE TABLE IF NOT EXISTS agent_counter_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        counter_id INT,
        active TINYINT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log("✔ Tables created");

        console.log("⏳ Seeding counters...");
        await pool.query(`
      INSERT IGNORE INTO counters (id, name)
      VALUES (1, 'General'), (2, 'Billing'), (3, 'VIP')
    `);
        console.log("✔ Counters seeded");

        console.log("⏳ Creating admin...");
        const [admin] = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            ["admin@gmail.com"]
        );

        if (!admin.length) {
            const hashed = await bcrypt.hash("12345678", 10);

            await pool.query(
                `INSERT INTO users (name, email, password, role, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
                ["Admin", "admin@gmail.com", hashed, "admin"]
            );

            console.log("✔ Admin created: admin@gmail.com / 12345678");
        } else {
            console.log("✔ Admin already exists");
        }

        console.log("🎉 Seed complete");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    }
}

seed();

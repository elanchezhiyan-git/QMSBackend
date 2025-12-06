// seed.js
const pool = require("./db");
const bcrypt = require("bcryptjs");

async function seed() {
    try {
        console.log("⏳ Creating tables...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                                                 id SERIAL PRIMARY KEY,
                                                 name VARCHAR(100),
                email VARCHAR(150) UNIQUE,
                phone VARCHAR(50),
                password VARCHAR(255),
                role VARCHAR(30) DEFAULT 'customer',
                enabled SMALLINT DEFAULT 1,
                removed SMALLINT DEFAULT 0,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                                                          id SERIAL PRIMARY KEY,
                                                          admin_id INT,
                                                          token TEXT,
                                                          expires_at TIMESTAMP WITHOUT TIME ZONE,
                                                          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS counters (
                                                    id SERIAL PRIMARY KEY,
                                                    name VARCHAR(150),
                enabled SMALLINT DEFAULT 1,
                removed SMALLINT DEFAULT 0,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
        `);

        await pool.query(`
      DO $$ BEGIN
          CREATE TYPE ticket_status AS ENUM('pending','called','finished');
      EXCEPTION
          WHEN duplicate_object THEN NULL;
      END $$;
      
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        customer_id INT,
        counter_id INT,
        agent_id INT,
        status ticket_status DEFAULT 'pending',
        enabled SMALLINT DEFAULT 1,
        removed SMALLINT DEFAULT 0,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        called_at TIMESTAMP WITHOUT TIME ZONE,
        finished_at TIMESTAMP WITHOUT TIME ZONE
      )
    `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS agent_counter_sessions (
                                                                  id SERIAL PRIMARY KEY,
                                                                  user_id INT,
                                                                  counter_id INT,
                                                                  active SMALLINT DEFAULT 1,
                                                                  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("✔ Tables created");

        console.log("⏳ Seeding counters...");
        // ON CONFLICT DO NOTHING replaces MySQL's INSERT IGNORE
        await pool.query(`
            INSERT INTO counters (id, name)
            VALUES (1, 'General'), (2, 'Billing'), (3, 'VIP')
                ON CONFLICT (id) DO NOTHING
        `);
        console.log("✔ Counters seeded");

        console.log("⏳ Creating admin...");

        // Use $1 for parameter binding in pool.query for PostgreSQL
        const result = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            ["admin@gmail.com"]
        );

        if (!result.rows.length) {
            const hashed = await bcrypt.hash("12345678", 10);

            await pool.query(
                `INSERT INTO users (name, email, password, role, created_at)
                 VALUES ($1, $2, $3, $4, NOW())`,
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
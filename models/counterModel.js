const pool = require('../db');

const Counter = {
    async create(name) {
        const [row] = await pool.query(
            `INSERT INTO counters (name, enabled, removed, created_at)
             VALUES (?, 1, 0, NOW())`,
            [name]
        );
        return row.insertId;
    },

    async list() {
        const [rows] = await pool.query(
            `SELECT id, name, enabled
             FROM counters
             ORDER BY id ASC`
        );
        return rows;
    },

    async listActive() {
        const [rows] = await pool.query(
            `SELECT id, name, enabled
             FROM counters
             where enabled = 1
             ORDER BY id ASC`
        );
        return rows;
    },

    async read(id) {
        const [rows] = await pool.query(
            `SELECT id, name, enabled
             FROM counters
             WHERE id = ?
               AND removed = 0`,
            [id]
        );
        return rows[0];
    },

    async update(id, name) {
        await pool.query(
            `UPDATE counters
             SET name = ?
             WHERE id = ?`,
            [name, id]
        );
        return this.read(id);
    },

    async updateActiveStatus(id, isActive) {
        await pool.query(
            `UPDATE counters
             SET enabled = ?
             WHERE id = ?`,
            [isActive, id]
        );
        return this.read(id);
    },

    async delete(id) {
        await pool.query(
            `DELETE
             from counters
             WHERE id = ?`,
            [id]
        );
        return true;
    },
};

module.exports = Counter;

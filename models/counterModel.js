const pool = require('../db');

const Counter = {
    async create(name) {
        const result = await pool.query(
            `INSERT INTO counters (name, enabled, removed, created_at)
             VALUES ($1, 1, 0, NOW())
             RETURNING id`,
            [name]
        );
        return result.rows[0].id;
    },

    async list() {
        const result = await pool.query(
            `SELECT id, name, enabled
             FROM counters
             ORDER BY id ASC`
        );
        return result.rows;
    },

    async listActive() {
        const result = await pool.query(
            `SELECT id, name, enabled
             FROM counters
             where enabled = 1
             ORDER BY id ASC`
        );
        return result.rows;
    },

    async read(id) {
        const result = await pool.query(
            `SELECT id, name, enabled
             FROM counters
             WHERE id = $1
               AND removed = 0`,
            [id]
        );
        return result.rows[0];
    },

    async update(id, name) {
        await pool.query(
            `UPDATE counters
             SET name = $1
             WHERE id = $2`,
            [name, id]
        );
        return this.read(id);
    },

    async updateActiveStatus(id, isActive) {
        await pool.query(
            `UPDATE counters
             SET enabled = $1
             WHERE id = $2`,
            [isActive, id]
        );
        return this.read(id);
    },

    async delete(id) {
        await pool.query(
            `DELETE
             from counters
             WHERE id = $1`,
            [id]
        );
        return true;
    },
};

module.exports = Counter;
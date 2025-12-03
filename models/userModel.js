const pool = require('../db');

const User = {
    async findByEmail(email) {
        const [rows] = await pool.query(
            `SELECT *
             FROM users
             WHERE email = ?
               AND removed = 0 LIMIT 1`,
            [email]
        );
        return rows[0];
    },

    async findByPhone(phone) {
        const [rows] = await pool.query(
            `SELECT *
             FROM users
             WHERE phone = ?
               AND removed = 0 LIMIT 1`,
            [phone]
        );
        return rows[0];
    },

    async findById(id) {
        const [rows] = await pool.query(
            `SELECT id, name, email, phone, role, enabled
             FROM users
             WHERE id = ?
               AND removed = 0`,
            [id]
        );
        return rows[0];
    },

    async create(data) {
        const [result] = await pool.query(
            `INSERT INTO users (name, email, phone, password, role, enabled, removed, created_at)
             VALUES (?, ?, ?, ?, ?, 1, 0, NOW())`,
            [
                data.name,
                data.email || null,
                data.phone || null,
                data.password || null,
                data.role || "customer",
            ]
        );

        return result.insertId;
    },

    async list(limit, offset) {
        const [rows] = await pool.query(
            `SELECT id, name, email, phone, role, enabled
             FROM users
             WHERE removed = 0
             ORDER BY id DESC LIMIT ?
             OFFSET ?`,
            [limit, offset]
        );
        return rows;
    },

    async totalCount() {
        const [[row]] = await pool.query(
            `SELECT COUNT(*) AS count
             FROM users
             WHERE removed = 0`
        );
        return row.count;
    },

    async update(id, fields) {
        const {name, email, phone, role, enabled} = fields;

        await pool.query(
            `UPDATE users
             SET name=?,
                 email=?,
                 phone=?,
                 role=?,
                 enabled=?
             WHERE id = ?`,
            [name, email, phone, role, enabled ? 1 : 0, id]
        );

        return this.findById(id);
    },

    async softDelete(id) {
        await pool.query(
            `UPDATE users
             SET removed = 1
             WHERE id = ?`,
            [id]
        );
        return true;
    },
};

module.exports = User;

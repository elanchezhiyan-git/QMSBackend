const pool = require('../db');

const User = {
    async findByEmail(email) {
        const result = await pool.query(
            `SELECT *
             FROM users
             WHERE email = $1
               AND removed = 0 LIMIT 1`,
            [email]
        );
        return result.rows[0];
    },

    async findByPhone(phone) {
        const result = await pool.query(
            `SELECT *
             FROM users
             WHERE phone = $1
               AND removed = 0 LIMIT 1`,
            [phone]
        );
        return result.rows[0];
    },

    async findById(id) {
        const result = await pool.query(
            `SELECT id, name, email, phone, role, enabled
             FROM users
             WHERE id = $1
               AND removed = 0`,
            [id]
        );
        return result.rows[0];
    },

    async create(data) {
        const result = await pool.query(
            `INSERT INTO users (name, email, phone, password, role, enabled, removed, created_at)
             VALUES ($1, $2, $3, $4, $5, 1, 0, NOW())
             RETURNING id`,
            [
                data.name,
                data.email || null,
                data.phone || null,
                data.password || null,
                data.role || "customer",
            ]
        );

        return result.rows[0].id;
    },

    async list(limit, offset) {
        const result = await pool.query(
            `SELECT id, name, email, phone, role, enabled
             FROM users
             WHERE removed = 0
             ORDER BY id DESC LIMIT $1
             OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    },

    async totalCount() {
        const result = await pool.query(
            `SELECT COUNT(*) AS count
             FROM users
             WHERE removed = 0`
        );
        return result.rows[0].count;
    },

    async update(id, fields) {
        const {name, email, phone, role, enabled} = fields;

        await pool.query(
            `UPDATE users
             SET name=$1,
                 email=$2,
                 phone=$3,
                 role=$4,
                 enabled=$5
             WHERE id = $6`,
            [name, email, phone, role, enabled ? 1 : 0, id]
        );

        return this.findById(id);
    },

    async softDelete(id) {
        await pool.query(
            `UPDATE users
             SET removed = 1
             WHERE id = $1`,
            [id]
        );
        return true;
    },
};

module.exports = User;
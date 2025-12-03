const pool = require('../db');

const RefreshToken = {
    async save(userId, token) {
        await pool.query(
            `INSERT INTO refresh_tokens (admin_id, token, expires_at, created_at)
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW())`,
            [userId, token]
        );
        return true;
    },

    async validate(userId, token) {
        const [rows] = await pool.query(
            `SELECT id
             FROM refresh_tokens
             WHERE admin_id = ?
               AND token = ?`,
            [userId, token]
        );
        return rows.length > 0;
    },

    async delete(token) {
        await pool.query(
            `DELETE
             FROM refresh_tokens
             WHERE token = ?`,
            [token]
        );
        return true;
    },

    async deleteAllForUser(userId) {
        await pool.query(
            `DELETE
             FROM refresh_tokens
             WHERE admin_id = ?`,
            [userId]
        );
        return true;
    }
};

module.exports = RefreshToken;

const pool = require('../db');

const RefreshToken = {
    async save(userId, token) {
        await pool.query(
            `INSERT INTO refresh_tokens (admin_id, token, expires_at, created_at)
             VALUES ($1, $2, NOW() + INTERVAL '7 DAY', NOW())`,
            [userId, token]
        );
        return true;
    },

    async validate(userId, token) {
        const result = await pool.query(
            `SELECT id
             FROM refresh_tokens
             WHERE admin_id = $1
               AND token = $2`,
            [userId, token]
        );
        return result.rows.length > 0;
    },

    async delete(token) {
        await pool.query(
            `DELETE
             FROM refresh_tokens
             WHERE token = $1`,
            [token]
        );
        return true;
    },

    async deleteAllForUser(userId) {
        await pool.query(
            `DELETE
             FROM refresh_tokens
             WHERE admin_id = $1`,
            [userId]
        );
        return true;
    }
};

module.exports = RefreshToken;
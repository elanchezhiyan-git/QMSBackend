const pool = require('../db');

const Ticket = {
    async create(customer_id, counter_id) {
        const [r] = await pool.query(
            `INSERT INTO tickets
                 (customer_id, counter_id, status, enabled, removed, created_at)
             VALUES (?, ?, 'pending', 1, 0, NOW())`,
            [customer_id, counter_id]
        );
        return r.insertId;
    },

    async read(id) {
        const [rows] = await pool.query(
            `SELECT t.*,
                    c.name  AS counter_name,
                    u.name  AS customer_name,
                    u.phone AS customer_phone
             FROM tickets t
                      LEFT JOIN counters c ON c.id = t.counter_id
                      LEFT JOIN users u ON u.id = t.customer_id
             WHERE t.id = ?`,
            [id]
        );
        return rows[0];
    },

    async readByAgent(id) {
        const [rows] = await pool.query(
            `SELECT t.*
             FROM tickets t
             WHERE t.agent_id = ?
               AND t.status = 'called'`,
            [id]
        );
        return rows[0];
    },

    async list(limit, offset) {
        const [rows] = await pool.query(
            `SELECT t.*,
                    c.name  AS counter_name,
                    u.name  AS customer_name,
                    u.phone AS customer_phone
             FROM tickets t
                      LEFT JOIN counters c ON c.id = t.counter_id
                      LEFT JOIN users u ON u.id = t.customer_id
             WHERE t.removed = 0
             ORDER BY t.created_at DESC LIMIT ?
             OFFSET ?`,
            [limit, offset]
        );
        return rows;
    },

    async totalCount() {
        const [[row]] = await pool.query(
            `SELECT COUNT(*) AS count
             FROM tickets
             WHERE removed = 0`
        );
        return row.count;
    },

    async listByPhone(phone) {
        const [rows] = await pool.query(`
            SELECT *
            FROM tickets t
                     LEFT JOIN users u ON u.id = t.customer_id
            where u.phone = '${phone}'
            ORDER BY t.created_at DESC
        `);
        return rows;
    },

    async callNext(counterId, agentId) {
        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            const [rows] = await conn.query(
                `SELECT *
                 FROM tickets
                 WHERE counter_id = ?
                   AND status = 'pending'
                   AND removed = 0
                 ORDER BY created_at ASC LIMIT 1
         FOR
                UPDATE`,
                [counterId]
            );

            if (!rows.length) {
                await conn.rollback();
                conn.release();
                return null;
            }

            const ticket = rows[0];

            await conn.query(
                `UPDATE tickets
                 SET status = 'called',
                     called_at = NOW(),
                     agent_id = ?
                 WHERE id = ?`,
                [agentId, ticket.id]
            );

            await conn.commit();
            conn.release();

            return ticket;
        } catch (err) {
            await conn.rollback();
            conn.release();
            throw err;
        }
    },

    async finish(ticketId, agentId) {
        const [r] = await pool.query(
            `UPDATE tickets
             SET status      = 'finished',
                 finished_at = NOW(),
                 agent_id    = ?
             WHERE id = ?`,
            [agentId, ticketId]
        );
        return r.affectedRows > 0;
    },

    async softDelete(id) {
        await pool.query(
            `UPDATE tickets
             SET removed = 1
             WHERE id = ?`,
            [id]
        );
        return true;
    },
};

module.exports = Ticket;

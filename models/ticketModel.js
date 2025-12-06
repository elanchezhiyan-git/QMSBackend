const pool = require('../db');

const Ticket = {
    async create(customer_id, counter_id) {
        const result = await pool.query(
            `INSERT INTO tickets
                 (customer_id, counter_id, status, enabled, removed, created_at)
             VALUES ($1, $2, 'pending', 1, 0, NOW())
             RETURNING id`,
            [customer_id, counter_id]
        );
        return result.rows[0].id;
    },

    async read(id) {
        const result = await pool.query(
            `SELECT t.*,
                    c.name  AS counter_name,
                    u.name  AS customer_name,
                    u.phone AS customer_phone
             FROM tickets t
                      LEFT JOIN counters c ON c.id = t.counter_id
                      LEFT JOIN users u ON u.id = t.customer_id
             WHERE t.id = $1`,
            [id]
        );
        return result.rows[0];
    },

    async readByAgent(id) {
        const result = await pool.query(
            `SELECT t.*
             FROM tickets t
             WHERE t.agent_id = $1
               AND t.status = 'called'`,
            [id]
        );
        return result.rows[0];
    },

    async list(limit, offset) {
        const result = await pool.query(
            `SELECT t.*,
                    c.name  AS counter_name,
                    u.name  AS customer_name,
                    u.phone AS customer_phone
             FROM tickets t
                      LEFT JOIN counters c ON c.id = t.counter_id
                      LEFT JOIN users u ON u.id = t.customer_id
             WHERE t.removed = 0
             ORDER BY t.created_at DESC LIMIT $1
             OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    },

    async totalCount() {
        const result = await pool.query(
            `SELECT COUNT(*) AS count
             FROM tickets
             WHERE removed = 0`
        );
        return result.rows[0].count;
    },

    async listByPhone(phone) {
        const result = await pool.query(`
            SELECT *
            FROM tickets t
                     LEFT JOIN users u ON u.id = t.customer_id
            where u.phone = $1
            ORDER BY t.created_at DESC
        `, [phone]);
        return result.rows;
    },

    async callNext(counterId, agentId) {
        const conn = await pool.connect();

        try {
            await conn.query('BEGIN');

            const result = await conn.query(
                `SELECT *
                 FROM tickets
                 WHERE counter_id = $1
                   AND status = 'pending'
                   AND removed = 0
                 ORDER BY created_at ASC LIMIT 1
                 FOR UPDATE`,
                [counterId]
            );

            if (!result.rows.length) {
                await conn.query('ROLLBACK');
                conn.release();
                return null;
            }

            const ticket = result.rows[0];

            await conn.query(
                `UPDATE tickets
                 SET status = 'called',
                     called_at = NOW(),
                     agent_id = $1
                 WHERE id = $2`,
                [agentId, ticket.id]
            );

            await conn.query('COMMIT');
            conn.release();

            return ticket;
        } catch (err) {
            await conn.query('ROLLBACK');
            conn.release();
            throw err;
        }
    },

    async finish(ticketId, agentId) {
        const result = await pool.query(
            `UPDATE tickets
             SET status      = 'finished',
                 finished_at = NOW(),
                 agent_id    = $1
             WHERE id = $2`,
            [agentId, ticketId]
        );
        return result.rowCount > 0;
    },

    async softDelete(id) {
        await pool.query(
            `UPDATE tickets
             SET removed = 1
             WHERE id = $1`,
            [id]
        );
        return true;
    },
};

module.exports = Ticket;
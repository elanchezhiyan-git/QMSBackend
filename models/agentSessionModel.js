const pool = require('../db');

const AgentSession = {
    async chooseCounter(agentId, counterId) {
        await pool.query(
            `INSERT INTO agent_counter_sessions
                 (user_id, counter_id, active, created_at)
             VALUES ($1, $2, 1, NOW())`,
            [agentId, counterId]
        );
        return true;
    },

    async getActiveCounter(agentId) {
        const result = await pool.query(
            `SELECT counter_id
             FROM agent_counter_sessions
             WHERE user_id = $1
               AND active = 1
             ORDER BY created_at DESC LIMIT 1`,
            [agentId]
        );
        return result.rows.length ? result.rows[0].counter_id : null;
    },

    async deactivateAll(agentId) {
        await pool.query(
            `UPDATE agent_counter_sessions
             SET active = 0
             WHERE user_id = $1`,
            [agentId]
        );
        return true;
    }
};

module.exports = AgentSession;
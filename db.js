// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    // Connection Parameters
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,

    // Pool Configuration
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,

    // AWS RDS requires SSL (matching the JDBC URL's sslmode=require)
    ssl: {
        // Setting rejectUnauthorized to false allows the connection 
        // without requiring the root CA certificate to be explicitly configured.
        // For higher security, this should be 'true' with the CA certificate.
        rejectUnauthorized: false
    },
});

module.exports = pool;
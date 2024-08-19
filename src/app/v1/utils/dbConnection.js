import config from '../../../../config.js';
import logger from '../../../../logger.js';
import mysql from 'mysql2/promise';

const DbConfig = {
    host: config.DATABASE_HOST,
    user: config.DATABASE_USER,
    password: config.DATABASE_PASSWORD,
    database: config.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const poolPromise = (async () => {
    try {
        const pool = mysql.createPool(DbConfig);
        await pool.getConnection();
        logger.info('Database connection successful.');
        return pool;
    } catch (err) {
        logger.info('Database Connection Failed! Bad Config: ', err);
    }
})();

export {  poolPromise };

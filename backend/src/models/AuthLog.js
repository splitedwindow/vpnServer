const { pool } = require('../config/database');

class AuthLog {
  static async getRecentAttempts(limit = 100) {
    const [rows] = await pool.query(`
      SELECT 
        username,
        reply,
        authdate
      FROM radpostauth 
      ORDER BY authdate DESC
      LIMIT ?
    `,
    [limit]
    );
    return rows;
  }

  static async getAttemptsByUsername(username, limit = 50) {
    const [rows] = await pool.query(`
      SELECT 
        reply,
        authdate
      FROM radpostauth 
      WHERE username = ?
      ORDER BY authdate DESC
      LIMIT ?
    `,
    [username, limit]
    );
    return rows;
  }

  static async getFailedAttempts(limit = 50) {
    const [rows] = await pool.query(`
      SELECT 
        username,
        authdate,
        COUNT(*) as attempt_count
      FROM radpostauth 
      WHERE reply = 'Access-Reject'
      GROUP BY username, DATE(authdate)
      ORDER BY authdate DESC
      LIMIT ?
    `,
    [limit]
    );
    return rows;
  }
}

module.exports = AuthLog;

const { pool } = require('../config/database');

class Session {
  static async getActiveSessions() {
    const [rows] = await pool.query(`
      SELECT 
        username,
        acctsessionid,
        nasipaddress,
        framedipaddress,
        acctstarttime,
        acctsessiontime,
        acctinputoctets,
        acctoutputoctets,
        callingstationid
      FROM radacct 
      WHERE acctstoptime IS NULL
      ORDER BY acctstarttime DESC
    `);
    return rows;
  }

  static async getSessionsByUsername(username) {
    const [rows] = await pool.query(`
      SELECT 
        acctsessionid,
        nasipaddress,
        framedipaddress,
        acctstarttime,
        acctstoptime,
        acctsessiontime,
        acctinputoctets,
        acctoutputoctets,
        acctterminatecause
      FROM radacct 
      WHERE username = ?
      ORDER BY acctstarttime DESC
      LIMIT 50
    `,
    [username]
    );
    return rows;
  }

  static async getSessionStats(username) {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_sessions,
        SUM(acctsessiontime) as total_time,
        SUM(acctinputoctets) as total_input,
        SUM(acctoutputoctets) as total_output,
        MAX(acctstarttime) as last_login
      FROM radacct 
      WHERE username = ?
    `,
    [username]
    );
    return rows[0];
  }

  static async getAllSessionStats() {
    const [rows] = await pool.query(`
      SELECT 
        username,
        COUNT(*) as session_count,
        SUM(acctsessiontime) as total_time,
        SUM(acctinputoctets + acctoutputoctets) as total_traffic,
        MAX(acctstarttime) as last_seen
      FROM radacct 
      GROUP BY username
      ORDER BY last_seen DESC
    `);
    return rows;
  }
}

module.exports = Session;

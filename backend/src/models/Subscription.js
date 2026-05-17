const { pool } = require('../config/database');

class Subscription {
  static async getByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM subscriptions WHERE username = ? ORDER BY created_at DESC',
      [username]
    );
    return rows;
  }

  static async getActive(username) {
    const [rows] = await pool.query(
      'SELECT * FROM subscriptions WHERE username = ? AND is_active = 1 AND expires_at > NOW() LIMIT 1',
      [username]
    );
    return rows[0] || null;
  }

  static async getAll() {
    const [rows] = await pool.query(`
      SELECT s.*, 
        CASE WHEN s.is_active = 1 AND s.expires_at > NOW() THEN 1 ELSE 0 END as is_valid
      FROM subscriptions s
      ORDER BY s.created_at DESC
    `);
    return rows;
  }

  static async create(username, plan, durationDays = 30) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      const [result] = await connection.query(
        'INSERT INTO subscriptions (username, plan, started_at, expires_at, is_active) VALUES (?, ?, NOW(), ?, 1)',
        [username, plan, expiresAt]
      );

      // Update FreeRADIUS Expiration attribute so the built-in expiration module works
      // Format required: "Mon DD YYYY HH:MM:SS" (e.g. "Jun 01 2025 23:59:59")
      const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const mm = MONTHS[expiresAt.getMonth()];
      const dd = String(expiresAt.getDate()).padStart(2, '0');
      const yyyy = expiresAt.getFullYear();
      const expirationValue = `${mm} ${dd} ${yyyy} 23:59:59`;

      await connection.query(
        'DELETE FROM radcheck WHERE username = ? AND attribute = "Expiration"',
        [username]
      );
      await connection.query(
        'INSERT INTO radcheck (username, attribute, op, value) VALUES (?, "Expiration", ":=", ?)',
        [username, expirationValue]
      );

      await connection.commit();
      return { id: result.insertId, username, plan, expires_at: expiresAt };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async cancel(id) {
    const [result] = await pool.query(
      'UPDATE subscriptions SET is_active = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getExpired() {
    const [rows] = await pool.query(
      'SELECT * FROM subscriptions WHERE expires_at < NOW() AND is_active = 1'
    );
    return rows;
  }
}

module.exports = Subscription;

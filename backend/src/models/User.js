const { pool } = require('../config/database');
const md4 = require('js-md4');

function ntHash(password) {
  const buf = Buffer.from(password, 'utf16le');
  return md4(buf).toUpperCase();
}

class User {
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT DISTINCT rc.username, rc.value as password, 
             GROUP_CONCAT(DISTINCT rug.groupname) as \`groups\`
      FROM radcheck rc
      LEFT JOIN radusergroup rug ON rc.username = rug.username
      WHERE rc.attribute = 'Cleartext-Password'
      GROUP BY rc.username, rc.value
    `);
    return rows;
  }

  static async getByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM radcheck WHERE username = ? AND attribute = "Cleartext-Password"',
      [username]
    );
    return rows[0];
  }

  static async create(username, password, groupname = 'vpn_users') {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        'INSERT INTO radcheck (username, attribute, op, value) VALUES (?, "Cleartext-Password", ":=", ?)',
        [username, password]
      );

      await connection.query(
        'INSERT INTO radcheck (username, attribute, op, value) VALUES (?, "NT-Password", ":=", ?)',
        [username, ntHash(password)]
      );

      await connection.query(
        'INSERT INTO radusergroup (username, groupname, priority) VALUES (?, ?, 1)',
        [username, groupname]
      );

      await connection.commit();
      return { username, groupname };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(username, password) {
    const [result] = await pool.query(
      'UPDATE radcheck SET value = ? WHERE username = ? AND attribute = "Cleartext-Password"',
      [password, username]
    );
    return result.affectedRows > 0;
  }

  static async delete(username) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query('DELETE FROM radcheck WHERE username = ?', [username]);
      await connection.query('DELETE FROM radreply WHERE username = ?', [username]);
      await connection.query('DELETE FROM radusergroup WHERE username = ?', [username]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getUserGroups(username) {
    const [rows] = await pool.query(
      'SELECT groupname, priority FROM radusergroup WHERE username = ? ORDER BY priority',
      [username]
    );
    return rows;
  }

  static async addToGroup(username, groupname, priority = 1) {
    const [result] = await pool.query(
      'INSERT INTO radusergroup (username, groupname, priority) VALUES (?, ?, ?)',
      [username, groupname, priority]
    );
    return result.affectedRows > 0;
  }

  static async removeFromGroup(username, groupname) {
    const [result] = await pool.query(
      'DELETE FROM radusergroup WHERE username = ? AND groupname = ?',
      [username, groupname]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;

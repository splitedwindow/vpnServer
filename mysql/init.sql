-- FreeRADIUS MySQL Database Schema
-- This schema is compatible with FreeRADIUS 3.x

USE radius;

-- Table structure for table 'radcheck'
-- Stores user authentication credentials
CREATE TABLE IF NOT EXISTS radcheck (
  id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL DEFAULT '',
  attribute VARCHAR(64) NOT NULL DEFAULT '',
  op CHAR(2) NOT NULL DEFAULT '==',
  value VARCHAR(253) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY username (username(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table 'radreply'
-- Stores user-specific reply attributes
CREATE TABLE IF NOT EXISTS radreply (
  id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL DEFAULT '',
  attribute VARCHAR(64) NOT NULL DEFAULT '',
  op CHAR(2) NOT NULL DEFAULT '=',
  value VARCHAR(253) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY username (username(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table 'radgroupcheck'
-- Stores group authentication attributes
CREATE TABLE IF NOT EXISTS radgroupcheck (
  id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  groupname VARCHAR(64) NOT NULL DEFAULT '',
  attribute VARCHAR(64) NOT NULL DEFAULT '',
  op CHAR(2) NOT NULL DEFAULT '==',
  value VARCHAR(253) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY groupname (groupname(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table 'radgroupreply'
-- Stores group reply attributes
CREATE TABLE IF NOT EXISTS radgroupreply (
  id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  groupname VARCHAR(64) NOT NULL DEFAULT '',
  attribute VARCHAR(64) NOT NULL DEFAULT '',
  op CHAR(2) NOT NULL DEFAULT '=',
  value VARCHAR(253) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY groupname (groupname(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table 'radusergroup'
-- Maps users to groups
CREATE TABLE IF NOT EXISTS radusergroup (
  id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL DEFAULT '',
  groupname VARCHAR(64) NOT NULL DEFAULT '',
  priority INT(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY username (username(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table 'radacct'
-- Stores accounting information (session logs)
CREATE TABLE IF NOT EXISTS radacct (
  radacctid BIGINT(21) NOT NULL AUTO_INCREMENT,
  acctsessionid VARCHAR(64) NOT NULL DEFAULT '',
  acctuniqueid VARCHAR(32) NOT NULL DEFAULT '',
  username VARCHAR(64) NOT NULL DEFAULT '',
  realm VARCHAR(64) DEFAULT '',
  nasipaddress VARCHAR(15) NOT NULL DEFAULT '',
  nasportid VARCHAR(32) DEFAULT NULL,
  nasporttype VARCHAR(32) DEFAULT NULL,
  acctstarttime DATETIME NULL DEFAULT NULL,
  acctupdatetime DATETIME NULL DEFAULT NULL,
  acctstoptime DATETIME NULL DEFAULT NULL,
  acctinterval INT(12) DEFAULT NULL,
  acctsessiontime INT(12) UNSIGNED DEFAULT NULL,
  acctauthentic VARCHAR(32) DEFAULT NULL,
  connectinfo_start VARCHAR(128) DEFAULT NULL,
  connectinfo_stop VARCHAR(128) DEFAULT NULL,
  acctinputoctets BIGINT(20) DEFAULT NULL,
  acctoutputoctets BIGINT(20) DEFAULT NULL,
  calledstationid VARCHAR(50) NOT NULL DEFAULT '',
  callingstationid VARCHAR(50) NOT NULL DEFAULT '',
  acctterminatecause VARCHAR(32) NOT NULL DEFAULT '',
  servicetype VARCHAR(32) DEFAULT NULL,
  framedprotocol VARCHAR(32) DEFAULT NULL,
  framedipaddress VARCHAR(15) NOT NULL DEFAULT '',
  framedipv6address VARCHAR(45) DEFAULT NULL,
  framedipv6prefix VARCHAR(45) DEFAULT NULL,
  framedinterfaceid VARCHAR(44) DEFAULT NULL,
  delegatedipv6prefix VARCHAR(45) DEFAULT NULL,
  PRIMARY KEY (radacctid),
  UNIQUE KEY acctuniqueid (acctuniqueid),
  KEY username (username),
  KEY framedipaddress (framedipaddress),
  KEY acctsessionid (acctsessionid),
  KEY acctsessiontime (acctsessiontime),
  KEY acctstarttime (acctstarttime),
  KEY acctinterval (acctinterval),
  KEY acctstoptime (acctstoptime),
  KEY nasipaddress (nasipaddress)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table 'radpostauth'
-- Logs authentication attempts
CREATE TABLE IF NOT EXISTS radpostauth (
  id INT(11) NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL DEFAULT '',
  pass VARCHAR(64) NOT NULL DEFAULT '',
  reply VARCHAR(32) NOT NULL DEFAULT '',
  authdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY username (username),
  KEY authdate (authdate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table 'nas'
-- Network Access Servers (NAS) configuration
CREATE TABLE IF NOT EXISTS nas (
  id INT(10) NOT NULL AUTO_INCREMENT,
  nasname VARCHAR(128) NOT NULL,
  shortname VARCHAR(32),
  type VARCHAR(30) DEFAULT 'other',
  ports INT(5),
  secret VARCHAR(60) DEFAULT 'secret' NOT NULL,
  server VARCHAR(64),
  community VARCHAR(50),
  description VARCHAR(200) DEFAULT 'RADIUS Client',
  PRIMARY KEY (id),
  KEY nasname (nasname)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table 'subscriptions'
-- Tracks user subscription plans and expiry
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  plan VARCHAR(32) NOT NULL DEFAULT 'basic',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY username (username),
  KEY expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample test user
-- Username: testuser, Password: testpass
INSERT INTO radcheck (username, attribute, op, value) VALUES
('testuser', 'Cleartext-Password', ':=', 'testpass');

-- Insert sample VPN group configuration (no Auth-Type override - let FreeRADIUS handle mschap)

INSERT INTO radgroupreply (groupname, attribute, op, value) VALUES
('vpn_users', 'Framed-Protocol', ':=', 'PPP'),
('vpn_users', 'Service-Type', ':=', 'Framed-User');

-- Assign test user to VPN group
INSERT INTO radusergroup (username, groupname, priority) VALUES
('testuser', 'vpn_users', 1);

-- Insert sample subscription for testuser (expires in 30 days)
INSERT INTO subscriptions (username, plan, started_at, expires_at, is_active) VALUES
('testuser', 'basic', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1);

-- Set FreeRADIUS Expiration attribute so built-in expiration module blocks expired users
-- Format: 'MMM DD YYYY HH:MM:SS' (e.g. 'Jun 01 2025 23:59:59')
-- This is managed automatically by the backend when subscriptions are created/renewed
INSERT INTO radcheck (username, attribute, op, value) VALUES
('testuser', 'Expiration', ':=', DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 30 DAY), '%b %d %Y 23:59:59'));

-- Insert sample NAS (MikroTik router) - update IP and secret later
INSERT INTO nas (nasname, shortname, type, ports, secret, description) VALUES
('127.0.0.1', 'localhost', 'mikrotik', 1812, 'testing123', 'Local test MikroTik'),
('192.168.1.1', 'mikrotik', 'mikrotik', 1812, 'your-secret-here', 'Production MikroTik Router');

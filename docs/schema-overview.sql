-- 储备林工程机械服务平台 MVP 数据库结构说明
-- 当前可运行版本使用 SQLite，无需安装数据库即可启动。
-- 后续迁移 MySQL 时，可按本文件表结构扩展字段 create_time/update_time/create_by/update_by/deleted/status/remark。

CREATE TABLE users (
  username VARCHAR(64) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  role_name VARCHAR(64) NOT NULL,
  org VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL
);

CREATE TABLE suppliers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(128) NOT NULL,
  region VARCHAR(128) NOT NULL,
  business TEXT NOT NULL,
  tags TEXT NOT NULL,
  score DECIMAL(3,1) NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE items (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  channel VARCHAR(128) NOT NULL,
  category VARCHAR(128) NOT NULL,
  region VARCHAR(128) NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  price VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE demands (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  region VARCHAR(128) NOT NULL,
  category VARCHAR(128) NOT NULL,
  budget INTEGER NOT NULL,
  method VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  matched VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE quotes (
  id VARCHAR(64) PRIMARY KEY,
  demand_id VARCHAR(64) NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  plan TEXT NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE contracts (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  type VARCHAR(128) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE announcements (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY,
  actor VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  target VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL
);

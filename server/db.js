import { createRequire } from "module";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const sqlite3 = require("sqlite3");

const Database = sqlite3.verbose().Database;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isVercelRuntime = process.env.VERCEL === "1";
const dataDirectory = process.env.DB_DIRECTORY
  ? process.env.DB_DIRECTORY
  : isVercelRuntime
    ? "/tmp"
    : join(__dirname, "data");
const databasePath = join(dataDirectory, "flow-finance.db");

mkdirSync(dataDirectory, { recursive: true });

export const database = new Database(databasePath);

database.serialize(() => {
  database.run("PRAGMA foreign_keys = ON");
});

export const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    database.run(sql, params, function runCallback(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

export const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    database.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });

export const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    database.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });

export const initDatabase = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      occupation TEXT NOT NULL DEFAULT '',
      monthly_goal INTEGER NOT NULL DEFAULT 50000,
      currency TEXT NOT NULL DEFAULT 'INR',
      bio TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
};

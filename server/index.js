import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { all, get, initDatabase, run } from "./db.js";
import { authMiddleware, signToken } from "./auth.js";
import { transactions as seedTransactions } from "../src/data/transactions.js";

const app = express();
const PORT = process.env.PORT || 3001;
const DEMO_EMAIL = "demo@flowfinance.com";
const DEMO_PASSWORD = "demo1234";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDirectory = join(__dirname, "..", "dist");
const distIndexFile = join(distDirectory, "index.html");
const isDirectRun = process.argv[1] === __filename;

app.use(cors());
app.use(express.json());

const serializeUser = (row) => ({
  id: row.id,
  email: row.email,
  profile: {
    fullName: row.full_name,
    displayName: row.display_name,
    occupation: row.occupation,
    monthlyGoal: Number(row.monthly_goal),
    currency: row.currency,
    bio: row.bio,
  },
  createdAt: row.created_at,
});

const serializeTransaction = (row) => ({
  id: row.id,
  date: row.date,
  amount: Number(row.amount),
  category: row.category,
  type: row.type,
  note: row.note,
});

const getUserByEmail = async (email) =>
  get("SELECT * FROM users WHERE email = ?", [email]);

const getUserById = async (userId) =>
  get("SELECT * FROM users WHERE id = ?", [userId]);

const getTransactionsByUserId = async (userId) =>
  all(
    `SELECT id, date, amount, category, type, note
     FROM transactions
     WHERE user_id = ?
     ORDER BY date DESC, created_at DESC`,
    [userId]
  );

const respondWithSession = async (userRow) => {
  const transactions = await getTransactionsByUserId(userRow.id);
  return {
    token: signToken(userRow.id),
    user: serializeUser(userRow),
    transactions: transactions.map(serializeTransaction),
  };
};

const seedDemoAccount = async () => {
  const existingDemo = await getUserByEmail(DEMO_EMAIL);

  let demoUserId = existingDemo?.id;

  if (!existingDemo) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const now = new Date().toISOString();

    const insertResult = await run(
      `INSERT INTO users (
        full_name,
        email,
        password_hash,
        display_name,
        occupation,
        monthly_goal,
        currency,
        bio,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Demo User",
        DEMO_EMAIL,
        passwordHash,
        "Demo User",
        "Independent professional",
        50000,
        "INR",
        "Track income, expenses, and the habits that shape your finances.",
        now,
        now,
      ]
    );

    demoUserId = insertResult.lastID;
  }

  const demoTransactions = await getTransactionsByUserId(demoUserId);

  if (demoTransactions.length === 0) {
    const now = new Date().toISOString();

    for (const transaction of seedTransactions) {
      await run(
        `INSERT INTO transactions (
          id,
          user_id,
          date,
          amount,
          category,
          type,
          note,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `demo-${transaction.id}`,
          demoUserId,
          transaction.date,
          transaction.amount,
          transaction.category,
          transaction.type,
          "",
          now,
          now,
        ]
      );
    }
  }
};

app.get("/api/health", (_, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await getUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const insertResult = await run(
      `INSERT INTO users (
        full_name,
        email,
        password_hash,
        display_name,
        occupation,
        monthly_goal,
        currency,
        bio,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName.trim(),
        normalizedEmail,
        passwordHash,
        fullName.trim(),
        "Independent professional",
        50000,
        "INR",
        "Track income, expenses, and the habits that shape your finances.",
        now,
        now,
      ]
    );

    const user = await getUserById(insertResult.lastID);
    const session = await respondWithSession(user);

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const session = await respondWithSession(user);

    res.json(session);
  } catch (error) {
    next(error);
  }
});

app.get("/api/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await getUserById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const session = await respondWithSession(user);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

app.put("/api/me/profile", authMiddleware, async (req, res, next) => {
  try {
    const { fullName, displayName, occupation, monthlyGoal, currency, bio } = req.body;
    const user = await getUserById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date().toISOString();

    await run(
      `UPDATE users
       SET full_name = ?, display_name = ?, occupation = ?, monthly_goal = ?, currency = ?, bio = ?, updated_at = ?
       WHERE id = ?`,
      [
        fullName?.trim() || user.full_name,
        displayName?.trim() || user.display_name,
        occupation?.trim() || user.occupation,
        Number.isFinite(Number(monthlyGoal)) ? Number(monthlyGoal) : user.monthly_goal,
        currency || user.currency,
        bio?.trim() || user.bio,
        now,
        req.userId,
      ]
    );

    const updatedUser = await getUserById(req.userId);
    res.json({ user: serializeUser(updatedUser) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/transactions", authMiddleware, async (req, res, next) => {
  try {
    const transactions = await getTransactionsByUserId(req.userId);
    res.json({ transactions: transactions.map(serializeTransaction) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/transactions", authMiddleware, async (req, res, next) => {
  try {
    const { id, date, amount, category, type, note } = req.body;

    if (!date || !category || !type || !Number.isFinite(Number(amount))) {
      return res.status(400).json({ message: "Date, category, type, and amount are required" });
    }

    const transactionId = id || randomUUID();
    const now = new Date().toISOString();

    await run(
      `INSERT INTO transactions (
        id,
        user_id,
        date,
        amount,
        category,
        type,
        note,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionId,
        req.userId,
        date,
        Number(amount),
        category.trim(),
        type,
        note?.trim() || "",
        now,
        now,
      ]
    );

    res.status(201).json({
      transaction: {
        id: transactionId,
        date,
        amount: Number(amount),
        category: category.trim(),
        type,
        note: note?.trim() || "",
      },
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/transactions/:transactionId", authMiddleware, async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { date, amount, category, type, note } = req.body;

    if (!date || !category || !type || !Number.isFinite(Number(amount))) {
      return res.status(400).json({ message: "Date, category, type, and amount are required" });
    }

    const existingTransaction = await get(
      "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
      [transactionId, req.userId]
    );

    if (!existingTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const now = new Date().toISOString();

    await run(
      `UPDATE transactions
       SET date = ?, amount = ?, category = ?, type = ?, note = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [
        date,
        Number(amount),
        category.trim(),
        type,
        note?.trim() || "",
        now,
        transactionId,
        req.userId,
      ]
    );

    res.json({
      transaction: {
        id: transactionId,
        date,
        amount: Number(amount),
        category: category.trim(),
        type,
        note: note?.trim() || "",
      },
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/transactions/:transactionId", authMiddleware, async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const deletionResult = await run(
      "DELETE FROM transactions WHERE id = ? AND user_id = ?",
      [transactionId, req.userId]
    );

    if (deletionResult.changes === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

if (existsSync(distIndexFile)) {
  app.use(express.static(distDirectory));

  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(distIndexFile);
  });
}

let initializationPromise;

export const initializeApp = async () => {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await initDatabase();
      await seedDemoAccount();
    })();
  }

  await initializationPromise;
};

export { app };

const startServer = async () => {
  await initDatabase();
  await seedDemoAccount();

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
};

if (isDirectRun) {
  startServer().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
}

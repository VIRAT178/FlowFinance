/* eslint-env node */
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  createTransaction,
  createUser,
  deleteTransactionById,
  findTransactionById,
  findTransactionsByUserId,
  findUserByEmail,
  findUserById,
  initDatabase,
  updateTransactionById,
  updateUserById,
} from "./db.js";
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
  id: row._id.toHexString(),
  email: row.email,
  profile: {
    fullName: row.fullName,
    displayName: row.displayName,
    occupation: row.occupation,
    monthlyGoal: Number(row.monthlyGoal),
    currency: row.currency,
    bio: row.bio,
  },
  createdAt: row.createdAt,
});

const serializeTransaction = (row) => ({
  id: row.id,
  date: row.date,
  amount: Number(row.amount),
  category: row.category,
  type: row.type,
  note: row.note,
});

const respondWithSession = async (userRow) => {
  const userId = userRow._id.toHexString();
  const transactions = await findTransactionsByUserId(userId);
  return {
    token: signToken(userId),
    user: serializeUser(userRow),
    transactions: transactions.map(serializeTransaction),
  };
};

const seedDemoAccount = async () => {
  const existingDemo = await findUserByEmail(DEMO_EMAIL);

  let demoUserId = existingDemo?._id?.toHexString();

  if (!existingDemo) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const now = new Date().toISOString();

    const insertedUser = await createUser({
      fullName: "Demo User",
      email: DEMO_EMAIL,
      passwordHash,
      displayName: "Demo User",
      occupation: "Independent professional",
      monthlyGoal: 50000,
      currency: "INR",
      bio: "Track income, expenses, and the habits that shape your finances.",
      createdAt: now,
      updatedAt: now,
    });

    demoUserId = insertedUser._id.toHexString();
  }

  const demoTransactions = await findTransactionsByUserId(demoUserId);

  if (demoTransactions.length === 0) {
    const now = new Date().toISOString();

    for (const transaction of seedTransactions) {
      await createTransaction({
        id: `demo-${transaction.id}`,
        userId: demoUserId,
        date: transaction.date,
        amount: transaction.amount,
        category: transaction.category,
        type: transaction.type,
        note: "",
        createdAt: now,
        updatedAt: now,
      });
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
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const user = await createUser({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      displayName: fullName.trim(),
      occupation: "Independent professional",
      monthlyGoal: 50000,
      currency: "INR",
      bio: "Track income, expenses, and the habits that shape your finances.",
      createdAt: now,
      updatedAt: now,
    });
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
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

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
    const user = await findUserById(req.userId);

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
    const user = await findUserById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date().toISOString();

    const updatedUser = await updateUserById(req.userId, {
      fullName: fullName?.trim() || user.fullName,
      displayName: displayName?.trim() || user.displayName,
      occupation: occupation?.trim() || user.occupation,
      monthlyGoal: Number.isFinite(Number(monthlyGoal)) ? Number(monthlyGoal) : user.monthlyGoal,
      currency: currency || user.currency,
      bio: bio?.trim() || user.bio,
      updatedAt: now,
    });
    res.json({ user: serializeUser(updatedUser) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/transactions", authMiddleware, async (req, res, next) => {
  try {
    const transactions = await findTransactionsByUserId(req.userId);
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

    await createTransaction({
      id: transactionId,
      userId: req.userId,
      date,
      amount: Number(amount),
      category: category.trim(),
      type,
      note: note?.trim() || "",
      createdAt: now,
      updatedAt: now,
    });

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

    const existingTransaction = await findTransactionById(req.userId, transactionId);

    if (!existingTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const now = new Date().toISOString();

    await updateTransactionById(req.userId, transactionId, {
      date,
      amount: Number(amount),
      category: category.trim(),
      type,
      note: note?.trim() || "",
      updatedAt: now,
    });

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
    const isDeleted = await deleteTransactionById(req.userId, transactionId);

    if (!isDeleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, next) => {
  void next;
  console.error(error);

  if (error?.code === 11000) {
    return res.status(409).json({ message: "A record with this value already exists" });
  }

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

/* eslint-env node */
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/flow-finance";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "flow-finance";

let cachedClient;
let cachedDatabase;

const ensureConnection = async () => {
  if (cachedDatabase) {
    return cachedDatabase;
  }

  if (!globalThis.__flowFinanceMongoClient) {
    globalThis.__flowFinanceMongoClient = new MongoClient(MONGODB_URI);
    globalThis.__flowFinanceMongoClientPromise = globalThis.__flowFinanceMongoClient.connect();
  }

  cachedClient = await globalThis.__flowFinanceMongoClientPromise;
  cachedDatabase = cachedClient.db(MONGODB_DB_NAME);
  return cachedDatabase;
};

export const initDatabase = async () => {
  const db = await ensureConnection();

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("transactions").createIndex({ userId: 1, id: 1 }, { unique: true });
  await db.collection("transactions").createIndex({ userId: 1, date: -1, createdAt: -1 });
};

export const findUserByEmail = async (email) => {
  const db = await ensureConnection();
  return db.collection("users").findOne({ email });
};

export const findUserById = async (userId) => {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  const db = await ensureConnection();
  return db.collection("users").findOne({ _id: new ObjectId(userId) });
};

export const createUser = async (user) => {
  const db = await ensureConnection();
  const result = await db.collection("users").insertOne(user);
  return findUserById(result.insertedId.toHexString());
};

export const updateUserById = async (userId, profileUpdate) => {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  const db = await ensureConnection();
  await db
    .collection("users")
    .updateOne({ _id: new ObjectId(userId) }, { $set: profileUpdate });

  return findUserById(userId);
};

export const findTransactionsByUserId = async (userId) => {
  const db = await ensureConnection();
  return db
    .collection("transactions")
    .find({ userId })
    .sort({ date: -1, createdAt: -1 })
    .toArray();
};

export const createTransaction = async (transaction) => {
  const db = await ensureConnection();
  await db.collection("transactions").insertOne(transaction);
  return transaction;
};

export const findTransactionById = async (userId, transactionId) => {
  const db = await ensureConnection();
  return db.collection("transactions").findOne({ userId, id: transactionId });
};

export const updateTransactionById = async (userId, transactionId, update) => {
  const db = await ensureConnection();
  await db
    .collection("transactions")
    .updateOne({ userId, id: transactionId }, { $set: update });

  return findTransactionById(userId, transactionId);
};

export const deleteTransactionById = async (userId, transactionId) => {
  const db = await ensureConnection();
  const result = await db.collection("transactions").deleteOne({ userId, id: transactionId });
  return result.deletedCount > 0;
};

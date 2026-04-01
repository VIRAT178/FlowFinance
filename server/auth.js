/* eslint-env node */
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "flow-finance-dev-secret";

export const signToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

export const authMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers.authorization || "";

  if (!authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing authorization token" });
  }

  const token = authorizationHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

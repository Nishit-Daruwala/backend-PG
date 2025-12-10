import bcrypt from "bcryptjs";
import { db } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // insert WITHOUT breaking if role column doesn't exist
    const insertQuery = role
      ? "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
      : "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    const params = role
      ? [name, email, hashedPassword, role]
      : [name, email, hashedPassword];

    const [result] = await db.query(insertQuery, params);

    const user = { id: result.insertId, name, email, role: role || "student" };
    const token = generateToken(user);

    return res.status(201).json({ success: true, user, token });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & Password required" });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.json({ success: true, user, token });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};

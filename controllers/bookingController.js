import { db } from "../config/db.js";

// Create booking (student)
export const createBooking = async (req, res) => {
  try {
    const { room_type, stay_duration_months, start_date, notes } = req.body;
    if (!room_type || !stay_duration_months || !start_date) {
      return res
        .status(400)
        .json({ message: "room_type, stay_duration_months, start_date required" });
    }

    const [result] = await db.query(
      "INSERT INTO bookings (user_id, room_type, stay_duration_months, start_date, notes) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, room_type, stay_duration_months, start_date, notes || null]
    );

    const [rows] = await db.query("SELECT * FROM bookings WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ message: "Server error while creating booking" });
  }
};

// Get all bookings for current user with search & filter
export const getBookings = async (req, res) => {
  try {
    const { search, status, room_type } = req.query;
    let sql = "SELECT * FROM bookings WHERE user_id = ?";
    const params = [req.user.id];

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (room_type) {
      sql += " AND room_type = ?";
      params.push(room_type);
    }
    if (search) {
      sql += " AND (notes LIKE ?)";
      params.push(`%${search}%`);
    }
    sql += " ORDER BY created_at DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ message: "Server error while fetching bookings" });
  }
};

// Get single booking by id (must belong to user)
export const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const [rows] = await db.query(
      "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
      [bookingId, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Get booking by id error:", err);
    res.status(500).json({ message: "Server error while fetching booking" });
  }
};

// Update booking (only if pending)
export const updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { room_type, stay_duration_months, start_date, status, notes } = req.body;

    const [existing] = await db.query(
      "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
      [bookingId, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (existing[0].status !== "pending") {
      return res.status(400).json({ message: "Only pending bookings can be updated" });
    }

    await db.query(
      "UPDATE bookings SET room_type = ?, stay_duration_months = ?, start_date = ?, status = ?, notes = ? WHERE id = ?",
      [
        room_type || existing[0].room_type,
        stay_duration_months || existing[0].stay_duration_months,
        start_date || existing[0].start_date,
        status || existing[0].status,
        notes ?? existing[0].notes,
        bookingId
      ]
    );

    const [rows] = await db.query(
      "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
      [bookingId, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Update booking error:", err);
    res.status(500).json({ message: "Server error while updating booking" });
  }
};

// Delete booking (only if pending)
export const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const [existing] = await db.query(
      "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
      [bookingId, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (existing[0].status !== "pending") {
      return res.status(400).json({ message: "Only pending bookings can be deleted" });
    }

    await db.query("DELETE FROM bookings WHERE id = ?", [bookingId]);
    res.json({ message: "Booking deleted" });
  } catch (err) {
    console.error("Delete booking error:", err);
    res.status(500).json({ message: "Server error while deleting booking" });
  }
};

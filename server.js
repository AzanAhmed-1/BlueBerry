import express from "express";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, randomUUID } from "node:crypto";
import pg from "pg";
import { Server } from "socket.io";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false }
});

app.use(express.json({ limit: "40kb" }));
app.use(express.static(path.join(__dirname, "public")));

await pool.query(`
  CREATE TABLE IF NOT EXISTS letters (
    room_id TEXT PRIMARY KEY,
    body TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

function validRoomId(value) {
  return typeof value === "string" && /^[a-f0-9-]{36}$/.test(value);
}

app.post("/api/rooms", async (_req, res) => {
  try {
    const roomId = randomUUID();
    await pool.query("INSERT INTO letters (room_id, body) VALUES ($1, '')", [roomId]);
    res.status(201).json({ roomId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create a letter room." });
  }
});

app.get("/api/letters/:roomId", async (req, res) => {
  if (!validRoomId(req.params.roomId)) return res.status(400).json({ error: "Invalid room link." });
  try {
    const result = await pool.query(
      "SELECT body, updated_at FROM letters WHERE room_id = $1",
      [req.params.roomId]
    );
    if (!result.rowCount) return res.status(404).json({ error: "This letter room does not exist." });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load the letter." });
  }
});

app.put("/api/letters/:roomId", async (req, res) => {
  if (!validRoomId(req.params.roomId)) return res.status(400).json({ error: "Invalid room link." });
  if (typeof req.body.body !== "string" || req.body.body.length > 20000) {
    return res.status(400).json({ error: "Letter must be text and no longer than 20,000 characters." });
  }
  try {
    const result = await pool.query(
      "UPDATE letters SET body = $2, updated_at = NOW() WHERE room_id = $1 RETURNING body, updated_at",
      [req.params.roomId, req.body.body]
    );
    if (!result.rowCount) return res.status(404).json({ error: "This letter room does not exist." });
    io.to(req.params.roomId).emit("letter:updated", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not save the letter." });
  }
});

io.on("connection", (socket) => {
  socket.on("room:join", async (roomId) => {
    if (!validRoomId(roomId)) return;
    const exists = await pool.query("SELECT 1 FROM letters WHERE room_id = $1", [roomId]);
    if (exists.rowCount) socket.join(roomId);
  });
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

server.listen(PORT, () => console.log(`BlueBerry Letters running on port ${PORT}`));

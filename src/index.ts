// #region ::: IMPORT :::
import express, { Request, Response } from "express";
import { createClient } from "@vercel/postgres";
import { config } from "dotenv";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import cors from "cors";

// #endregion

// #region ::: CONFIGURATION :::
config();

const app = express();
const server = createServer(app);
const io = new Server(server);

const client = createClient({ connectionString: process.env.DATABASE_URL });

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// #endregion

io.on("connection", (socket) => {
  console.log("A user connected");
});

io.on("disconnect", (socket) => {
  console.log("A user disconnected");
});

client.connect();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/api/messages", (req: Request, res: Response) => {
  client.query("SELECT * FROM messages", (error, response) => {
    if (error) res.status(500).json({ error });
    else res.status(200).json(response.rows);
  });
});

app.post("/api/messages", (req: Request, res: Response) => {
  const { content } = req.body;
  client.query(
    `INSERT INTO messages (content) VALUES ($1)`,
    [content],
    (error) => {
      if (error) res.status(500).json({ error });
      else res.status(200).json({ message: "Message created successfully" });
    }
  );
});

server.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});

app.listen(8080, () => {
  console.log(`Server running on http://localhost:8080`);
});

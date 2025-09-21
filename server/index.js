import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";
import voiceChannelRoutes from "./routes/VoiceChannelRoutes.js";
import aiChatRoutes from "./routes/AIChatRoutes.js";
import postRoutes from "./routes/PostRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

// ✅ CORS setup - Allow both localhost and network IP for testing
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://10.79.217.176:5173", // Your network IP for iPad testing
      process.env.ORIGIN
    ].filter(Boolean), // Remove any undefined values
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use("/uploads/profiles",express.static("uploads/profiles"));
app.use("/uploads/files",express.static("uploads/files"));

// ✅ Middleware
app.use(cookieParser());
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts",contactsRoutes);
app.use("/api/messages",messagesRoutes);
app.use("/api/channel",channelRoutes);
app.use("/api/voice",voiceChannelRoutes);
app.use("/api",aiChatRoutes);
app.use("/api",postRoutes);

// ✅ Start server
const server = app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});


setupSocket(server);

// ✅ DB connection
mongoose
  .connect(databaseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ DB Connection Successful"))
  .catch((err) => {
    console.error("❌ DB Connection Error:", err.message);
  });

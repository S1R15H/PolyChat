import express from 'express';
import "dotenv/config";
import cookieParser from 'cookie-parser';
import cors from "cors";
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import aiRoutes from "./routes/ai.route.js";
import { connectDB } from "./lib/db.js";
import { seedAI } from "./lib/seed_ai.js";

const app = express();
const PORT = process.env.PORT;

const __dirname = path.resolve();

app.use(helmet()); // Security Headers

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, // allow session cookies from browser to pass through
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // limit each IP to 100 requests per 15 minutes
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use("/api", limiter); // Apply to all API routes

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB().then(() => {
        seedAI();
    });
})
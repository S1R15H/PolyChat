import express from "express";
import { chat, wakeUp } from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected so only logged-in users can trigger the bot
router.post("/chat", protectRoute, chat);
router.post("/wake", protectRoute, wakeUp);

export default router;

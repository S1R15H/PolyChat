import User from "../models/User.js";
import { upsertStreamUser } from "./stream.js";

// Hardcoded ID for the AI Tutor so we can reliably find it in the frontend
export const AI_TUTOR_ID = "64b6e5b8e9b0e2b9c8b7f3a1";

export const seedAI = async () => {
    try {
        const aiUser = {
            _id: AI_TUTOR_ID,
            email: "ai-tutor@chatapp.com",
            fullName: "AI-Tutor",
            password: "secure-ai-password-placeholder", // Not valid for login, which is fine
            profilePic: "https://robohash.org/ai-tutor.png?set=set4",
            nativeLanguage: "English",
            learningLanguage: "All",
            role: "ai-tutor",
        };

        // 1. Check if AI user exists in Mongo
        const existingUser = await User.findById(AI_TUTOR_ID);

        if (!existingUser) {
            console.log("Seeding AI-Tutor into MongoDB...");
            // We use create/save to ensure schema validation (if strict) but simple create is usually fine
            // We might need to bypass some auth checks or just insert it directly
            // User model likely hashes password in pre-save, so we let that happen
            await User.create(aiUser);
        } else {
            console.log("AI-Tutor already exists in MongoDB.");
        }

        // 2. Ensure AI user exists in Stream
        // We explicitly map the mongo fields to what Stream expects if needed, 
        // but upsertStreamUser likely handles standard User object
        console.log("Seeding AI-Tutor into Stream Chat...");
        await upsertStreamUser({
            id: AI_TUTOR_ID,
            name: aiUser.fullName,
            image: aiUser.profilePic,
        });

        console.log("AI-Tutor seeding complete.");

    } catch (error) {
        console.error("Error seeding AI-Tutor:", error);
    }
};

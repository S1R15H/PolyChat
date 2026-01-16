import { streamClient } from "../lib/stream.js";
import axios from 'axios';
import { AI_TUTOR_ID } from "../lib/seed_ai.js";

// AI Service Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8080';
const AI_SERVICE_KEY = process.env.AI_SERVICE_KEY || 'my-secret-key';

// In production, we MUST fail if using default keys or missing config
if (process.env.NODE_ENV === 'production') {
    if (!process.env.AI_SERVICE_KEY || process.env.AI_SERVICE_KEY === 'my-secret-key') {
        throw new Error("FATAL: AI_SERVICE_KEY is missing or weak in PRODUCTION environment.");
    }
}

export const chat = async (req, res) => {
    const { channelId, message, targetLanguage = 'Spanish' } = req.body;

    if (!channelId || !message) {
        return res.status(400).json({ message: "Channel ID and message are required" });
    }

    try {
        console.log(`[AI-Chat] Received: "${message}" for lang: ${targetLanguage}`);

        // 1. Construct System Prompt
        const systemPrompt = `You are a helpful and patient ${targetLanguage} language tutor. 
        Your goal is to help the user learn ${targetLanguage}.
        - If they speak in ${targetLanguage}, correct their grammar if needed and reply in ${targetLanguage}.
        - If they speak in English, answer their question or translate for them, but encourage them to use ${targetLanguage}.
        - Keep your replies concise and friendly.
        - You are chatting in a messaging app, so be informal but educational.
        
        SAFETY GUIDELINES:
        - Do NOT generate any harmful, explicit, offensive, or sexually suggestive content.
        - Do NOT swear or use profanity.
        - If the user asks for inappropriate content, politely refuse and steer the conversation back to language learning.`;

        const channel = streamClient.channel("messaging", channelId);

        // Start heartbeat to keep typing indicator alive
        // Stream typing indicators timeout after a few seconds, so we need to refresh it
        const typingInterval = setInterval(async () => {
            try {
                await channel.sendEvent({
                    type: 'typing.start',
                    user: { id: AI_TUTOR_ID }
                });
            } catch (err) {
                console.error("Failed to send typing heartbeat", err);
            }
        }, 3000); // Pulse every 3 seconds

        // Send initial typing event immediately
        await channel.sendEvent({
            type: 'typing.start',
            user: { id: AI_TUTOR_ID }
        });

        // 2. Call AI Service (Proxy)
        let responseContent = "";
        try {
            const response = await axios.post(`${AI_SERVICE_URL}/api/chat`, {
                model: 'llama3.2',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                stream: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': AI_SERVICE_KEY
                }
            });

            responseContent = response.data.message.content;

        } catch (apiError) {
            console.error("AI Proxy Error:", apiError.response ? apiError.response.data : apiError.message);
            throw apiError;
        } finally {
            // Stop the heartbeat no matter what happens
            clearInterval(typingInterval);
        }

        // 3. Send reply to Stream Channel as AI User
        await channel.sendMessage({
            text: responseContent,
            user: { id: AI_TUTOR_ID, name: "AI-Tutor", image: "https://robohash.org/ai-tutor.png?set=set4", role: "ai-tutor" },
        });

        // Explicitly stop typing
        await channel.sendEvent({
            type: 'typing.stop',
            user: { id: AI_TUTOR_ID }
        });

        res.status(200).json({ success: true, reply: responseContent });

    } catch (error) {
        console.error("AI Service Error:", error.message);

        // Fallback message to user if AI is down
        try {
            const channel = streamClient.channel("messaging", channelId);
            await channel.sendMessage({
                text: "😴 I'm currently sleeping (AI Service Unavailable or Unauthorized).",
                user: { id: AI_TUTOR_ID },
            });
        } catch (innerError) {
            console.error("Failed to send fallback message:", innerError);
        }

        res.status(500).json({ message: "AI Tutor is currently sleeping." });
    }
};

export const wakeUp = async (req, res) => {
    const { channelId } = req.body;

    if (!channelId) {
        return res.status(400).json({ message: "Channel ID required" });
    }

    try {
        const channel = streamClient.channel("messaging", channelId);

        // 1. Check if we already greeted (optional, but frontend check is better)
        // For cold start, we just send the instruction.

        await channel.sendMessage({
            text: "👋 Hi! I'm your AI Language Tutor.\n\nI can help you practice 8 different languages. Just select a language from the dropdown above and say 'Hello' to start!\n\n(I might take a few seconds to wake up initially 😴)",
            user: { id: AI_TUTOR_ID, name: "AI-Tutor", image: "https://robohash.org/ai-tutor.png?set=set4", role: "ai-tutor" },
        });

        // 2. Cold Start: Ping one request to Ollama to load model into memory
        // We don't wait for this to finish responding to the HTTP request
        axios.post(`${AI_SERVICE_URL}/api/chat`, {
            model: 'llama3.2',
            messages: [{ role: 'user', content: 'warmup' }],
            stream: false
        }, {
            headers: { 'x-api-key': AI_SERVICE_KEY }
        }).then(() => {
            console.log("AI Model Warmed Up");
        }).catch((err) => {
            console.error("Warmup failed (AI might be offline):", err.message);
        });

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error in wakeAndGreet:", error);
        res.status(500).json({ message: "Internal Error" });
    }
};

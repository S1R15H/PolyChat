import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.AI_SERVICE_KEY;

if (!API_KEY) {
    console.error("FATAL: AI_SERVICE_KEY environment variable is not set.");
    process.exit(1);
}

// Auth Middleware
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['x-api-key'];

    if (!authHeader || authHeader !== API_KEY) {
        console.log(`[Proxy] Blocked unauthorized request from ${req.ip}`);
        return res.status(401).json({ error: "Unauthorized: Invalid or missing API Key" });
    }

    next();
};

app.use(authMiddleware);

// Proxy to Ollama (running locally in the same container)
app.use('/', createProxyMiddleware({
    target: 'http://127.0.0.1:11434',
    changeOrigin: true,
    onError: (err, req, res) => {
        console.error("Proxy Error:", err);
        res.status(500).json({ error: "Proxy Error: Could not reach Ollama" });
    }
}));

app.listen(PORT, () => {
    console.log(`🔒 AI Security Proxy running on port ${PORT}`);
    console.log(`👉 Forwarding authenticated requests to Ollama`);
});

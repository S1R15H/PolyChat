# Render Deployment Guide

This guide explains how to deploy the full-stack ChatApp (Frontend + Backend) to Render.com as a single Web Service.

## 1. Preparation

Ensure your root `package.json` has the correct scripts (already verified):
*   **Build**: `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
*   **Start**: `npm run start --prefix backend`

## 2. Create Web Service on Render

1.  Login to **[Render Dashboard](https://dashboard.render.com/)**.
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository (`ChatApp`).

## 3. Configure Service Settings

*   **Name**: `polychat-app` (or your choice)
*   **Region**: Choose one close to your users (and your MongoDB/EC2).
*   **Branch**: `main`
*   **Root Directory**: *(Leave blank)*
*   **Runtime**: `Node`
*   **Build Command**: `npm run build`
*   **Start Command**: `npm run start`

## 4. Environment Variables

Click **Advanced** or scroll to **Environment Variables** and add the following keys.

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | **Critical** for enabling static file serving in `server.js`. |
| `MONGO_URI` | `mongodb+srv://...` | Your production MongoDB connection string. |
| `JWT_SECRET_KEY` | `...` | A strong, random string for securing sessions. |
| `PORT` | `5001` | (Optional) Render sets this automatically, but safe to add. |
| `STREAM_API_KEY` | `...` | Your Stream.io API Key. |
| `STREAM_API_SECRET` | `...` | Your Stream.io API Secret. |
| `TURNSTILE_SECRET_KEY`| `...` | Your Cloudflare Turnstile Secret Key. |
| `RESEND_API_KEY` | `...` | Your Resend API Key for emails. |
| `AI_SERVICE_URL` | `http://<YOUR_EC2_IP>:11434` | The URL of your EC2 Llama instance. |
| `AI_SERVICE_KEY` | `...` | (If you added authentication to Nginx on EC2). |

## 5. Build & Deploy

1.  Click **Create Web Service**.
2.  Render will clone your repo, install dependencies (for both folders), and build the frontend.
3.  The build logs should show:
    *   Backend dependencies installing...
    *   Frontend dependencies installing...
    *   `vite build` outputting to `dist/`...
4.  Once deployed, your app will be live at `https://polychat-app.onrender.com`.

## 6. Access & Verification

*   Visit the URL.
*   **Check Console**: Ensure no CSP errors are blocking scripts.
*   **Test Login**: Verify Turnstile loads (you might need to add the Render domain to Cloudflare Turnstile settings).
*   **Test AI Chat**: Send a message to the bot. If it fails, check if the EC2 instance allows traffic from Render's IP (or 0.0.0.0/0).

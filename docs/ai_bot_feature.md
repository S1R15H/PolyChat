# AI Tutor Bot Feature

The AI Tutor Bot is a core feature of PolyChat that allows users to practice languages with an AI-powered assistant.

## Overview

The bot acts as a specialized user (`AI-Tutor`) within the chat system. It intercepts messages sent to it, processes them via an external AI Service (hosting Llama 3.2), and replies in the target language.

## Architecture

### 1. Components
*   **Frontend**: React + Stream Chat SDK. Handles user input and triggers backend endpoints.
*   **Backend**: Node.js + Express. Acts as the orchestrator.
*   **AI Service**: An external service (e.g., Ollama or a custom Python wrapper) running `llama3.2`.
*   **Stream Chat**: Handles the real-time message delivery and typing indicators.

### 2. Workflow

1.  **Wake Up**: When a user opens the AI Chat, the frontend calls `POST /api/ai/wake`.
    *   The backend sends a greeting message to the chat channel.
    *   It sends a "warmup" request to the AI Service to load the model into memory.
2.  **Chat Interaction**: When the user sends a message:
    *   The frontend calls `POST /api/ai/chat`.
    *   The backend validates the request and starts a "typing" indicator event on the Stream Grid.
    *   It constructs a **System Prompt** dynamically based on the user's selected `targetLanguage`.
    *   It forwards the conversation to the external AI Service.
    *   Upon receiving a response, it posts the reply to the Stream Chat channel as the `AI-Tutor` user.

## System Prompt Strategy

The bot is instructed to behave as a helpful language tutor. Example system prompt structure:

> "You are a helpful and patient [Target Language] language tutor. Your goal is to help the user learn [Target Language]. If they speak in [Target Language], correct their grammar if needed and reply in [Target Language]. If they speak in English, answer their question or translate for them, but encourage them to use [Target Language]."

## Safety & Alignment

To ensure a safe and positive experience, the system prompt includes strict safety guardrails:
*   **Explicit Prohibition**: The AI is explicitly instructed NOT to generate harmful, offensive, sexual, or profane content.
*   **Refusal Strategy**: If a user attempts to jailbreak or ask for inappropriate content, the AI is instructed to politely refuse and redirect back to language learning.
*   **Model Choice**: Llama 3.2 (Instruct) has built-in safety alignment training which further reduces the risk of unwanted outputs.

## Configuration

Required Environment Variables in `.env`:

*   `AI_SERVICE_URL`: URL of the external AI provider (e.g., `http://127.0.0.1:8080`).
*   `AI_SERVICE_KEY`: API Key for securing the AI Proxy.

## Code Structure

*   **`backend/src/controllers/ai.controller.js`**: Contains the logic for `chat` and `wakeUp`.
*   **`backend/src/routes/ai.route.js`**: API route definitions protected by authentication.
*   **`backend/src/lib/seed_ai.js`**: Ensures the `AI-Tutor` user exists in both MongoDB and Stream Chat on server start.

## Troubleshooting

*   **Bot doesn't reply**: Check if the `AI_SERVICE_URL` is reachable from the backend server.
*   **"I'm currently sleeping"**: This fallback message appears if the AI Service returns an error (500) or times out.

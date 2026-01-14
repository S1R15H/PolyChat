#!/bin/bash

# Start Ollama in background
ollama serve &

# Wait for Ollama to be ready (optional check, or just wait a bit)
sleep 5

# Start Proxy
echo "Starting AI Proxy..."
cd /app
node proxy.js

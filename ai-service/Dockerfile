FROM ollama/ollama:latest

# Set the host to listen on all interfaces
ENV OLLAMA_HOST=0.0.0.0

# Start Ollama in the background to pull the model during the build process
# This prevents the container from needing to download 4GB+ every time it starts
RUN nohup bash -c "ollama serve &" && sleep 5 && ollama pull llama3.2


# Install Node.js for the Auth Proxy
RUN apt-get update && apt-get install -y nodejs npm

# Setup Proxy
WORKDIR /app
COPY package.json proxy.js ./
RUN npm install

# Revert to root to run ollama (optional, but good practice if Workdir changed)
WORKDIR /

# Start Ollama in background, then start Proxy
# We use a script to ensure both run
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose Proxy Port (8080) instead of Ollama (11434)
EXPOSE 8080

ENTRYPOINT ["/start.sh"]

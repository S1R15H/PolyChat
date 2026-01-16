# EC2 Setup Guide for Llama 3.2 (Ollama)

This guide will help you set up an AWS EC2 instance to host your Llama 3.2 model using Ollama, which your ChatApp will connect to.

## 1. Launch EC2 Instance

1.  **Login to AWS Console** and go to **EC2**.
2.  Click **Launch Instance**.
3.  **Name**: `PolyChat-AI-Service`
4.  **OS Image (AMI)**:
    *   **For CPU (`t3.xlarge`)**: `Ubuntu Server 24.04 LTS (HVM)`
    *   **For GPU (`g4dn.xlarge`)**: Search for **"Deep Learning OSS Nvidia Driver AMI GPU PyTorch"**.
        *   *Why?* This comes with NVIDIA drivers, CUDA, and Docker pre-installed, saving you hours of setup time.
5.  **Instance Type**:
    *   **Recommended (Cheap & Good for Llama 3.2 3B)**: `t3.xlarge` (4 vCPUs, 16GB RAM) - CPU inference is fast enough for 3B/1B models.
    *   **High Performance**: `g4dn.xlarge` (GPU accelerated). *Note: Requires submitting a quota increase request to AWS.*
6.  **Key Pair**: Create a new key pair (e.g., `polychat-key`) and download the `.pem` file.
7.  **Network Settings (Security Group)**:
    *   Allow **SSH** (Port 22) from `My IP`.
    *   Allow **Custom TCP** (Port 11434) from `Anywhere` (0.0.0.0/0) *OR* strictly from your Backend Server's IP (Recommended for production).
8.  **Storage**:
    *   **For Standard Ubuntu**: 25-30 GB is enough (OS takes ~8GB, Llama 3.2 model takes ~3GB).
    *   **For Deep Learning AMI**: **60 GB+ recommended** (The AMI itself is huge because it contains CUDA, Docker, PyTorch, etc.).
9.  Click **Launch Instance**.

## 2. Connect to Instance

Open your terminal where the `.pem` file is:

```bash
chmod 400 polychat-key.pem
ssh -i "polychat-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

## 3. Install Ollama and Llama 3.2

Run these commands on the EC2 instance:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Ollama (Official Script)
curl -fsSL https://ollama.com/install.sh | sh

# 3. Pull the Llama 3.2 model (3B parameter version)
ollama pull llama3.2
```

## 4. Expose Ollama to the Internet

By default, Ollama only listens on localhost. We need to expose it to receive requests from your ChatApp backend.

1.  **Edit the systemd service:**
    ```bash
    sudo systemctl edit ollama.service
    ```
2.  **Add Environment Variable:**
    In the editor that opens, add these lines under `[Service]`:
    ```ini
    [Service]
    Environment="OLLAMA_HOST=0.0.0.0"
    Environment="OLLAMA_ORIGINS=*"
    ```
3.  **Save and Exit** (Ctrl+O, Enter, Ctrl+X).
4.  **Restart Ollama:**
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl restart ollama
    ```

## 5. Verify It Works

From your **local computer** (not the EC2), try to curl the EC2 instance:

```bash
curl http://<YOUR-EC2-PUBLIC-IP>:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Why is the sky blue?",
  "stream": false
}'
```
If you get a JSON response, it works!

## 6. Connect ChatApp Backend

1.  Open `backend/.env` in your project.
2.  Update the AI Config:
    ```env
    AI_SERVICE_URL=http://<YOUR-EC2-PUBLIC-IP>:11434
    AI_SERVICE_KEY=none
    ```
    *(Ollama standard mode doesn't use keys, but our controller supports passing custom keys if you add a proxy like Nginx later. For now, it's open).*

## 7. (Optional but Recommended) Secure It

Right now, anyone with your IP can use your AI. To secure it:
1.  **AWS Security Group**: Edit the inbound rule for Port 11434 to only allow the IP address of your `Render` backend (or wherever you deploy).
2.  **Nginx Proxy**: Set up Nginx on the EC2 to verify the `x-api-key` header before passing requests to Ollama.

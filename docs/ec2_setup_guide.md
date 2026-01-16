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

## 7. Secure It (Critical for Production)

Since Render uses dynamic IPs, you cannot easilywhitelist them in AWS Security Groups. The best way to secure your AI is using **Nginx** as a reverse proxy with an API Key.

### A. Install Nginx
On your EC2 instance:
```bash
sudo apt install nginx apache2-utils -y
```

### B. Configure Nginx
Create a new config file:
```bash
sudo nano /etc/nginx/sites-available/ollama
```

Paste the following configuration (Replace `your-secret-key-here` with a strong password):

```nginx
server {
    listen 80;
    server_name _;

    location / {
        # 1. Check for API Key Header
        if ($http_x_api_key != "your-secret-key-here") {
            return 401; # Unauthorized
        }

        # 2. Proxy to Ollama (running locally)
        proxy_pass http://localhost:11434;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
*Note: In a real production setup, you should also set up SSL (HTTPS) using Certbot, but for backend-to-backend communication over a secure channel, this is a good start.*

### C. Enable Site & Restart
```bash
# Disable default site
sudo unlink /etc/nginx/sites-enabled/default

# Enable our new site
sudo ln -s /etc/nginx/sites-available/ollama /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### D. Update Firewall (UFW) & AWS
Now that Nginx (Port 80) is handling traffic, we should **block external access to Port 11434** so no one bypasses the check.

1.  **On EC2 (UFW)**:
    ```bash
    sudo ufw allow 22/tcp  # Allow SSH
    sudo ufw allow 80/tcp  # Allow HTTP (Nginx)
    # Do NOT allow 11434 globally
    sudo ufw enable
    ```
2.  **On AWS Security Group**:
    *   **Add Rule**: Custom TCP, Port `80`, Source `0.0.0.0/0` (Anywhere).
    *   **Remove Rule**: Port `11434` (If you had it open to anywhere).

### E. Update ChatApp Backend
In your `backend/.env` (both local and on Render/Production):

```env
AI_SERVICE_URL=http://<YOUR-EC2-PUBLIC-IP>
AI_SERVICE_KEY=your-secret-key-here
```

> [!IMPORTANT]
> The value of `AI_SERVICE_KEY` in your `.env` file **MUST MATCH EXACTLY** the password you put in the Nginx config (`if ($http_x_api_key != "...")`). If they don't match, Nginx will block the request.


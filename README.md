# Full Stack Chat Application

A real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and powered by Stream Chat for messaging and video calls.

## 📺 Demo

<!-- Put a link to your deployed website here -->
**Live Site:** [https://chatapp-b2cp.onrender.com]

<!-- Put a link to your video recording here -->
**Video Demo:** [Insert Video Link Here]


## ✨ Features

- **Authentication**: securely handle user signup, login, and logout using JWT and HTTP-Only cookies.
- **Real-time Messaging**: Instant messaging supported by Stream Chat technology.
- **Video Calls**: Integrated video calling functionality.
- **Friend System**: Send and receive friend requests.
- **Theming**: Multiple color themes configurable by the user (powered by DaisyUI).
- **Profile Management**: Update user profile, avatar, and settings.
- [**AI Language Tutor**](docs/ai_bot_feature.md): Practice 8 languages with an AI bot (Llama 3.2).
- **Responsive Design**: Works on desktop and mobile.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- TailwindCSS & DaisyUI
- Zustand (State Management)
- React Query (Data Fetching)
- Stream Chat React SDK

**Backend:**
- Node.js & Express
- MongoDB (Database)
- Stream Chat SDK (Backend)
- JWT (Authentication)
- Nodemailer / Resend (Email Services)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB installed locally or a MongoDB Atlas account
- A [Stream](https://getstream.io/) account for Chat API keys

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/S1R15H/ChatApp.git
   cd ChatApp
   ```

2. **Install Dependencies**
   
   Install dependencies for **both** backend and frontend:
   
   ```bash
   # Root (optional, depending on setup)
   npm install

   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up Environment Variables**

   Create a `.env` file in the **backend** directory: `backend/.env`
   
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET_KEY=your_jwt_secret_key
   NODE_ENV=development
   
   # Stream Chat Configuration
   STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   
   # Resend configuration:
   RESEND_API_KEY=your_resend_api_key

   # Client URL (for CORS and redirects)
   FRONTEND_URL=http://localhost:5173
   ```

   Create a `.env` file in the **frontend** directory: `frontend/.env`

   ```env
   VITE_STREAM_API_KEY=your_stream_api_key
   ```
   > [!NOTE]
   > `your_stream_api_key` must match in both files.

### Running the App

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on http://localhost:5001

2. **Start the Frontend Application**
   Open a new terminal configuration:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

### Running from Root (Production Mode)

You can build and run the entire application (Frontend + Backend) from the root directory. This serves the frontend static files through the Node.js backend on the same port.

1. **Update Environment**
   Ensure `NODE_ENV=production` is set in your `backend/.env` file.

2. **Build the application**
   ```bash
   npm run build
   ```
   This installs dependencies and creates the optimized frontend build.

3. **Start the server**
   ```bash
   npm start
   ```
   The full application will be available at http://localhost:5001.

## 📁 Project Structure

```
ChatApp/
├── backend/             # Node.js/Express Server
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Mongoose Schemas
│   │   ├── routes/      # API Routes
│   │   └── lib/         # Helper functions (Stream, DB)
├── frontend/            # React Application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Zustand state stores
│   │   └── lib/         # Axios & Utils
└── docs/                # Documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


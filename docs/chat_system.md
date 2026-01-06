# Chat System & Stream Integration

## Overview
The application leverages **Stream Chat** (GetStream.io) for its messaging capabilities. Instead of building a custom WebSocket server, the backend acts as a facilitator that:
1. Syncs user data from MongoDB to the Stream User database.
2. Generates authentication tokens for the frontend client to connect directly to Stream's WebSocket API.

## Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/chat/token` | Returns a Stream Chat capability token for the currently logged-in user. |

## Stream Integration Logic

### upsertStreamUser
Whenever a user is created (Signup) or updated (Onboarding), the `upsertStreamUser` helper ensures the user exists in the Stream database with the correct name and image.

Located in `backend/src/lib/stream.js`:
```javascript
export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error("Error upserting Stream user:", error);
    }
};
```

### Token Generation
To use the Stream Chat SDK on the frontend, the user needs a token signed by the backend's API Secret. This prevents unauthorized users from impersonating others on the chat network.

Located in `backend/src/controllers/chat.controller.js`:
```javascript
export async function getStreamToken(req, res) {
    try{
        // Generates token using logic from lib/stream.js
        const token = streamClient.createToken(req.user._id.toString());
        res.status(200).json({ token });
    } catch (error) {
        // ... error handling
    }
}
```

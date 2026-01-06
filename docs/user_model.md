# User Data Model

## Overview
The user data is stored in MongoDB using a **Mongoose Schema**. This model handles personal information, authentication credentials, and application-specific settings like languages and onboarding status.

## Schema Fields

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fullName` | String | Yes | The user's display name. |
| `email` | String | Yes | Unique email address for login. |
| `password` | String | Yes | bcrypt-hashed password string. |
| `bio` | String | No | Short biography/status. |
| `profilePic` | String | No | URL to the user's avatar image. |
| `nativeLanguage` | String | No | The language the user speaks fluently. |
| `learningLanguage` | String | No | The language the user is practicing. |
| `location` | String | No | User's geographical location. |
| `isOnboarded` | Boolean | No (Default: false) | Tracks if the user has completed the profile setup. |
| `resetPasswordToken`| String | No | Temporary token for password reset flow. |
| `resetPasswordExpires`| Date | No | Expiration time for the reset token. |
| `friends` | [ObjectId] | No | Array of references to other `User` documents. |
| `friendRequests` | [ObjectId] | No | Array of references to incoming `FriendRequest` documents. |

## Mongoose Hooks & Methods

### Password Hashing (`pre('save')`)
Before a user document is saved to the database, this hook checks if the password field has been modified. If so, it hashes the password using `bcryptjs`. This ensures plain-text passwords are never stored.

```javascript
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error){
        next(error);
    }
});
```

### Password Verification (matchPassword)
A helper method attached to the user schema to verify login attempts.

```javascript
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}
```

### Schema Definition
Located in `backend/src/models/User.js`.
```javascript
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    // ... other fields
}, { timestamps: true });
```

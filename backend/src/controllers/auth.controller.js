import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { upsertStreamUser } from '../lib/stream.js';
import crypto from 'node:crypto';
import { Resend } from 'resend';
import axios from 'axios';

const verifyTurnstile = async (token) => {
    const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
    if (!SECRET_KEY) return true; // Bypass if not configured (dev mode)

    try {
        const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            secret: SECRET_KEY,
            response: token,
        });
        return response.data.success;
    } catch (error) {
        console.error("Turnstile Verification Error:", error);
        return false;
    }
};

export async function signup(req, res) {
    const { email, password, fullName, captchaToken } = req.body;

    // Verify Turnstile
    if (process.env.TURNSTILE_SECRET_KEY && !(await verifyTurnstile(captchaToken))) {
        return res.status(400).json({ message: "CAPTCHA validation failed. Are you a robot?" });
    }

    try {
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar,
        })

        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });
            console.log(`Stream user upserted successfully for ${newUser.fullName}`);
        } catch (error) {
            console.log("Error creating Stream user:", error);
        }


        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '7d'
        })

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true, //prevent XSS
            sameSite: "strict", // prevent CSRF
            secure: process.env.NODE_ENV === "production"
        });

        res.status(201).json({ success: true, user: newUser });

    } catch (error) {
        console.log("Error in signup controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function login(req, res) {
    try {
        const { email, password, captchaToken } = req.body;

        // Verify Turnstile
        if (process.env.TURNSTILE_SECRET_KEY && !(await verifyTurnstile(captchaToken))) {
            return res.status(400).json({ message: "CAPTCHA validation failed. Are you a robot?" });
        } else {
            console.log("CAPTCHA validation passed");
        }

        if (!email || !password) {
            return res.status(400).json({ message: " All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email or password." });

        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '7d'
        })

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true, //prevent XSS
            sameSite: "strict", // prevent CSRF
            secure: process.env.NODE_ENV === "production"
        });

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export function logout(req, res) {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logout successful" });
}

export async function onboard(req, res) {
    try {
        const userId = req.user._id;

        const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

        if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location"
                ].filter(Boolean),
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true,
        }, { new: true })

        if (!updatedUser) return res.status(404).json({ message: "User not found" });


        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || "",
            });
            console.log(`Stream user updated successfully for ${updatedUser.fullName}`);
        } catch (streamError) {
            console.log("Error updating Stream user during onboarding:", streamError.message);
        }


        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Onboarding error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function forgotPassword(req, res) {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a secure random token
        const token = crypto.randomBytes(20).toString("hex");

        // Set token and expiration (e.g., 1 hour from now)
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const resend = new Resend(process.env.RESEND_API_KEY);

        const protocol = req.protocol; // 'http' or 'https'
        const host = req.get('host'); // e.g., 'example.com' or 'localhost:5173'
        const resetUrl = `${protocol}://${host}/reset-password/${token}`;

        const { data, error } = await resend.emails.send({
            from: 'ChatApp <do-not-reply@sirishgurung.com>',
            to: user.email,
            subject: "Password Reset Request",
            html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.<br/><br/> Please click on the following link, or paste this into your browser to complete the process:<br/><br/><span> ${resetUrl} </span> <br/><br/> If you did not request this, please ignore this email and your password will remain unchanged.<br/></p>`
        });

        if (error) {
            return res.status(400).json({ error });
        }

        res.status(200).json({ data });

    } catch (err) {
        console.log("Error in forgotPassword controller:", err);
        res.status(500).json({ message: "Internal Server error" });
    }
}

export async function resetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Find user with this token and check if it hasn't expired ($gt = greater than)
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Password reset token is invalid or has expired" });
        }

        user.password = password;
        // Clear the reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.log("Error in resetPassword controller:", err);
        res.status(500).json({ message: "Internal Server error" });
    }
}

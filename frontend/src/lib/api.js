import { axiosInstance } from "./axios.js";

export const signup = async (signupData) => {
    const response = await axiosInstance.post("/auth/signup", signupData);
    return response.data;
}

export const login = async (loginData) => {
    const response = await axiosInstance.post("/auth/login", loginData);
    return response.data;
}

export const logout = async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
}
export const forgotPassword = async (email) => {
    const response = await axiosInstance.post("/auth/forgot-password", email);
    return response.data;
}
export const resetPassword = async ({ token, password }) => {
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
    return response.data;
}

export const getAuthUser = async () => {
    try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
    } catch (error) {
        console.log("Error in getAuthUser:", error);
        return null;
    }
}

export const completeOnboarding = async (userData) => {
    const response = await axiosInstance.post("/auth/onboarding", userData);
    return response.data;
}

export async function getUserFriends() {
    const response = await axiosInstance.get("/users/friends");
    return response.data;
}
export async function getRecommendedUsers() {
    const response = await axiosInstance.get("/users");
    return response.data;
}
export async function getOutgoingFriendReqs() {
    const response = await axiosInstance.get("/users/outgoing-friend-requests");
    return response.data;
}
export async function sendFriendRequest(userId) {
    const response = await axiosInstance.post(`/users/friend-request/${userId}`);
    return response.data;
}
export async function getFriendRequests() {
    const response = await axiosInstance.get(`/users/friend-requests`);
    return response.data;
}
export async function acceptFriendRequest(requestId) {
    const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
    return response.data;
}
export async function getStreamToken() {
    const response = await axiosInstance.get("/chat/token");
    return response.data;
}
export async function getTeachers() {
    const response = await axiosInstance.get("/users/teachers");
    return response.data;
}
export async function chatWithAI(channelId, message, targetLanguage) {
    const response = await axiosInstance.post("/ai/chat", { channelId, message, targetLanguage });
    return response.data;
}

export async function wakeAI(channelId) {
    const response = await axiosInstance.post("/ai/wake", { channelId });
    return response.data;
}
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../axios/axiosInstance";
import { showToast } from "../utils/toast";
import {
    clearAuth as clearAuthStorage,
    getAuthToken as getStoredToken,
    getAuthUser as getStoredUser,
    isTokenValid,
    persistAuth,
} from "../utils/authStorage";
import { useDispatch } from "react-redux";
import { setUser } from "../global/features/userSlice";

const useAuth = () => {
    const dispatch = useDispatch();

    const sendOtp = useMutation({
        mutationFn: async (email) => {
            const response = await axiosInstance.post("/auth/send-otp", { email });
            return response.data;
        },
        onSuccess: (data) => {
            console.log("✅ OTP sent successfully:", data);
            showToast.success("OTP Sent", "Please check your email for the verification code");
        },
        onError: (error) => {
            console.error("❌ Failed to send OTP:", error.message);
            // Error toast is handled by axios interceptor
        },
    });

    const verifyOtp = useMutation({
        mutationFn: async ({ email, otp }) => {
            const response = await axiosInstance.post("/auth/verify-otp", { email, otp });

            persistAuth(response.data);
            if (response.data?.user) {
                dispatch(setUser(response.data.user));
            }

            return response.data;
        },
        onSuccess: (data) => {
            console.log("✅ OTP verified successfully:", data);
            showToast.success("Login Successful", "Welcome! You are now logged in");
        },
        onError: (error) => {
            console.error("❌ Failed to verify OTP:", error.message);
            // Error toast is handled by axios interceptor
        },
    });

    const logout = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post("/auth/logout");
            return response.data;
        },
        onSuccess: () => {
            clearAuthStorage();
            dispatch(setUser(null));
            console.log("✅ Logged out successfully");
            showToast.success("Logged Out", "You have been successfully logged out");
        },
        onError: (error) => {
            console.error("❌ Failed to logout:", error.message);
            clearAuthStorage();
            dispatch(setUser(null));
            showToast.warning("Logout Warning", "Logged out locally, but server logout failed");
        },
    });

    return {
        // Send OTP
        sendOtp: sendOtp.mutate,
        isSendingOtp: sendOtp.isPending,
        sendOtpError: sendOtp.error,
        sendOtpSuccess: sendOtp.isSuccess,

        // Verify OTP
        verifyOtp: verifyOtp.mutate,
        isVerifyingOtp: verifyOtp.isPending,
        verifyOtpError: verifyOtp.error,
        verifyOtpSuccess: verifyOtp.isSuccess,

        // Logout
        logout: logout.mutate,
        isLoggingOut: logout.isPending,
        logoutError: logout.error,
        logoutSuccess: logout.isSuccess,

        // Utility functions
        isAuthenticated: () => isTokenValid(),
        getAuthToken: () => getStoredToken(),
        getAuthUser: () => getStoredUser(),
        clearAuth: clearAuthStorage,
    };
};

export default useAuth;

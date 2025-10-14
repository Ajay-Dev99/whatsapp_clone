import { useMutation } from "@tanstack/react-query"
import axiosInstance from "../axios/axiosInstance"

const useAuth = () => {
    const sendOtp = useMutation({
        mutationFn: async (email) => {
            const { data } = await axiosInstance.post("/auth/send-otp", { email })
            return data
        },
        onSuccess: (data) => {
            console.log("OTP sent successfully:", data)
        },
        onError: (error) => {
            console.error("Failed to send OTP:", error)
        }
    })

    const verifyOtp = useMutation({
        mutationFn: async ({ email, otp }) => {
            const { data } = await axiosInstance.post("/auth/verify-otp", { email, otp })
            return data
        },
        onSuccess: (data) => {
            console.log("OTP verified successfully:", data)
        },
        onError: (error) => {
            console.error("Failed to verify OTP:", error)
        }
    })

    return {
        sendOtp: sendOtp.mutate,
        verifyOtp: verifyOtp.mutate,
        isSendingOtp: sendOtp.isPending,
        isVerifyingOtp: verifyOtp.isPending,
        sendOtpError: sendOtp.error,
        verifyOtpError: verifyOtp.error,
        sendOtpSuccess: sendOtp.isSuccess,
        verifyOtpSuccess: verifyOtp.isSuccess
    }
}

export default useAuth
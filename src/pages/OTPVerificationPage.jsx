import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { setUser } from '../global/features/userSlice'
import { useDispatch } from 'react-redux'

function OTPVerificationPage() {
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [timeLeft, setTimeLeft] = useState(60)
    const [canResend, setCanResend] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const inputRefs = useRef([])
    const { verifyOtp, sendOtp, isVerifyingOtp, isSendingOtp } = useAuth()
    const email = location.state?.email
    const dispatch = useDispatch()
    useEffect(() => {
        if (!email) {
            navigate('/login', { replace: true })
        }
    }, [email, navigate])

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            setCanResend(true)
        }
    }, [timeLeft])

    // Auto-focus next input
    const handleInputChange = (index, value) => {
        if (value.length > 1) return // Prevent multiple characters

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        setError('')

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        const newOtp = [...otp]

        for (let i = 0; i < pastedData.length && i < 6; i++) {
            newOtp[i] = pastedData[i]
        }

        setOtp(newOtp)
        setError('')

        // Focus last filled input
        const lastIndex = Math.min(pastedData.length - 1, 5)
        inputRefs.current[lastIndex]?.focus()
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()

        const otpString = otp.join('')
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits')
            return
        }

        if (!email) {
            setError('Session expired. Please request a new OTP.')
            navigate('/login', { replace: true })
            return
        }

        setIsLoading(true)
        setError('')

        verifyOtp({ email, otp: otpString }, {
            onSuccess: (data) => {
                setIsLoading(false)
                console.log(data, "data>>")
                console.log(data.user, "data.user>>")
                dispatch(setUser(data.user))
                navigate('/home')
            },
            onError: (error) => {
                setError(error.message)
                setIsLoading(false)
            }
        })
    }

    const handleResendOTP = () => {
        if (!email) {
            setError('Cannot resend OTP. Please start the login process again.')
            navigate('/login', { replace: true })
            return
        }
        setTimeLeft(60)
        setCanResend(false)
        setError('')
        sendOtp(email)
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
                    <p className="text-gray-600 text-sm mb-2">
                        We've sent a 6-digit code to
                    </p>
                    <p className="text-gray-800 font-medium text-sm">
                        {email}
                    </p>
                </div>

                {/* OTP Form */}
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-center space-x-3">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none"
                                    disabled={isLoading || isVerifyingOtp || isSendingOtp}
                                />
                            ))}
                        </div>

                        {error && (
                            <p className="text-center text-sm text-red-600 flex items-center justify-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || otp.join('').length !== 6}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        {isLoading || isVerifyingOtp ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {isVerifyingOtp ? 'Verifying...' : 'Loading...'}
                            </>
                        ) : (
                            <>
                                <span>Verify OTP</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Resend OTP */}
                <div className="mt-6 text-center">
                    {canResend ? (
                        <button
                            onClick={handleResendOTP}
                            className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors duration-200"
                        >
                            Resend OTP
                        </button>
                    ) : (
                        <p className="text-gray-500 text-sm">
                            Resend OTP in {formatTime(timeLeft)}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Didn't receive the code? Check your spam folder or try resending.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default OTPVerificationPage

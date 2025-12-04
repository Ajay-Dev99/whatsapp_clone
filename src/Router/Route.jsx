import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import OTPVerificationPage from "../pages/OTPVerificationPage";
import UsersPage from "../pages/UsersPage";
import RequestsPage from "../pages/RequestsPage";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <PublicRoute redirectTo="/home">
                <LandingPage />
            </PublicRoute>
        ),
    },
    {
        path: "/login",
        element: (
            <PublicRoute>
                <LoginPage />
            </PublicRoute>
        ),
    },
    {
        path: "/verify-otp",
        element: (
            <PublicRoute>
                <OTPVerificationPage />
            </PublicRoute>
        ),
    },
    {
        path: "/home",
        element: (
            <ProtectedRoute>
                <HomePage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/users",
        element: (
            <ProtectedRoute>
                <UsersPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/requests",
        element: (
            <ProtectedRoute>
                <RequestsPage />
            </ProtectedRoute>
        ),
    },
]);

export default router;

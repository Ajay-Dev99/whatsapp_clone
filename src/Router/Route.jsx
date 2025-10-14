import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import OTPVerificationPage from "../pages/OTPVerificationPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/verify-otp",
        element: <OTPVerificationPage />,
    },
    {
        path: "/home",
        element: <HomePage />,
    }
]);


export default router;
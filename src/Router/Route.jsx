import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import HomePage from "../pages/HomePage";
const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
    },
    {
        path: "home",
        element: <HomePage />,
    }
]);


export default router;
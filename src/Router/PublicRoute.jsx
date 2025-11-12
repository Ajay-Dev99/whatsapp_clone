import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PublicRoute = ({ children, redirectTo = "/home" }) => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    if (isAuthenticated()) {
        const fromState = location.state?.from?.pathname;
        return <Navigate to={fromState || redirectTo} replace />;
    }

    return children;
};

export default PublicRoute;


const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";
const TOKEN_EXPIRY_KEY = "authTokenExpiresAt";

const persistAuth = (data) => {
    if (!data) return;

    const { token, user, expiresAt } = data;

    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    if (expiresAt) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiresAt));
    } else {
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
    }
};

const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

const getTokenExpiry = () => {
    const raw = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!raw) return null;

    const expiresAt = Number(raw);
    if (Number.isNaN(expiresAt)) {
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        return null;
    }

    return expiresAt;
};

const isTokenValid = () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        return false;
    }

    const expiresAt = getTokenExpiry();

    if (expiresAt && Date.now() >= expiresAt) {
        clearAuth();
        return false;
    }

    return true;
};

const getAuthToken = () => {
    return isTokenValid() ? localStorage.getItem(TOKEN_KEY) : null;
};

const getAuthUser = () => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error("Failed to parse stored auth user:", error);
        localStorage.removeItem(USER_KEY);
        return null;
    }
};

export {
    TOKEN_KEY,
    USER_KEY,
    TOKEN_EXPIRY_KEY,
    persistAuth,
    clearAuth,
    isTokenValid,
    getAuthToken,
    getAuthUser,
};


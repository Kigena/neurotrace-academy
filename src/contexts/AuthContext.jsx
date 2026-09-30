import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";
import GamificationClient from "../services/gamificationClient";

const AuthContext = createContext(null);

// Hook co-located with its provider (imported app-wide); only affects HMR granularity.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // The service restores the cached session synchronously on construction.
    const [user, setUser] = useState(() => authService.getCurrentUser());
    const loading = false;

    useEffect(() => {
        // Confirm the cached session with the server. The server is
        // authoritative for identity and role; an invalid token logs out.
        if (!authService.getCurrentUser()) return undefined;
        let cancelled = false;
        authService.refreshCurrentUser().then((fresh) => {
            if (!cancelled) setUser(fresh);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const login = async (email, password) => {
        const loggedInUser = await authService.login(email, password);
        setUser(loggedInUser);
        return loggedInUser;
    };

    const logout = () => {
        authService.logout();
        GamificationClient.clearStoredProgress();
        setUser(null);
    };

    const createUser = async (name, email, password) => {
        const newUser = await authService.createUser(name, email, password);
        setUser(newUser); // users are auto-logged in by service, but we update context
        return newUser;
    };

    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
        // Also update in storage
        authService.updateUserInStorage(updatedUserData);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        createUser,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

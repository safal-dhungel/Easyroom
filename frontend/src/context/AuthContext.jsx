// AuthContext.jsx
// This file creates a "global state" for login/logout.
// Any component in the app can use this to know who is logged in.
// We use React Context so we don't have to pass user data through every component manually.

import React, { createContext, useState, useEffect } from 'react';

// Create the context object — components will import this to access user data
export const AuthContext = createContext();

// AuthProvider wraps the whole app and provides user state to everything inside it
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // null = nobody is logged in

    // When the app first loads, check if a user was previously logged in
    useEffect(() => {
        // Clear any stale session from the old admin system
        localStorage.removeItem('adminUser');

        const storedUser = localStorage.getItem('easyroom_user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                // Only restore if the stored value is a proper object
                if (parsed && typeof parsed === 'object') {
                    setUser(parsed);
                } else {
                    localStorage.removeItem('easyroom_user');
                }
            } catch {
                // If the value is corrupted (e.g. "undefined"), clear it
                localStorage.removeItem('easyroom_user');
            }
        }
    }, []);

    // Called when a user logs in — saves user to state and localStorage
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('easyroom_user', JSON.stringify(userData));
    };

    // Called when a user updates their profile
    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('easyroom_user', JSON.stringify(newUser));
    };

    // Called when a user logs out — clears state and localStorage
    const logout = () => {
        setUser(null);
        localStorage.removeItem('easyroom_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

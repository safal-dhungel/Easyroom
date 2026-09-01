import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Clear any stale admin session from the old system
        localStorage.removeItem('adminUser');

        const storedUser = localStorage.getItem('easyroom_user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed && typeof parsed === 'object') {
                    setUser(parsed);
                } else {
                    localStorage.removeItem('easyroom_user');
                }
            } catch {
                // Corrupted value (e.g. literal "undefined") — clear it
                localStorage.removeItem('easyroom_user');
            }
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('easyroom_user', JSON.stringify(userData));
    };

    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('easyroom_user', JSON.stringify(newUser));
    };

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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser, getProfile } from '../services/localDB';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be within AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = getCurrentUser();
        if (stored) {
            setUser(stored);
            setProfile(getProfile(stored.id));
        }
        setLoading(false);
    }, []);

    const refreshProfile = () => {
        if (user) setProfile(getProfile(user.id));
    };

    const login = (email, password) => {
        const u = loginUser(email, password);
        setUser(u);
        const p = getProfile(u.id);
        setProfile(p);
        return { user: u, isProfileSetup: !!p?.isSetup };
    };

    const register = (name, email, password, role) => {
        const u = registerUser(name, email, password, role);
        setUser(u);
        return u;
    };

    const logout = () => {
        logoutUser();
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAuthenticated: !!user, login, register, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

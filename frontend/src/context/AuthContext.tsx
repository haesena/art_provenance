import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

interface AuthContextType {
    user: api.User | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<api.User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                await api.fetchCsrfToken();
                const userData = await api.getMe();
                if (userData.is_authenticated) {
                    setUser(userData);
                }
            } catch (error) {
                console.error('Failed to initialize auth', error);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (credentials: any) => {
        const userData = await api.login(credentials);
        setUser(userData);
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

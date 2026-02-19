import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/Api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });

            if (response.success) {
                const { token: newToken, user: userData } = response.data;
                setToken(newToken);
                setUser(userData);
                await AsyncStorage.setItem('token', newToken);
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                return { success: true, user: userData };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post(API_ENDPOINTS.REGISTER, userData);

            if (response.success) {
                const { token: newToken, user: newUser } = response.data;
                setToken(newToken);
                setUser(newUser);
                await AsyncStorage.setItem('token', newToken);
                await AsyncStorage.setItem('user', JSON.stringify(newUser));
                return { success: true };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        try {
            setUser(null);
            setToken(null);
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateUser = async (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated: !!token,
                isAdmin: user?.role === 'admin',
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

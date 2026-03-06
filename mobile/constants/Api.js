import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
    // Auto-detect the dev server host IP from Expo
    const debuggerHost =
        Constants.expoConfig?.hostUri ||          // SDK 49+
        Constants.manifest2?.extra?.expoGo?.debuggerHost ||
        Constants.manifest?.debuggerHost;

    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0]; // strip port
        return `http://${ip}:3000`;
    }

    // Fallbacks
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000'; // Android emulator
    }
    return 'http://localhost:3000'; // iOS simulator
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
    UPDATE_PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VERIFY_RESET_CODE: '/api/auth/verify-reset-code',
    RESET_PASSWORD: '/api/auth/reset-password',
    PUSH_TOKEN: '/api/auth/push-token',

    // Trips
    TRIPS: '/api/trips',
    UPCOMING_TRIPS: '/api/trips/upcoming',

    // Orders
    ORDERS: '/api/orders',
    DASHBOARD: '/api/orders/dashboard',

    // Announcements
    ANNOUNCEMENTS: '/api/announcements',

    // Notifications
    NOTIFICATIONS: '/api/notifications',

    // Customers
    CUSTOMERS: '/api/customers',

    // Broadcast
    BROADCAST: '/api/broadcast',

    // Tickets
    TICKETS: '/api/tickets',
};

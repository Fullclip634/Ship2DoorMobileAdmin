import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Ship, Package, Bell, User } from 'lucide-react-native';
import { Colors, Fonts } from '../../constants/Colors';
import { View, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export default function CustomerLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textLight,
                tabBarBackground: () => (
                    <BlurView
                        tint="light"
                        intensity={85}
                        style={StyleSheet.absoluteFill}
                    />
                ),
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: Platform.OS === 'ios' ? (insets.bottom > 0 ? 0 : 4) : 8,
                },
                tabBarStyle: {
                    position: 'absolute', // Allows content to bleed underneath
                    backgroundColor: 'rgba(255, 255, 255, 0.65)', // High opacity white tint for readability
                    borderTopWidth: 0,
                    elevation: 0, // Flat shadow for cleaner glass effect
                    height: Platform.OS === 'ios' ? (insets.bottom > 0 ? 84 : 65) : 65,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? (insets.bottom > 0 ? 24 : 8) : 8,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Home size={22} color={color} strokeWidth={focused ? 2.5 : 1.5} />
                    ),
                }}
            />
            <Tabs.Screen
                name="trips"
                options={{
                    title: 'Trips',
                    tabBarIcon: ({ color, focused }) => (
                        <Ship size={22} color={color} strokeWidth={focused ? 2.5 : 1.5} />
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'My Orders',
                    tabBarIcon: ({ color, focused }) => (
                        <Package size={22} color={color} strokeWidth={focused ? 2.5 : 1.5} />
                    ),
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Alerts',
                    tabBarIcon: ({ color, focused }) => (
                        <Bell size={22} color={color} strokeWidth={focused ? 2.5 : 1.5} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <User size={22} color={color} strokeWidth={focused ? 2.5 : 1.5} />
                    ),
                }}
            />
            <Tabs.Screen name="book-shipment" options={{ href: null }} />
            <Tabs.Screen name="order-detail" options={{ href: null }} />
            <Tabs.Screen name="trip-detail" options={{ href: null }} />
            <Tabs.Screen name="personal-info" options={{ href: null }} />
            <Tabs.Screen name="support-chat" options={{ href: null }} />
            <Tabs.Screen name="my-tickets" options={{ href: null }} />
            <Tabs.Screen name="ticket-detail" options={{ href: null }} />
        </Tabs>
    );
}

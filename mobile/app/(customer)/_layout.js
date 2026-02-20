import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Ship, Package, Bell, User } from 'lucide-react-native';
import { Colors, Fonts } from '../../constants/Colors';
import { View, Platform } from 'react-native';

export default function CustomerLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textLight,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: Platform.OS === 'ios' ? 0 : 8,
                },
                tabBarStyle: {
                    backgroundColor: Colors.white,
                    borderTopWidth: 0,
                    height: Platform.OS === 'ios' ? 88 : 65,
                    paddingTop: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    elevation: 12,
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
        </Tabs>
    );
}

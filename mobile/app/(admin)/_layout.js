import React from 'react';
import { Tabs } from 'expo-router';
import { BarChart3, Ship, Package, Megaphone, User, Ticket } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.secondary,
                tabBarInactiveTintColor: Colors.textLight,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: Platform.OS === 'ios' ? (insets.bottom > 0 ? 0 : 4) : 8,
                },
                tabBarStyle: {
                    backgroundColor: Colors.white,
                    borderTopWidth: 0,
                    height: Platform.OS === 'ios' ? (insets.bottom > 0 ? 84 : 65) : 65,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? (insets.bottom > 0 ? 24 : 8) : 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    elevation: 12,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, focused }) => <BarChart3 size={22} color={color} strokeWidth={focused ? 2.5 : 1.5} />,
                }}
            />
            <Tabs.Screen
                name="trips"
                options={{
                    title: 'Trips',
                    tabBarIcon: ({ color, focused }) => <Ship size={22} color={color} strokeWidth={focused ? 2.5 : 1.5} />,
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color, focused }) => <Package size={22} color={color} strokeWidth={focused ? 2.5 : 1.5} />,
                }}
            />
            <Tabs.Screen
                name="announcements"
                options={{
                    title: 'Announce',
                    tabBarIcon: ({ color, focused }) => <Megaphone size={22} color={color} strokeWidth={focused ? 2.5 : 1.5} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => <User size={22} color={color} strokeWidth={focused ? 2.5 : 1.5} />,
                }}
            />
            <Tabs.Screen name="create-trip" options={{ href: null }} />
            <Tabs.Screen name="trip-detail" options={{ href: null }} />
            <Tabs.Screen name="order-detail" options={{ href: null }} />
            <Tabs.Screen name="customers" options={{ href: null }} />
            <Tabs.Screen name="personal-info" options={{ href: null }} />
            <Tabs.Screen name="tickets" options={{ href: null }} />
            <Tabs.Screen name="ticket-detail" options={{ href: null }} />
            <Tabs.Screen name="notifications" options={{ href: null }} />
        </Tabs>
    );
}

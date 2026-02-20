import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Platform } from 'react-native';

export default function AdminLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.secondary,
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
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? 'chart-box' : 'chart-box-outline'} size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="trips"
                options={{
                    title: 'Trips',
                    tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? 'ferry' : 'ferry'} size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? 'package-variant' : 'package-variant-closed'} size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="announcements"
                options={{
                    title: 'Announce',
                    tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? 'bullhorn' : 'bullhorn-outline'} size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={22} color={color} />,
                }}
            />
            <Tabs.Screen name="create-trip" options={{ href: null }} />
            <Tabs.Screen name="trip-detail" options={{ href: null }} />
            <Tabs.Screen name="order-detail" options={{ href: null }} />
            <Tabs.Screen name="customers" options={{ href: null }} />
            <Tabs.Screen name="personal-info" options={{ href: null }} />
        </Tabs>
    );
}

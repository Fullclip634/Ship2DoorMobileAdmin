import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors, Fonts, Spacing } from '../constants/Colors';

export default function IndexScreen() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (isAuthenticated && user) {
                if (user.role === 'admin') {
                    router.replace('/(admin)/dashboard');
                } else {
                    router.replace('/(customer)/home');
                }
            } else {
                router.replace('/login');
            }
        }
    }, [loading, isAuthenticated, user]);

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <View style={styles.iconCircle}>
                    <Text style={styles.logoIcon}>📦</Text>
                </View>
                <Text style={styles.logoText}>Ship<Text style={styles.logoAccent}>2</Text>Door</Text>
                <Text style={styles.tagline}>Manila — Bohol Cargo Delivery</Text>
            </View>
            <ActivityIndicator size="large" color={Colors.white} style={styles.loader} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    logoIcon: {
        fontSize: 44,
    },
    logoText: {
        fontSize: 38,
        fontWeight: '800',
        color: Colors.white,
        letterSpacing: -1,
    },
    logoAccent: {
        color: Colors.secondary,
    },
    tagline: {
        fontSize: Fonts.sizes.sm,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        marginTop: Spacing.xs,
        letterSpacing: 0.5,
    },
    loader: {
        marginTop: 40,
    },
});

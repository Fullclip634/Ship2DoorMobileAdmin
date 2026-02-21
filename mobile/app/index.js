import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors, Fonts, Spacing } from '../constants/Colors';

export default function IndexScreen() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        if (!loading) {
            // Slight delay so the user can see the premium entrance
            const timer = setTimeout(() => {
                if (isAuthenticated && user) {
                    if (user.role === 'admin') {
                        router.replace('/(admin)/dashboard');
                    } else {
                        router.replace('/(customer)/home');
                    }
                } else {
                    router.replace('/login');
                }
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [loading, isAuthenticated, user]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.iconCircle}>
                    <Text style={styles.logoIcon}>📦</Text>
                </View>
                <Text style={styles.logoText}>Ship<Text style={styles.logoAccent}>2</Text>Door</Text>
                <Text style={styles.tagline}>Manila — Bohol Cargo Delivery</Text>
            </Animated.View>
            <Animated.View style={[styles.loader, { opacity: fadeAnim }]}>
                <ActivityIndicator size="large" color={Colors.white} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.secondary, // Deep luxurious navy background
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)', // Glass border effect
    },
    logoIcon: {
        fontSize: 48,
    },
    logoText: {
        fontSize: Fonts.sizes.display,
        fontFamily: Fonts.extraBold,
        color: Colors.white,
        letterSpacing: -1.5,
    },
    logoAccent: {
        color: Colors.primary,
    },
    tagline: {
        fontSize: Fonts.sizes.md,
        color: 'rgba(255,255,255,0.7)',
        fontFamily: Fonts.medium,
        marginTop: Spacing.sm,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    loader: {
        position: 'absolute',
        bottom: 80,
    },
});

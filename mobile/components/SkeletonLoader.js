import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius } from '../constants/Colors';

/**
 * A beautiful shimmering skeleton loader.
 */
export default function SkeletonLoader({ width, height, style, borderRadius = BorderRadius.md }) {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1200,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            })
        ).start();
    }, [animatedValue]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width], // Move from left to right across the element
    });

    return (
        <View style={[styles.skeletonBox, { width, height, borderRadius }, style]}>
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
                <LinearGradient
                    colors={[
                        'rgba(255,255,255,0)',
                        'rgba(255,255,255,0.5)',
                        'rgba(255,255,255,0)'
                    ]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
}

// A layout specifically for simulating a Trip Card loading state
export function TripSkeleton() {
    return (
        <View style={styles.tripCardSkeleton}>
            <View style={styles.tripTopRow}>
                <SkeletonLoader width={80} height={24} borderRadius={12} />
                <SkeletonLoader width={60} height={20} borderRadius={10} />
            </View>
            <View style={styles.spacing}>
                <SkeletonLoader width={180} height={16} />
                <SkeletonLoader width={120} height={16} style={{ marginTop: 8 }} />
            </View>
        </View>
    );
}

// A layout specifically for simulating an Order Card loading state
export function OrderSkeleton() {
    return (
        <View style={styles.tripCardSkeleton}>
            <View style={styles.tripTopRow}>
                <SkeletonLoader width={100} height={20} />
                <SkeletonLoader width={70} height={20} borderRadius={10} />
            </View>
            <View style={styles.spacing}>
                <SkeletonLoader width={220} height={16} />
                <SkeletonLoader width={150} height={16} style={{ marginTop: 8 }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    skeletonBox: {
        backgroundColor: Colors.border, // Base gray color
        overflow: 'hidden',
    },
    tripCardSkeleton: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    tripTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    spacing: {
        marginTop: 8,
    }
});

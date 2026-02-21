import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

export default function AnimatedPressable({ children, onPress, style, disabled, scaleTo = 0.96 }) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: scaleTo,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
    };

    return (
        <Animated.View style={[{ transform: [{ scale }] }, style]}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                style={({ pressed }) => [
                    { opacity: disabled ? 0.6 : 1 },
                    // Ensure children fill the pressable area easily if needed
                ]}
            >
                {children}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({});

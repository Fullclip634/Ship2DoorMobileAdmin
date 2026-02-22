import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import AnimatedPressable from './AnimatedPressable';
import { Colors, BorderRadius } from '../constants/Colors';

/**
 * A reusable frosted glass card component.
 * Uses `expo-blur` to create a translucent blur effect over the background.
 */
export default function GlassCard({
    children,
    style,
    intensity = 40,
    tint = 'light',
    onPress,
    scaleTo = 0.98,
    ...props
}) {
    const CardWrapper = onPress ? AnimatedPressable : View;
    const wrapperProps = onPress ? { scaleTo, onPress, ...props } : props;

    return (
        <CardWrapper style={[styles.container, style]} {...wrapperProps}>
            <BlurView intensity={intensity} tint={tint} style={styles.blurView}>
                {children}
            </BlurView>
        </CardWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        // Optional subtle shadow to lift the glass off the background
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        // Optional subtle border to define the edge of the glass (like iOS)
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    blurView: {
        flex: 1,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)', // Light tint layer
    },
});

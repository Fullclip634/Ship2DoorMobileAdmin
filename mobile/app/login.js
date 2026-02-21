import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/Colors';
import { Ship, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import AnimatedPressable from '../components/AnimatedPressable';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Missing Fields', 'Please enter your email and password.');
            return;
        }

        setLoading(true);
        try {
            const result = await login(email.trim().toLowerCase(), password);

            if (result.success) {
                if (result.user.role === 'admin') {
                    router.replace('/(admin)/dashboard');
                } else {
                    router.replace('/(customer)/home');
                }
            } else {
                Alert.alert('Login Failed', result.message || 'Invalid credentials');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Hero Header */}
                    <View style={styles.hero}>
                        <View style={styles.heroGradient}>
                            <View style={styles.logoMark}>
                                <Ship size={44} color={Colors.white} strokeWidth={1.5} />
                            </View>
                            <Text style={styles.brandName}>Ship2Door</Text>
                            <Text style={styles.tagline}>Manila — Bohol Cargo Delivery</Text>
                        </View>
                        {/* Curved bottom edge */}
                        <View style={styles.heroCurve} />
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.welcomeTitle}>Welcome Back</Text>
                        <Text style={styles.welcomeSub}>Sign in to manage your shipments</Text>

                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={styles.inputContainer}>
                                    <Mail size={20} color={Colors.textLight} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor={Colors.textLight}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.inputContainer}>
                                    <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your password"
                                        placeholderTextColor={Colors.textLight}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                        {showPassword ? <EyeOff size={20} color={Colors.textLight} /> : <Eye size={20} color={Colors.textLight} />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotBtn}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <AnimatedPressable
                                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                                onPress={handleLogin}
                                disabled={loading}
                                scaleTo={0.96}
                            >
                                {loading ? (
                                    <ActivityIndicator color={Colors.white} />
                                ) : (
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                )}
                            </AnimatedPressable>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/register')}>
                                <Text style={styles.footerLink}>Create Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { flexGrow: 1 },

    // Hero Header
    hero: { position: 'relative', backgroundColor: Colors.secondary },
    heroGradient: {
        paddingTop: 60,
        paddingBottom: 48,
        alignItems: 'center',
        backgroundColor: Colors.secondary,
    },
    logoMark: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    brandName: {
        fontSize: 32,
        fontFamily: Fonts.extraBold,
        color: Colors.white,
        letterSpacing: -1,
        marginBottom: Spacing.xs,
    },
    tagline: {
        fontSize: Fonts.sizes.sm,
        fontFamily: Fonts.medium,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    heroCurve: {
        height: 32,
        backgroundColor: Colors.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -1,
    },

    // Content
    content: {
        paddingHorizontal: Spacing.xxl,
        paddingBottom: 40,
    },
    welcomeTitle: {
        fontSize: Fonts.sizes.xxxl,
        fontFamily: Fonts.extraBold,
        color: Colors.text,
        letterSpacing: -0.5,
    },
    welcomeSub: {
        fontSize: Fonts.sizes.md,
        color: Colors.textSecondary,
        fontFamily: Fonts.regular,
        marginTop: Spacing.xs,
        marginBottom: Spacing.xxl,
    },

    // Form
    form: { gap: Spacing.xl },
    inputGroup: { gap: Spacing.sm },
    label: { fontSize: Fonts.sizes.sm, fontFamily: Fonts.semiBold, color: Colors.text, marginLeft: 4 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
        borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
        paddingHorizontal: Spacing.lg, height: 56, // Taller inputs for a premium feel
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
    },
    inputIcon: { marginRight: Spacing.md },
    input: { flex: 1, fontSize: Fonts.sizes.md, fontFamily: Fonts.regular, color: Colors.text, height: '100%' },
    eyeBtn: { padding: Spacing.sm, marginRight: -Spacing.sm },
    forgotBtn: { alignSelf: 'flex-end', marginTop: -Spacing.sm },
    forgotText: { fontSize: Fonts.sizes.sm, fontFamily: Fonts.bold, color: Colors.primary },
    loginButton: {
        backgroundColor: Colors.primary, height: 56, borderRadius: BorderRadius.md,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    loginButtonDisabled: { opacity: 0.7, shadowOpacity: 0.1 },
    loginButtonText: { fontSize: Fonts.sizes.lg, fontFamily: Fonts.bold, color: Colors.white, letterSpacing: 0.5 },

    // Footer
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
    footerText: { fontSize: Fonts.sizes.sm, fontFamily: Fonts.regular, color: Colors.textSecondary },
    footerLink: { fontSize: Fonts.sizes.sm, fontFamily: Fonts.bold, color: Colors.primary },
});

import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

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
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.logoIcon}>📦</Text>
                        </View>
                        <Text style={styles.logoText}>Ship<Text style={styles.logoAccent}>2</Text>Door</Text>
                        <Text style={styles.subtitle}>Sign in to your account</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
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
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor={Colors.textLight}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textLight} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.loginButtonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/register')}>
                            <Text style={styles.footerLink}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: 60 },
    header: { alignItems: 'center', marginBottom: 40 },
    iconCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryFaded,
        alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
    },
    logoIcon: { fontSize: 38 },
    logoText: { fontSize: 34, fontWeight: '800', color: Colors.secondary, letterSpacing: -1 },
    logoAccent: { color: Colors.primary },
    subtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, fontWeight: '400', marginTop: Spacing.sm },
    form: { gap: Spacing.xl },
    inputGroup: { gap: Spacing.sm },
    label: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text, marginLeft: 4 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
        borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border,
        paddingHorizontal: Spacing.lg, height: 52,
    },
    inputIcon: { marginRight: Spacing.md },
    input: { flex: 1, fontSize: Fonts.sizes.md, color: Colors.text, height: '100%' },
    eyeBtn: { padding: Spacing.xs },
    loginButton: {
        backgroundColor: Colors.primary, height: 52, borderRadius: BorderRadius.md,
        alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    loginButtonDisabled: { opacity: 0.7 },
    loginButtonText: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.white },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
    footerText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
    footerLink: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.primary },
});

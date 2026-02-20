import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/Colors';
import { ArrowLeft, Mail, Grid3X3, LockOpen, Lock, Eye, EyeOff } from 'lucide-react-native';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/Api';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1 = email, 2 = code, 3 = new password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendCode = async () => {
        if (!email.trim()) {
            Alert.alert('Required', 'Please enter your email address.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email: email.trim().toLowerCase() });
            if (res.success) {
                Alert.alert('Code Sent', 'Check your email for a 6-digit reset code.');
                setStep(2);
            }
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to send reset code.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndReset = async () => {
        if (!code.trim() || code.trim().length !== 6) {
            Alert.alert('Invalid Code', 'Please enter the 6-digit code from your email.');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Mismatch', 'Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post(API_ENDPOINTS.RESET_PASSWORD, {
                email: email.trim().toLowerCase(),
                code: code.trim(),
                new_password: newPassword,
            });
            if (res.success) {
                Alert.alert('Success', 'Your password has been reset. Please sign in.', [
                    { text: 'Sign In', onPress: () => router.replace('/login') },
                ]);
            }
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email: email.trim().toLowerCase() });
            Alert.alert('Resent', 'A new code has been sent to your email.');
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {/* Back */}
                    <TouchableOpacity style={styles.backBtn} onPress={() => step > 1 ? setStep(step - 1) : router.back()}>
                        <ArrowLeft size={24} color={Colors.text} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            {step === 1 ? <Mail size={32} color={Colors.primary} /> : step === 2 ? <Grid3X3 size={32} color={Colors.primary} /> : <LockOpen size={32} color={Colors.primary} />}
                        </View>
                        <Text style={styles.title}>
                            {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter Code' : 'New Password'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {step === 1
                                ? 'Enter your email and we\'ll send you a reset code.'
                                : step === 2
                                    ? `We sent a 6-digit code to ${email}`
                                    : 'Create a new secure password for your account.'}
                        </Text>
                    </View>

                    {/* Step 1: Email */}
                    {step === 1 && (
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
                            <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleSendCode} disabled={loading} activeOpacity={0.8}>
                                {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryBtnText}>Send Reset Code</Text>}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Step 2: Code + New Password */}
                    {step === 2 && (
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>6-Digit Code</Text>
                                <View style={styles.inputContainer}>
                                    <Grid3X3 size={20} color={Colors.textLight} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { letterSpacing: 6, fontWeight: '700', fontSize: 20 }]}
                                        placeholder="000000"
                                        placeholderTextColor={Colors.textLight}
                                        value={code}
                                        onChangeText={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Password</Text>
                                <View style={styles.inputContainer}>
                                    <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="At least 6 characters"
                                        placeholderTextColor={Colors.textLight}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                        {showPassword ? <EyeOff size={20} color={Colors.textLight} /> : <Eye size={20} color={Colors.textLight} />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={styles.inputContainer}>
                                    <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Re-enter new password"
                                        placeholderTextColor={Colors.textLight}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleVerifyAndReset} disabled={loading} activeOpacity={0.8}>
                                {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryBtnText}>Reset Password</Text>}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.resendBtn} onPress={handleResend} disabled={loading}>
                                <Text style={styles.resendText}>Didn't receive a code? <Text style={styles.resendLink}>Resend</Text></Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Remember your password? </Text>
                        <TouchableOpacity onPress={() => router.replace('/login')}>
                            <Text style={styles.footerLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: 40 },
    backBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white,
        alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    header: { alignItems: 'center', marginBottom: 36 },
    iconCircle: {
        width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryFaded,
        alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
    },
    title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
    subtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22, paddingHorizontal: Spacing.lg },
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
    primaryBtn: {
        backgroundColor: Colors.primary, height: 52, borderRadius: BorderRadius.md,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    primaryBtnText: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.white },
    resendBtn: { alignItems: 'center', marginTop: Spacing.md },
    resendText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
    resendLink: { fontWeight: '700', color: Colors.primary },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
    footerText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
    footerLink: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.primary },
});

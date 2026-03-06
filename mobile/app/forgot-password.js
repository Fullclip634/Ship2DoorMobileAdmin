import React, { useState, useCallback, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/Colors';
import { ArrowLeft, Mail, CircleCheck, Lock, Eye, EyeOff, ShieldCheck, ChevronRight } from 'lucide-react-native';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/Api';

const STEP_COUNT = 3;

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1 = Email, 2 = Code, 3 = New Password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Animation for step transitions
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const transitionToStep = (nextStep) => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setStep(nextStep);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
    };

    useFocusEffect(
        useCallback(() => {
            setStep(1);
            setEmail('');
            setCode('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPassword(false);
            fadeAnim.setValue(1);
        }, [])
    );

    const handleSendCode = async () => {
        if (!email.trim() || !email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email: email.trim().toLowerCase() });
            if (res.success) {
                transitionToStep(2);
            }
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to send reset code.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!code.trim() || code.trim().length !== 6) {
            Alert.alert('Invalid Code', 'Please enter the 6-digit code sent to your email.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post(API_ENDPOINTS.VERIFY_RESET_CODE, {
                email: email.trim().toLowerCase(),
                code: code.trim(),
            });
            if (res.success) {
                transitionToStep(3);
            }
        } catch (e) {
            Alert.alert('Verification Failed', e.message || 'The code you entered is invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
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
                Alert.alert(
                    'Password Updated',
                    'Your password has been changed successfully. You can now log in with your new credentials.',
                    [{ text: 'Sign In', onPress: () => router.replace('/login') }]
                );
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
            Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStepper = () => (
        <View style={styles.stepperContainer}>
            {[1, 2, 3].map((s) => (
                <View key={s} style={styles.stepWrapper}>
                    <View style={[
                        styles.stepCircle,
                        s <= step && styles.stepCircleActive,
                        s < step && styles.stepCircleDone
                    ]}>
                        {s < step ? (
                            <CircleCheck size={18} color={Colors.white} />
                        ) : (
                            <Text style={[styles.stepNumber, s <= step && styles.stepNumberActive]}>{s}</Text>
                        )}
                    </View>
                    {s < STEP_COUNT && (
                        <View style={[styles.stepLine, s < step && styles.stepLineActive]} />
                    )}
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    {/* Top Navigation */}
                    <View style={styles.navHeader}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => step > 1 ? transitionToStep(step - 1) : router.back()}>
                            <ArrowLeft size={24} color={Colors.text} />
                        </TouchableOpacity>
                        {renderStepper()}
                        <View style={{ width: 44 }} />
                    </View>

                    <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                        {/* Header Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verification' : 'Secure Account'}
                            </Text>
                            <Text style={styles.subtitle}>
                                {step === 1
                                    ? 'Enter your email address and we\'ll send you a recovery code.'
                                    : step === 2
                                        ? `A 6-digit verification code was sent to ${email}`
                                        : 'Please create a new secure password to protect your account.'}
                            </Text>
                        </View>

                        {/* Step 1: Email */}
                        {step === 1 && (
                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <View style={styles.inputLabelContainer}>
                                        <Mail size={16} color={Colors.textSecondary} />
                                        <Text style={styles.label}>EMAIL ADDRESS</Text>
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="yourname@example.com"
                                            placeholderTextColor={Colors.textLight}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                                    onPress={handleSendCode}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={Colors.white} />
                                    ) : (
                                        <View style={styles.btnContent}>
                                            <Text style={styles.primaryBtnText}>Send Code</Text>
                                            <ChevronRight size={20} color={Colors.white} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Step 2: Code */}
                        {step === 2 && (
                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <View style={styles.inputLabelContainer}>
                                        <ShieldCheck size={16} color={Colors.textSecondary} />
                                        <Text style={styles.label}>6-DIGIT VERIFICATION CODE</Text>
                                    </View>
                                    <View style={styles.codeContainer}>
                                        <TextInput
                                            style={styles.codeInput}
                                            placeholder="000 000"
                                            placeholderTextColor={Colors.border}
                                            value={code}
                                            onChangeText={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            autoFocus={true}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                                    onPress={handleVerifyCode}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={Colors.white} />
                                    ) : (
                                        <View style={styles.btnContent}>
                                            <Text style={styles.primaryBtnText}>Verify Code</Text>
                                            <ChevronRight size={20} color={Colors.white} />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.resendBtn} onPress={handleResend} disabled={loading}>
                                    <Text style={styles.resendText}>Didn't receive the email? <Text style={styles.resendLink}>Resend Code</Text></Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Step 3: New Password */}
                        {step === 3 && (
                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <View style={styles.inputLabelContainer}>
                                        <Lock size={16} color={Colors.textSecondary} />
                                        <Text style={styles.label}>NEW PASSWORD</Text>
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="min. 6 characters"
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
                                    <View style={styles.inputLabelContainer}>
                                        <Lock size={16} color={Colors.textSecondary} />
                                        <Text style={styles.label}>CONFIRM PASSWORD</Text>
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="repeat password"
                                            placeholderTextColor={Colors.textLight}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                                    onPress={handleResetPassword}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={Colors.white} />
                                    ) : (
                                        <View style={styles.btnContent}>
                                            <Text style={styles.primaryBtnText}>Update Password</Text>
                                            <ShieldCheck size={20} color={Colors.white} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Back to </Text>
                        <TouchableOpacity onPress={() => router.replace('/login')}>
                            <Text style={styles.footerLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 40 },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.white,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepCircle: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: Colors.border,
        alignItems: 'center', justifyContent: 'center',
    },
    stepCircleActive: {
        backgroundColor: Colors.primaryFaded,
        borderWidth: 1, borderColor: Colors.primary,
    },
    stepCircleDone: {
        backgroundColor: Colors.primary,
    },
    stepNumber: {
        fontSize: 12, fontWeight: '700', color: Colors.textSecondary,
    },
    stepNumberActive: {
        color: Colors.primary,
    },
    stepLine: {
        width: 20, height: 2, backgroundColor: Colors.border,
        marginHorizontal: 4,
    },
    stepLineActive: {
        backgroundColor: Colors.primary,
    },
    content: { flex: 1 },
    header: { marginBottom: 40 },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: -1,
        marginBottom: 12
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    form: { gap: 24 },
    inputGroup: { gap: 10 },
    inputLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 4,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.textSecondary,
        letterSpacing: 1.5
    },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
        borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
        paddingHorizontal: 16, height: 56,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
    },
    codeContainer: {
        backgroundColor: Colors.white,
        borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
        height: 80, alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    },
    codeInput: {
        fontSize: 36, fontWeight: '800', color: Colors.primary,
        letterSpacing: 10, textAlign: 'center', width: '100%',
    },
    input: { flex: 1, fontSize: 16, color: Colors.text, height: '100%', fontWeight: '500' },
    eyeBtn: { padding: Spacing.xs },
    primaryBtn: {
        backgroundColor: Colors.primary, height: 56, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
        marginTop: 12,
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 6,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    primaryBtnText: { fontSize: 17, fontWeight: '700', color: Colors.white },
    resendBtn: { alignItems: 'center', paddingVertical: 10 },
    resendText: { fontSize: 14, color: Colors.textSecondary },
    resendLink: { fontWeight: '800', color: Colors.primary },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, paddingBottom: 20 },
    footerText: { fontSize: 15, color: Colors.textSecondary },
    footerLink: { fontSize: 15, fontWeight: '800', color: Colors.primary },
});

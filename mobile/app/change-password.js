import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/Colors';
import { ArrowLeft, ShieldCheck, Lock, LockOpen, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react-native';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/Api';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword.trim()) {
            Alert.alert('Required', 'Please enter your current password.');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            Alert.alert('Weak Password', 'New password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Mismatch', 'New passwords do not match.');
            return;
        }
        if (currentPassword === newPassword) {
            Alert.alert('Same Password', 'New password must be different from current password.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.put(API_ENDPOINTS.CHANGE_PASSWORD, {
                current_password: currentPassword,
                new_password: newPassword,
            });
            if (res.success) {
                Alert.alert('Success', 'Your password has been changed.', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            }
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    const getStrength = () => {
        if (!newPassword) return { label: '', color: Colors.textLight, width: '0%' };
        if (newPassword.length < 6) return { label: 'Too short', color: Colors.error, width: '20%' };
        let score = 0;
        if (newPassword.length >= 8) score++;
        if (/[A-Z]/.test(newPassword)) score++;
        if (/[0-9]/.test(newPassword)) score++;
        if (/[^A-Za-z0-9]/.test(newPassword)) score++;
        if (score <= 1) return { label: 'Weak', color: Colors.error, width: '40%' };
        if (score === 2) return { label: 'Fair', color: Colors.warning, width: '60%' };
        if (score === 3) return { label: 'Good', color: Colors.info, width: '80%' };
        return { label: 'Strong', color: Colors.success, width: '100%' };
    };

    const strength = getStrength();

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {/* Header */}
                    <View style={styles.topBar}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <ArrowLeft size={24} color={Colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.topTitle}>Change Password</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <ShieldCheck size={32} color={Colors.primary} />
                        </View>
                        <Text style={styles.subtitle}>Update your password to keep your account secure</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Password</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter current password"
                                    placeholderTextColor={Colors.textLight}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry={!showCurrent}
                                />
                                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                                    {showCurrent ? <EyeOff size={20} color={Colors.textLight} /> : <Eye size={20} color={Colors.textLight} />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.inputContainer}>
                                <LockOpen size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="At least 6 characters"
                                    placeholderTextColor={Colors.textLight}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNew}
                                />
                                <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                                    {showNew ? <EyeOff size={20} color={Colors.textLight} /> : <Eye size={20} color={Colors.textLight} />}
                                </TouchableOpacity>
                            </View>
                            {/* Strength indicator */}
                            {newPassword.length > 0 && (
                                <View style={styles.strengthRow}>
                                    <View style={styles.strengthBar}>
                                        <View style={[styles.strengthFill, { width: strength.width, backgroundColor: strength.color }]} />
                                    </View>
                                    <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm New Password</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Re-enter new password"
                                    placeholderTextColor={Colors.textLight}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showNew}
                                />
                                {confirmPassword.length > 0 && (
                                    confirmPassword === newPassword
                                        ? <CheckCircle size={20} color={Colors.success} />
                                        : <XCircle size={20} color={Colors.error} />
                                )}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                            onPress={handleChangePassword}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveBtnText}>Update Password</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.xxl, paddingBottom: 40 },
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: Spacing.lg,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    topTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text },
    header: { alignItems: 'center', marginBottom: 32 },
    iconCircle: {
        width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryFaded,
        alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
    },
    subtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
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
    divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },
    strengthRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
    strengthBar: { flex: 1, height: 4, backgroundColor: Colors.borderLight, borderRadius: 2, overflow: 'hidden' },
    strengthFill: { height: '100%', borderRadius: 2 },
    strengthLabel: { fontSize: Fonts.sizes.xs, fontWeight: '600', minWidth: 50 },
    saveBtn: {
        backgroundColor: Colors.primary, height: 52, borderRadius: BorderRadius.md,
        alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    saveBtnText: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.white },
});

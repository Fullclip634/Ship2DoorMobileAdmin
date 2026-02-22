import React, { useState, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/Colors';
import { ArrowLeft, Ship, User, Mail, Phone, Lock, Eye, EyeOff, MapPin, Building2, Map } from 'lucide-react-native';
import AnimatedPressable from '../components/AnimatedPressable';

export default function RegisterScreen() {
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        password: '', confirm_password: '', address: '', city: '', province: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            setForm({
                first_name: '', last_name: '', email: '', phone: '',
                password: '', confirm_password: '', address: '', city: '', province: '',
            });
            setShowPassword(false);
        }, [])
    );

    const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleRegister = async () => {
        const { first_name, last_name, email, password, confirm_password } = form;

        if (!first_name.trim() || !last_name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        if (password !== confirm_password) {
            Alert.alert('Password Mismatch', 'Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            const result = await register({
                ...form,
                email: email.trim().toLowerCase(),
            });

            if (result.success) {
                router.replace('/(customer)/home');
            } else {
                Alert.alert('Registration Failed', result.message || 'Please try again.');
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
                    {/* Branded Hero */}
                    <View style={styles.hero}>
                        <View style={styles.heroGradient}>
                            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                                <ArrowLeft size={24} color={Colors.white} />
                            </TouchableOpacity>
                            <View style={styles.logoMark}>
                                <Ship size={32} color={Colors.white} strokeWidth={1.5} />
                            </View>
                            <Text style={styles.brandName}>Ship2Door</Text>
                        </View>
                        <View style={styles.heroCurve} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join Ship2Door and start shipping</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>First Name *</Text>
                                    <View style={styles.inputContainer}>
                                        <User size={20} color={Colors.textLight} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="First name"
                                            placeholderTextColor={Colors.textLight}
                                            value={form.first_name}
                                            onChangeText={(v) => updateField('first_name', v)}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Last Name *</Text>
                                    <View style={styles.inputContainer}>
                                        <User size={20} color={Colors.textLight} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Last name"
                                            placeholderTextColor={Colors.textLight}
                                            value={form.last_name}
                                            onChangeText={(v) => updateField('last_name', v)}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address *</Text>
                            <View style={styles.inputContainer}>
                                <Mail size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter email address"
                                    placeholderTextColor={Colors.textLight}
                                    value={form.email}
                                    onChangeText={(v) => updateField('email', v)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.inputContainer}>
                                <Phone size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter phone number"
                                    placeholderTextColor={Colors.textLight}
                                    value={form.phone}
                                    onChangeText={(v) => updateField('phone', v)}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password *</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="At least 6 characters"
                                    placeholderTextColor={Colors.textLight}
                                    value={form.password}
                                    onChangeText={(v) => updateField('password', v)}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                    {showPassword ? <EyeOff size={20} color={Colors.textLight} /> : <Eye size={20} color={Colors.textLight} />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password *</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Re-enter password"
                                    placeholderTextColor={Colors.textLight}
                                    value={form.confirm_password}
                                    onChangeText={(v) => updateField('confirm_password', v)}
                                    secureTextEntry={!showPassword}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address</Text>
                            <View style={styles.inputContainer}>
                                <MapPin size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter address"
                                    placeholderTextColor={Colors.textLight}
                                    value={form.address}
                                    onChangeText={(v) => updateField('address', v)}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>City</Text>
                                    <View style={styles.inputContainer}>
                                        <Building2 size={20} color={Colors.textLight} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="City"
                                            placeholderTextColor={Colors.textLight}
                                            value={form.city}
                                            onChangeText={(v) => updateField('city', v)}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Province</Text>
                                    <View style={styles.inputContainer}>
                                        <Map size={20} color={Colors.textLight} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Province"
                                            placeholderTextColor={Colors.textLight}
                                            value={form.province}
                                            onChangeText={(v) => updateField('province', v)}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        <AnimatedPressable
                            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                            scaleTo={0.96}
                        >
                            {loading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.registerButtonText}>Create Account</Text>
                            )}
                        </AnimatedPressable>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.footerLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },

    // Hero
    hero: { position: 'relative', backgroundColor: Colors.secondary },
    heroGradient: {
        paddingTop: 50,
        paddingBottom: 32,
        alignItems: 'center',
        backgroundColor: Colors.secondary,
    },
    backButton: {
        position: 'absolute', top: 50, left: Spacing.lg,
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    logoMark: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.sm,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    },
    brandName: {
        fontSize: 24, fontFamily: Fonts.extraBold, color: Colors.white, letterSpacing: -0.5,
    },
    heroCurve: {
        height: 32,
        backgroundColor: Colors.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -1,
    },

    header: { paddingHorizontal: Spacing.xxl, marginBottom: 24 },
    title: { fontSize: Fonts.sizes.xxl, fontFamily: Fonts.extraBold, color: Colors.text, letterSpacing: -0.5 },
    subtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, fontFamily: Fonts.regular, marginTop: Spacing.xs },
    form: { gap: Spacing.md, paddingHorizontal: Spacing.xxl },
    row: { flexDirection: 'row', gap: Spacing.md },
    inputGroup: { gap: Spacing.xs },
    label: { fontSize: Fonts.sizes.sm, fontFamily: Fonts.semiBold, color: Colors.text, marginLeft: 4 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
        borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
        paddingHorizontal: Spacing.lg, height: 56,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
    },
    inputIcon: { marginRight: Spacing.sm },
    input: { flex: 1, fontSize: Fonts.sizes.md, fontFamily: Fonts.regular, color: Colors.text, height: '100%' },
    eyeBtn: { padding: Spacing.sm, marginRight: -Spacing.sm },
    registerButton: {
        backgroundColor: Colors.primary, height: 56, borderRadius: BorderRadius.md,
        alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md,
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    registerButtonDisabled: { opacity: 0.7, shadowOpacity: 0.1 },
    registerButtonText: { fontSize: Fonts.sizes.lg, fontFamily: Fonts.bold, color: Colors.white, letterSpacing: 0.5 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28, paddingHorizontal: Spacing.xxl },
    footerText: { fontSize: Fonts.sizes.sm, fontFamily: Fonts.regular, color: Colors.textSecondary },
    footerLink: { fontSize: Fonts.sizes.sm, fontFamily: Fonts.bold, color: Colors.primary },
});

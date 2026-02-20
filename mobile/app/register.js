import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RegisterScreen() {
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        password: '', confirm_password: '', address: '', city: '', province: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

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
                                <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.white} />
                            </TouchableOpacity>
                            <View style={styles.logoMark}>
                                <MaterialCommunityIcons name="ferry" size={32} color={Colors.white} />
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
                                        <MaterialCommunityIcons name="account-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
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
                                        <MaterialCommunityIcons name="account-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
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
                                <MaterialCommunityIcons name="email-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
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
                                <MaterialCommunityIcons name="phone-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
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
                                <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="At least 6 characters"
                                    placeholderTextColor={Colors.textLight}
                                    value={form.password}
                                    onChangeText={(v) => updateField('password', v)}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                    <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textLight} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password *</Text>
                            <View style={styles.inputContainer}>
                                <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
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
                                <MaterialCommunityIcons name="map-marker-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
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
                                        <MaterialCommunityIcons name="city-variant-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
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
                                        <MaterialCommunityIcons name="map-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
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

                        <TouchableOpacity
                            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.registerButtonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>
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
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
    },
    logoMark: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    brandName: {
        fontSize: 24, fontWeight: '800', color: Colors.white, letterSpacing: -0.5,
    },
    heroCurve: {
        height: 24,
        backgroundColor: Colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -1,
    },

    header: { paddingHorizontal: Spacing.xxl, marginBottom: 24 },
    title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
    subtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
    form: { gap: Spacing.md, paddingHorizontal: Spacing.xxl },
    row: { flexDirection: 'row', gap: Spacing.md },
    inputGroup: { gap: Spacing.xs },
    label: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text, marginLeft: 4 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
        borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border,
        paddingHorizontal: Spacing.lg, height: 50,
    },
    inputIcon: { marginRight: Spacing.sm },
    input: { flex: 1, fontSize: Fonts.sizes.md, color: Colors.text, height: '100%' },
    eyeBtn: { padding: Spacing.xs },
    registerButton: {
        backgroundColor: Colors.primary, height: 52, borderRadius: BorderRadius.md,
        alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    registerButtonDisabled: { opacity: 0.7 },
    registerButtonText: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.white },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28, paddingHorizontal: Spacing.xxl },
    footerText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
    footerLink: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.primary },
});

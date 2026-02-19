import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, TextInput, ActivityIndicator, Linking, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { MenuItem, MenuDivider } from '../../components/UIComponents';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';

const ProfileField = ({ label, icon, value, onChangeText, editable, ...props }) => (
    <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={[styles.fieldInput, !editable && styles.fieldInputDisabled]}>
            <Ionicons name={icon} size={18} color={Colors.textLight} />
            <TextInput
                style={[styles.fieldTextInput, !editable && { color: Colors.textSecondary }]}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor={Colors.textLight}
                editable={editable}
                {...props}
            />
        </View>
    </View>
);

export default function CustomerProfile() {
    const { user, logout, updateUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                    {/* ── Profile Header ── */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarOuter}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{initials}</Text>
                            </View>
                        </View>
                        <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                        <View style={styles.memberSince}>
                            <Ionicons name="time-outline" size={12} color={Colors.textLight} />
                            <Text style={styles.memberText}>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                        </View>
                    </View>


                    {/* ── My Activity ── */}
                    <Text style={[styles.groupLabel, { marginTop: Spacing.lg }]}>MY ACTIVITY</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="cube-outline" iconBg={Colors.secondary} label="My Orders" subtitle="View your shipment history"
                            onPress={() => router.push('/(customer)/orders')}
                        />
                        <MenuDivider />
                        <MenuItem
                            icon="boat-outline" iconBg={Colors.info} label="Available Trips" subtitle="Browse upcoming cargo trips"
                            onPress={() => router.push('/(customer)/trips')}
                        />
                        <MenuDivider />
                        <MenuItem
                            icon="notifications-outline" iconBg="#F59E0B" label="Notifications" subtitle="Order updates and alerts"
                            onPress={() => router.push('/(customer)/notifications')}
                        />
                    </View>

                    {/* ── Account Settings ── */}
                    <Text style={styles.groupLabel}>ACCOUNT SETTINGS</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="person-outline" iconBg={Colors.primary} label="Personal Information" subtitle="Update name, phone, and address"
                            onPress={() => router.push('/(customer)/personal-info')}
                        />
                        <MenuDivider />
                        <MenuItem
                            icon="shield-checkmark-outline" iconBg={Colors.secondary} label="Change Password" subtitle="Update your account password"
                            onPress={() => router.push('/change-password')}
                        />
                    </View>

                    {/* ── Support & About ── */}
                    <Text style={styles.groupLabel}>SUPPORT & ABOUT</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="help-circle-outline" iconBg="#8B5CF6" label="Help & FAQ" subtitle="Get answers to common questions"
                            onPress={() => Alert.alert('Help & FAQ', 'Contact us at support@ship2door.com')}
                        />
                        <MenuDivider />
                        <MenuItem
                            icon="chatbubble-ellipses-outline" iconBg="#EC4899" label="Contact Support" subtitle="Reach our customer service team"
                            onPress={() => Linking.openURL('mailto:support@ship2door.com')}
                        />
                        <MenuDivider />
                        <MenuItem
                            icon="document-text-outline" iconBg={Colors.textSecondary} label="Terms & Privacy" subtitle="Read our policies"
                            onPress={() => Alert.alert('Terms & Privacy', 'By using this app, you agree to our terms.')}
                        />
                    </View>

                    {/* ── Sign Out ── */}
                    <View style={[styles.menuCard, { marginTop: Spacing.md }]}>
                        <MenuItem
                            icon="log-out-outline" iconBg={Colors.errorLight} label="Sign Out" danger
                            onPress={handleLogout} trailing={null}
                        />
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingBottom: 20 },
    profileHeader: {
        alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.xl,
    },
    avatarOuter: {
        padding: 4, borderRadius: 52, borderWidth: 2.5, borderColor: Colors.primary + '30', marginBottom: Spacing.md,
    },
    avatar: {
        width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 32, fontWeight: '800', color: Colors.white },
    userName: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text, marginTop: 2 },
    userEmail: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    memberSince: {
        flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm,
        backgroundColor: Colors.borderLight, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.full,
    },
    memberText: { fontSize: Fonts.sizes.xs, color: Colors.textLight },

    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.xxl, marginBottom: Spacing.sm, marginTop: Spacing.md
    },
    groupLabel: {
        fontSize: Fonts.sizes.xs, fontWeight: '700', color: Colors.textLight,
        letterSpacing: 0.8, paddingHorizontal: Spacing.xxl, marginBottom: Spacing.sm, marginTop: Spacing.sm,
    },
    editLink: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.primary },

    menuCard: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg, marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
        overflow: 'hidden',
    },
    card: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg, marginHorizontal: Spacing.lg, padding: Spacing.lg,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    },
    row: { flexDirection: 'row', gap: Spacing.md },
    fieldGroup: { marginBottom: Spacing.md },
    fieldLabel: { fontSize: Fonts.sizes.xs, fontWeight: '600', color: Colors.textLight, marginBottom: 4 },
    fieldInput: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.background,
        borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 44,
    },
    fieldInputDisabled: { backgroundColor: Colors.background, borderColor: 'transparent' },
    fieldTextInput: { flex: 1, fontSize: Fonts.sizes.sm, color: Colors.text, height: '100%' },
    divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.md },
    editActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
    cancelBtn: { flex: 1, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.border },
    cancelText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary },
    saveBtn: { flex: 1, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    saveText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.white },
});

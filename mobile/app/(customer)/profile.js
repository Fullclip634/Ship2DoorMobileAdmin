import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';

export default function CustomerProfile() {
    const { user, logout, updateUser } = useAuth();
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        province: user?.province || '',
    });

    const updateField = (key, value) => setForm({ ...form, [key]: value });

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await api.put(API_ENDPOINTS.UPDATE_PROFILE, form);
            if (res.success) {
                await updateUser(res.data);
                setEditing(false);
                Alert.alert('Success', 'Profile updated successfully');
            }
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
        ]);
    };

    const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();

    const ProfileField = ({ label, icon, field, ...props }) => (
        <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {editing ? (
                <View style={styles.fieldInput}>
                    <Ionicons name={icon} size={18} color={Colors.textLight} />
                    <TextInput
                        style={styles.fieldTextInput}
                        value={form[field]}
                        onChangeText={(v) => updateField(field, v)}
                        placeholderTextColor={Colors.textLight}
                        {...props}
                    />
                </View>
            ) : (
                <View style={styles.fieldDisplay}>
                    <Ionicons name={icon} size={18} color={Colors.textSecondary} />
                    <Text style={styles.fieldValue}>{user?.[field] || '—'}</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                    {!editing ? (
                        <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
                            <Ionicons name="create-outline" size={18} color={Colors.primary} />
                            <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditing(false); setForm({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '', address: user?.address || '', city: user?.city || '', province: user?.province || '' }); }}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                                {loading ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.saveText}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user?.role === 'admin' ? 'Admin' : 'Customer'}</Text>
                    </View>
                </View>

                {/* Fields */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <ProfileField label="First Name" icon="person-outline" field="first_name" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ProfileField label="Last Name" icon="person-outline" field="last_name" />
                        </View>
                    </View>
                    <ProfileField label="Phone Number" icon="call-outline" field="phone" keyboardType="phone-pad" />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Address</Text>
                    <ProfileField label="Address" icon="location-outline" field="address" />
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <ProfileField label="City" icon="business-outline" field="city" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ProfileField label="Province" icon="map-outline" field="province" />
                        </View>
                    </View>
                </View>

                {/* Sign Out */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={styles.version}>Ship2Door v1.0.0</Text>
                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl,
    },
    title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, backgroundColor: Colors.primaryFaded, borderRadius: BorderRadius.full },
    editText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.primary },
    cancelBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.borderLight },
    cancelText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary },
    saveBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.primary },
    saveText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.white },
    avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
    avatar: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.secondary,
        alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
    },
    avatarText: { fontSize: 28, fontWeight: '800', color: Colors.white },
    userName: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text },
    userEmail: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    roleBadge: { backgroundColor: Colors.primaryFaded, paddingHorizontal: Spacing.md, paddingVertical: 3, borderRadius: BorderRadius.full, marginTop: Spacing.sm },
    roleText: { fontSize: Fonts.sizes.xs, fontWeight: '700', color: Colors.primary },
    card: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.lg,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    sectionTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.lg },
    row: { flexDirection: 'row', gap: Spacing.md },
    fieldGroup: { marginBottom: Spacing.lg },
    fieldLabel: { fontSize: Fonts.sizes.xs, fontWeight: '600', color: Colors.textLight, marginBottom: Spacing.xs },
    fieldDisplay: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    fieldValue: { fontSize: Fonts.sizes.md, color: Colors.text, fontWeight: '500' },
    fieldInput: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.background,
        borderRadius: BorderRadius.sm, borderWidth: 1.5, borderColor: Colors.primary + '40',
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    },
    fieldTextInput: { flex: 1, fontSize: Fonts.sizes.md, color: Colors.text },
    logoutButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        backgroundColor: Colors.errorLight, borderRadius: BorderRadius.lg, padding: Spacing.lg,
        borderWidth: 1, borderColor: Colors.error + '30',
    },
    logoutText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.error },
    version: { textAlign: 'center', fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: Spacing.xl },
});

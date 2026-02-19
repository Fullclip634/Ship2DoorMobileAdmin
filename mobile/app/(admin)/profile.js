import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';

export default function AdminProfile() {
    const { user, logout, updateUser } = useAuth();
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '' });
    const updateField = (k, v) => setForm({ ...form, [k]: v });
    const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await api.put(API_ENDPOINTS.UPDATE_PROFILE, form);
            if (res.success) { await updateUser(res.data); setEditing(false); Alert.alert('Success', 'Profile updated'); }
        } catch (e) { Alert.alert('Error', e.message); } finally { setLoading(false); }
    };

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
        ]);
    };

    return (
        <SafeAreaView style={s.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
                <View style={s.header}>
                    <Text style={s.title}>Admin Profile</Text>
                    {!editing ? (
                        <TouchableOpacity style={s.editBtn} onPress={() => setEditing(true)}>
                            <Ionicons name="create-outline" size={18} color={Colors.secondary} />
                            <Text style={s.editText}>Edit</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity style={s.cancelBtn} onPress={() => { setEditing(false); setForm({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '' }); }}>
                                <Text style={s.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={loading}>
                                {loading ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={s.saveText}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={s.avatarSection}>
                    <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
                    <Text style={s.userName}>{user?.first_name} {user?.last_name}</Text>
                    <Text style={s.userEmail}>{user?.email}</Text>
                    <View style={s.roleBadge}><Text style={s.roleText}>Administrator</Text></View>
                </View>

                <View style={s.card}>
                    <Text style={s.sectionTitle}>Personal Information</Text>
                    {editing ? (
                        <>
                            <View style={s.inputGroup}><Text style={s.label}>First Name</Text><TextInput style={s.input} value={form.first_name} onChangeText={v => updateField('first_name', v)} /></View>
                            <View style={s.inputGroup}><Text style={s.label}>Last Name</Text><TextInput style={s.input} value={form.last_name} onChangeText={v => updateField('last_name', v)} /></View>
                            <View style={s.inputGroup}><Text style={s.label}>Phone</Text><TextInput style={s.input} value={form.phone} onChangeText={v => updateField('phone', v)} keyboardType="phone-pad" /></View>
                        </>
                    ) : (
                        <>
                            <View style={s.infoRow}><Ionicons name="person-outline" size={18} color={Colors.textSecondary} /><Text style={s.infoVal}>{user?.first_name} {user?.last_name}</Text></View>
                            <View style={s.infoRow}><Ionicons name="mail-outline" size={18} color={Colors.textSecondary} /><Text style={s.infoVal}>{user?.email}</Text></View>
                            <View style={s.infoRow}><Ionicons name="call-outline" size={18} color={Colors.textSecondary} /><Text style={s.infoVal}>{user?.phone || '—'}</Text></View>
                        </>
                    )}
                </View>

                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={s.logoutText}>Sign Out</Text>
                </TouchableOpacity>
                <Text style={s.version}>Ship2Door Admin v1.0.0</Text>
                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
    title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, backgroundColor: Colors.secondaryFaded, borderRadius: BorderRadius.full },
    editText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.secondary },
    cancelBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.borderLight },
    cancelText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary },
    saveBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.secondary },
    saveText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.white },
    avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
    avatarText: { fontSize: 28, fontWeight: '800', color: Colors.white },
    userName: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text },
    userEmail: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    roleBadge: { backgroundColor: Colors.secondaryFaded, paddingHorizontal: Spacing.md, paddingVertical: 3, borderRadius: BorderRadius.full, marginTop: Spacing.sm },
    roleText: { fontSize: Fonts.sizes.xs, fontWeight: '700', color: Colors.secondary },
    card: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.lg, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    sectionTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.lg },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
    infoVal: { fontSize: Fonts.sizes.md, color: Colors.text, fontWeight: '500' },
    inputGroup: { marginBottom: Spacing.md },
    label: { fontSize: Fonts.sizes.xs, fontWeight: '600', color: Colors.textLight, marginBottom: Spacing.xs },
    input: { backgroundColor: Colors.background, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.secondary + '40', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: Fonts.sizes.md, color: Colors.text },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.errorLight, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.error + '30' },
    logoutText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.error },
    version: { textAlign: 'center', fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: Spacing.xl },
});

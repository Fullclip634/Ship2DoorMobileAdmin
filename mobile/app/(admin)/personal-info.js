import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';

const ProfileField = ({ label, icon, value, onChangeText, editable, ...props }) => (
    <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={[styles.fieldInput, !editable && styles.fieldInputDisabled]}>
            <MaterialCommunityIcons name={icon} size={18} color={Colors.textLight} />
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

function PersonalInformation() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || '',
    });

    const updateField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!form.first_name.trim() || !form.last_name.trim()) {
            Alert.alert('Error', 'First name and last name are required.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.put(API_ENDPOINTS.UPDATE_PROFILE, form);
            if (res.success) {
                await updateUser(res.data);
                setIsEditing(false);
                Alert.alert('Success', 'Profile updated successfully');
            }
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setForm({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            phone: user?.phone || '',
        });
        setIsEditing(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Personal Information</Text>
                    {!isEditing ? (
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <ProfileField label="First Name" icon="account-outline" value={form.first_name} onChangeText={v => updateField('first_name', v)} editable={isEditing} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ProfileField label="Last Name" icon="account-outline" value={form.last_name} onChangeText={v => updateField('last_name', v)} editable={isEditing} />
                            </View>
                        </View>
                        <ProfileField label="Phone Number" icon="phone-outline" value={form.phone} onChangeText={v => updateField('phone', v)} keyboardType="phone-pad" editable={isEditing} />

                        {isEditing && (
                            <View style={styles.editActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={loading}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: Colors.secondary }]} onPress={handleSave} disabled={loading}>
                                    {loading ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.saveText}>Save Changes</Text>}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <Text style={styles.infoText}>
                        Administrator contact details. These are visible internally for system management.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default PersonalInformation;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
    editBtnText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.secondary, width: 40, textAlign: 'right' },
    content: { padding: Spacing.lg },
    card: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg,
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
    editActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
    cancelBtn: { flex: 1, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.border },
    cancelText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary },
    saveBtn: { flex: 1, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, shadowColor: Colors.mid, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    saveText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.white },
    infoText: {
        fontSize: Fonts.sizes.xs, color: Colors.textLight, textAlign: 'center',
        marginTop: Spacing.xl, paddingHorizontal: Spacing.xl, lineHeight: 18,
    },
});

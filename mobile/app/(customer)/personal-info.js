import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
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

function PersonalInformation() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        province: user?.province || '',
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
            address: user?.address || '',
            city: user?.city || '',
            province: user?.province || '',
        });
        setIsEditing(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
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
                                <ProfileField label="First Name" icon="person-outline" value={form.first_name} onChangeText={v => updateField('first_name', v)} editable={isEditing} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ProfileField label="Last Name" icon="person-outline" value={form.last_name} onChangeText={v => updateField('last_name', v)} editable={isEditing} />
                            </View>
                        </View>
                        <ProfileField label="Phone Number" icon="call-outline" value={form.phone} onChangeText={v => updateField('phone', v)} keyboardType="phone-pad" editable={isEditing} />

                        <View style={styles.divider} />

                        <ProfileField label="Street Address" icon="location-outline" value={form.address} onChangeText={v => updateField('address', v)} editable={isEditing} />
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <ProfileField label="City" icon="business-outline" value={form.city} onChangeText={v => updateField('city', v)} editable={isEditing} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ProfileField label="Province" icon="map-outline" value={form.province} onChangeText={v => updateField('province', v)} editable={isEditing} />
                            </View>
                        </View>

                        {isEditing && (
                            <View style={styles.editActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={loading}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                                    {loading ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.saveText}>Save Changes</Text>}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <Text style={styles.infoText}>
                        This information is used for your shipment bookings and contact details.
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
    editBtnText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.primary, width: 40, textAlign: 'right' },
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
    divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.md },
    editActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
    cancelBtn: { flex: 1, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.border },
    cancelText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary },
    saveBtn: { flex: 1, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    saveText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.white },
    infoText: {
        fontSize: Fonts.sizes.xs, color: Colors.textLight, textAlign: 'center',
        marginTop: Spacing.xl, paddingHorizontal: Spacing.xl, lineHeight: 18,
    },
});

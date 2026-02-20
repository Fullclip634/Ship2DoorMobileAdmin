import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { useAuth } from '../../context/AuthContext';

export default function BookShipment() {
    const { tripId, direction, departureDate } = useLocalSearchParams();
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        item_description: '',
        quantity: '1',
        weight_estimate: '',
        special_instructions: '',
        pickup_address: user?.address || '',
        pickup_city: user?.city || '',
        delivery_address: '',
        delivery_city: '',
        receiver_name: '',
        receiver_phone: '',
    });

    const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
    const dirLabel = direction === 'manila_to_bohol' ? 'Manila to Bohol' : 'Bohol to Manila';
    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const handleSubmit = async () => {
        const { item_description, pickup_address, delivery_address, receiver_name, receiver_phone } = form;
        if (!item_description.trim() || !pickup_address.trim() || !delivery_address.trim() || !receiver_name.trim() || !receiver_phone.trim()) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post(API_ENDPOINTS.ORDERS, {
                trip_id: parseInt(tripId),
                ...form,
                quantity: parseInt(form.quantity) || 1,
            });

            if (res.success) {
                Alert.alert('Success!', 'Your shipment has been booked successfully.', [
                    { text: 'View Orders', onPress: () => router.replace('/(customer)/orders') },
                ]);
            }
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to book shipment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Book Shipment</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    {/* Trip Info Banner */}
                    <View style={styles.tripBanner}>
                        <View style={styles.bannerIcon}>
                            <MaterialCommunityIcons name="ferry" size={20} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.tripBannerDir}>{dirLabel}</Text>
                            <Text style={styles.tripBannerDate}>Departure: {formatDate(departureDate)}</Text>
                        </View>
                    </View>

                    {/* Item Details */}
                    <Text style={styles.sectionTitle}>Item Details</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Item Description <Text style={styles.required}>*</Text></Text>
                        <View style={[styles.inputWrap, { alignItems: 'flex-start' }]}>
                            <MaterialCommunityIcons name="package-variant-closed" size={18} color={Colors.primary} style={[styles.inputIcon, { marginTop: 16 }]} />
                            <TextInput
                                style={[styles.input, styles.inputMultiline]}
                                placeholderTextColor={Colors.textLight}
                                value={form.item_description}
                                onChangeText={(v) => updateField('item_description', v)}
                                placeholder="e.g., 2 boxes of clothes, 1 laptop bag"
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Quantity</Text>
                                <View style={styles.inputWrap}>
                                    <MaterialCommunityIcons name="layers-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholderTextColor={Colors.textLight}
                                        value={form.quantity}
                                        onChangeText={(v) => updateField('quantity', v)}
                                        placeholder="1"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Weight (est.)</Text>
                                <View style={styles.inputWrap}>
                                    <MaterialCommunityIcons name="weight" size={18} color={Colors.primary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholderTextColor={Colors.textLight}
                                        value={form.weight_estimate}
                                        onChangeText={(v) => updateField('weight_estimate', v)}
                                        placeholder="e.g., 5kg"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Special Instructions</Text>
                        <View style={styles.notesWrap}>
                            <TextInput
                                style={styles.notesInput}
                                placeholderTextColor={Colors.textLight}
                                value={form.special_instructions}
                                onChangeText={(v) => updateField('special_instructions', v)}
                                placeholder="e.g., Fragile, handle with care..."
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Pickup Info */}
                    <Text style={styles.sectionTitle}>Pickup Information</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Pickup Address <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrap}>
                            <MaterialCommunityIcons name="map-marker-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={Colors.textLight}
                                value={form.pickup_address}
                                onChangeText={(v) => updateField('pickup_address', v)}
                                placeholder="Full pickup address"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Pickup City</Text>
                        <View style={styles.inputWrap}>
                            <MaterialCommunityIcons name="city-variant-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={Colors.textLight}
                                value={form.pickup_city}
                                onChangeText={(v) => updateField('pickup_city', v)}
                                placeholder="City / Municipality"
                            />
                        </View>
                    </View>

                    {/* Delivery Info */}
                    <Text style={styles.sectionTitle}>Delivery Information</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Delivery Address <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrap}>
                            <MaterialCommunityIcons name="navigation-variant-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={Colors.textLight}
                                value={form.delivery_address}
                                onChangeText={(v) => updateField('delivery_address', v)}
                                placeholder="Full delivery address"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Delivery City</Text>
                        <View style={styles.inputWrap}>
                            <MaterialCommunityIcons name="city-variant-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={Colors.textLight}
                                value={form.delivery_city}
                                onChangeText={(v) => updateField('delivery_city', v)}
                                placeholder="City / Municipality"
                            />
                        </View>
                    </View>

                    {/* Receiver Info */}
                    <Text style={styles.sectionTitle}>Receiver Information</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Receiver Name <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrap}>
                            <MaterialCommunityIcons name="account-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={Colors.textLight}
                                value={form.receiver_name}
                                onChangeText={(v) => updateField('receiver_name', v)}
                                placeholder="Full name of receiver"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Receiver Phone <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrap}>
                            <MaterialCommunityIcons name="phone-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={Colors.textLight}
                                value={form.receiver_phone}
                                onChangeText={(v) => updateField('receiver_phone', v)}
                                placeholder="09XX XXX XXXX"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="check-circle-outline" size={22} color={Colors.white} />
                                <Text style={styles.submitText}>Submit Booking</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    headerTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text },
    content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm },
    tripBanner: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        backgroundColor: Colors.primaryFaded, borderRadius: BorderRadius.lg, padding: Spacing.lg,
        borderLeftWidth: 4, borderLeftColor: Colors.primary, marginBottom: Spacing.md,
    },
    bannerIcon: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white,
        alignItems: 'center', justifyContent: 'center',
    },
    tripBannerDir: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
    tripBannerDate: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    sectionTitle: {
        fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.secondary,
        marginBottom: Spacing.md, marginTop: Spacing.xl,
        textTransform: 'uppercase', letterSpacing: 0.5,
    },
    row: { flexDirection: 'row', gap: Spacing.md },
    fieldGroup: { marginBottom: Spacing.lg },
    label: {
        fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text,
        marginBottom: Spacing.sm, marginLeft: 2, letterSpacing: 0.2,
    },
    required: { color: Colors.error, fontWeight: '400' },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
        borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border,
        paddingHorizontal: Spacing.lg, minHeight: 52,
    },
    inputIcon: { marginRight: Spacing.sm },
    input: { flex: 1, fontSize: Fonts.sizes.md, color: Colors.text, paddingVertical: Spacing.md },
    inputMultiline: { minHeight: 70, textAlignVertical: 'top', paddingTop: Spacing.md },
    notesWrap: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.md,
        borderWidth: 1.5, borderColor: Colors.border, overflow: 'hidden',
    },
    notesInput: {
        fontSize: Fonts.sizes.md, color: Colors.text,
        paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.lg,
        minHeight: 100, textAlignVertical: 'top', lineHeight: 22,
    },
    submitButton: {
        flexDirection: 'row', backgroundColor: Colors.primary, height: 56, borderRadius: BorderRadius.lg,
        alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.xl,
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    submitDisabled: { opacity: 0.7 },
    submitText: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.white },
});

import React, { useState, useCallback } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { ArrowLeft, Ship, Package, Layers, Weight, MapPin, Building2, Navigation, User, Phone, CheckCircle, Home, Flag, Map } from 'lucide-react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { useAuth } from '../../context/AuthContext';

// ── Extracted outside render to avoid unmount/remount on each keystroke ──
const Field = React.memo(({ icon: IconComp, label, value, onChangeText, placeholder, required, multiline, keyboardType, iconColor }) => (
    <View style={styles.fieldGroup}>
        <Text style={styles.label}>
            {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={[styles.inputWrap, multiline && { alignItems: 'flex-start' }]}>
            <IconComp size={18} color={iconColor || Colors.primary} style={[styles.inputIcon, multiline && { marginTop: 16 }]} />
            <TextInput
                style={[styles.input, multiline && styles.inputMultiline]}
                placeholderTextColor={Colors.textLight}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
                keyboardType={keyboardType || 'default'}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
        </View>
    </View>
));

export default function BookShipment() {
    const { tripId, direction, departureDate } = useLocalSearchParams();
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Determine which side is Manila and which is Bohol
    const isManilaToBohol = direction === 'manila_to_bohol';
    const pickupIsManila = isManilaToBohol;
    const deliveryIsManila = !isManilaToBohol;

    const [form, setForm] = useState({
        item_description: '',
        quantity: '1',
        weight_estimate: '',
        special_instructions: '',
        // Pickup address
        pickup_city: '',
        pickup_street: '',
        pickup_purok: '',
        pickup_barangay: '',
        pickup_province: pickupIsManila ? 'Metro Manila' : 'Bohol',
        pickup_zip_code: '',
        pickup_landmark: '',
        // Delivery address
        delivery_city: '',
        delivery_street: '',
        delivery_purok: '',
        delivery_barangay: '',
        delivery_province: deliveryIsManila ? 'Metro Manila' : 'Bohol',
        delivery_zip_code: '',
        delivery_landmark: '',
        // Receiver
        receiver_name: '',
        receiver_phone: '',
        receiver_fb_name: '',
        // Sender
        sender_name: user ? `${user.first_name} ${user.last_name}` : '',
        sender_phone: user?.phone || '',
    });

    const updateField = useCallback((key, value) => setForm(prev => ({ ...prev, [key]: value })), []);
    const dirLabel = isManilaToBohol ? 'Manila to Bohol' : 'Bohol to Manila';
    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const handleSubmit = async () => {
        const { item_description, pickup_barangay, pickup_province, pickup_landmark,
            delivery_barangay, delivery_province, delivery_landmark,
            receiver_name } = form;

        if (!item_description.trim()) {
            Alert.alert('Missing Fields', 'Please fill in the item description.');
            return;
        }
        if (!pickup_barangay.trim() || !pickup_province.trim() || !pickup_landmark.trim()) {
            Alert.alert('Missing Fields', 'Please complete all required pickup address fields (barangay, province, landmark).');
            return;
        }
        if (!delivery_barangay.trim() || !delivery_province.trim() || !delivery_landmark.trim()) {
            Alert.alert('Missing Fields', 'Please complete all required delivery address fields (barangay, province, landmark).');
            return;
        }
        if (!receiver_name.trim()) {
            Alert.alert('Missing Fields', 'Please fill in the receiver name.');
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

    // Helper to render an address section inline (no sub-component re-creation)
    const renderAddressSection = (side, isManila) => {
        const prefix = side;
        const sideLabel = side === 'pickup' ? 'Pickup' : 'Delivery';

        return (
            <>
                <Text style={styles.sectionTitle}>{sideLabel} Address</Text>

                {isManila ? (
                    <Field
                        icon={Home}
                        label="Street / House No."
                        value={form[`${prefix}_street`]}
                        onChangeText={(v) => updateField(`${prefix}_street`, v)}
                        placeholder="e.g., 123 Rizal St., Unit 4B"
                        required
                    />
                ) : (
                    <Field
                        icon={Flag}
                        label="Purok"
                        value={form[`${prefix}_purok`]}
                        onChangeText={(v) => updateField(`${prefix}_purok`, v)}
                        placeholder="e.g., Purok 5"
                        required
                    />
                )}

                <Field
                    icon={Building2}
                    label="Barangay"
                    value={form[`${prefix}_barangay`]}
                    onChangeText={(v) => updateField(`${prefix}_barangay`, v)}
                    placeholder="e.g., Brgy. Bool"
                    required
                />

                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Field
                            icon={Building2}
                            label="City / Municipality"
                            value={form[`${prefix}_city`]}
                            onChangeText={(v) => updateField(`${prefix}_city`, v)}
                            placeholder={isManila ? 'e.g., Makati City' : 'e.g., Tagbilaran City'}
                            required
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Field
                            icon={Map}
                            label="Province"
                            value={form[`${prefix}_province`]}
                            onChangeText={(v) => updateField(`${prefix}_province`, v)}
                            placeholder={isManila ? 'Metro Manila' : 'Bohol'}
                            required
                        />
                    </View>
                </View>

                <Field
                    icon={MapPin}
                    label="Zip Code"
                    value={form[`${prefix}_zip_code`]}
                    onChangeText={(v) => updateField(`${prefix}_zip_code`, v)}
                    placeholder="e.g., 6300"
                    keyboardType="numeric"
                />

                <Field
                    icon={Navigation}
                    label="Landmark"
                    value={form[`${prefix}_landmark`]}
                    onChangeText={(v) => updateField(`${prefix}_landmark`, v)}
                    placeholder={isManila ? 'e.g., Near Glorietta Mall' : 'e.g., Near Bool Church'}
                    required
                />
            </>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ArrowLeft size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Book Shipment</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    {/* Trip Info Banner */}
                    <View style={styles.tripBanner}>
                        <View style={styles.bannerIcon}>
                            <Ship size={20} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.tripBannerDir}>{dirLabel}</Text>
                            <Text style={styles.tripBannerDate}>Departure: {formatDate(departureDate)}</Text>
                        </View>
                    </View>

                    {/* Item Details */}
                    <Text style={styles.sectionTitle}>Item Details</Text>

                    <Field
                        icon={Package}
                        label="Item Description"
                        value={form.item_description}
                        onChangeText={(v) => updateField('item_description', v)}
                        placeholder="e.g., 2 boxes of clothes, 1 laptop bag"
                        required
                        multiline
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Field
                                icon={Layers}
                                label="Quantity"
                                value={form.quantity}
                                onChangeText={(v) => updateField('quantity', v)}
                                placeholder="1"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Field
                                icon={Weight}
                                label="Weight (est.)"
                                value={form.weight_estimate}
                                onChangeText={(v) => updateField('weight_estimate', v)}
                                placeholder="e.g., 5kg"
                            />
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

                    {/* Sender Info */}
                    <Text style={styles.sectionTitle}>Sender Information</Text>

                    <Field
                        icon={User}
                        label="Sender Name"
                        value={form.sender_name}
                        onChangeText={(v) => updateField('sender_name', v)}
                        placeholder="Full name of sender"
                    />

                    <Field
                        icon={Phone}
                        label="Sender Phone"
                        value={form.sender_phone}
                        onChangeText={(v) => updateField('sender_phone', v)}
                        placeholder="09XX XXX XXXX"
                        keyboardType="phone-pad"
                    />

                    {/* Pickup Address */}
                    {renderAddressSection('pickup', pickupIsManila)}

                    {/* Delivery Address */}
                    {renderAddressSection('delivery', deliveryIsManila)}

                    {/* Receiver Info */}
                    <Text style={styles.sectionTitle}>Receiver Information</Text>

                    <Field
                        icon={User}
                        label="Receiver Name"
                        value={form.receiver_name}
                        onChangeText={(v) => updateField('receiver_name', v)}
                        placeholder="Full name of receiver"
                        required
                    />

                    <Field
                        icon={Phone}
                        label="Receiver Phone"
                        value={form.receiver_phone}
                        onChangeText={(v) => updateField('receiver_phone', v)}
                        placeholder="09XX XXX XXXX"
                        keyboardType="phone-pad"
                    />

                    <Field
                        icon={User}
                        label="Receiver Facebook Name"
                        value={form.receiver_fb_name}
                        onChangeText={(v) => updateField('receiver_fb_name', v)}
                        placeholder="e.g., Juan Dela Cruz"
                        iconColor={Colors.info}
                    />

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
                                <CheckCircle size={22} color={Colors.white} />
                                <Text style={styles.submitText}>Submit Booking</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 80 }} />
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

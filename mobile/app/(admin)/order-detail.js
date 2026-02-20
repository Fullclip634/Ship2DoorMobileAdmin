import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { ArrowLeft, FileText, XCircle } from 'lucide-react-native';
import Icon from '../../components/LucideIcon';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { StatusBadge, DirectionBadge, LoadingScreen } from '../../components/UIComponents';

export default function AdminOrderDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminNotes, setAdminNotes] = useState('');
    const [pickupDate, setPickupDate] = useState('');

    useEffect(() => { loadOrder(); }, [id]);

    const loadOrder = async () => {
        try {
            const res = await api.get(`${API_ENDPOINTS.ORDERS}/${id}`);
            setOrder(res.data);
            setAdminNotes(res.data.admin_notes || '');
            setPickupDate(res.data.pickup_date || '');
        } catch (e) { Alert.alert('Error', 'Failed to load order'); }
        finally { setLoading(false); }
    };

    const updateStatus = async (status, extra = {}) => {
        const statusLabels = { confirmed: 'Confirm', pickup_scheduled: 'Schedule Pickup', picked_up: 'Mark Picked Up', in_transit: 'Mark In Transit', delivered: 'Mark Delivered', cancelled: 'Cancel' };
        Alert.alert('Update Order', `${statusLabels[status] || 'Update'} this order?`, [
            { text: 'No' },
            {
                text: 'Yes', onPress: async () => {
                    try {
                        await api.patch(`${API_ENDPOINTS.ORDERS}/${id}/status`, { status, admin_notes: adminNotes, ...extra });
                        Alert.alert('✅ Updated', 'Customer has been notified.');
                        loadOrder();
                    } catch (e) { Alert.alert('Error', e.message); }
                },
            },
        ]);
    };

    if (loading) return <LoadingScreen />;
    if (!order) return null;

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    const InfoRow = ({ icon, label, value }) => (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
                <Icon name={icon} size={16} color={Colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || '—'}</Text>
            </View>
        </View>
    );

    const statusButtons = {
        pending: [{ status: 'confirmed', label: 'Confirm Order', icon: 'check-circle', color: Colors.info }],
        confirmed: [{ status: 'pickup_scheduled', label: 'Schedule Pickup', icon: 'calendar-check', color: Colors.indigo }],
        pickup_scheduled: [{ status: 'picked_up', label: 'Mark as Picked Up', icon: 'package', color: Colors.purple }],
        picked_up: [{ status: 'in_transit', label: 'Mark In Transit', icon: 'ship', color: Colors.primary }],
        in_transit: [{ status: 'delivered', label: 'Mark Delivered', icon: 'check-circle', color: Colors.success }],
    };

    const actions = statusButtons[order.status] || [];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Detail</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Order Header */}
                <View style={styles.card}>
                    <View style={styles.cardTop}>
                        <Text style={styles.orderNum}>{order.order_number}</Text>
                        <StatusBadge status={order.status} />
                    </View>
                    <DirectionBadge direction={order.direction} />
                    <Text style={styles.dateText}>Booked: {formatDate(order.created_at)}</Text>
                </View>

                {/* Customer Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Customer</Text>
                    <InfoRow icon="user" label="Name" value={`${order.customer_first_name} ${order.customer_last_name}`} />
                    <InfoRow icon="phone" label="Phone" value={order.customer_phone} />
                    <InfoRow icon="mail" label="Email" value={order.customer_email} />
                </View>

                {/* Item Details */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Item Details</Text>
                    <InfoRow icon="package" label="Description" value={order.item_description} />
                    <InfoRow icon="layers" label="Quantity" value={order.quantity?.toString()} />
                    <InfoRow icon="weight" label="Weight" value={order.weight_estimate} />
                    {order.special_instructions && (
                        <View style={styles.instructionBox}>
                            <FileText size={16} color={Colors.warning} />
                            <Text style={styles.instructionText}>{order.special_instructions}</Text>
                        </View>
                    )}
                </View>

                {/* Pickup & Delivery */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Pickup & Delivery</Text>
                    <InfoRow icon="map-pin" label="Pickup" value={`${order.pickup_address}${order.pickup_city ? `, ${order.pickup_city}` : ''}`} />
                    <InfoRow icon="navigation" label="Deliver To" value={`${order.delivery_address}${order.delivery_city ? `, ${order.delivery_city}` : ''}`} />
                    <InfoRow icon="user" label="Receiver" value={order.receiver_name} />
                    <InfoRow icon="phone" label="Receiver Phone" value={order.receiver_phone} />
                </View>

                {/* Admin Actions */}
                {!['delivered', 'cancelled'].includes(order.status) && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Actions</Text>

                        {/* Pickup date for scheduling */}
                        {order.status === 'confirmed' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Pickup Date (YYYY-MM-DD)</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="e.g., 2026-03-10"
                                    placeholderTextColor={Colors.textLight}
                                    value={pickupDate}
                                    onChangeText={setPickupDate}
                                />
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Admin Notes</Text>
                            <TextInput
                                style={[styles.inputField, { minHeight: 60, textAlignVertical: 'top' }]}
                                placeholder="Internal notes..."
                                placeholderTextColor={Colors.textLight}
                                value={adminNotes}
                                onChangeText={setAdminNotes}
                                multiline
                            />
                        </View>

                        {actions.map((action) => (
                            <TouchableOpacity
                                key={action.status}
                                style={[styles.actionBtn, { backgroundColor: action.color }]}
                                onPress={() => updateStatus(action.status, action.status === 'pickup_scheduled' ? { pickup_date: pickupDate } : {})}
                            >
                                <Icon name={action.icon} size={20} color={Colors.white} />
                                <Text style={styles.actionText}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}

                        {order.status === 'pending' && (
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => updateStatus('cancelled')}>
                                <XCircle size={20} color={Colors.error} />
                                <Text style={styles.cancelText}>Reject Order</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <View style={{ height: 30 }} />
            </ScrollView>
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
    content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
    card: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.lg,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardTop: { flexDirection: 'column', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.md },
    orderNum: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.secondary },
    dateText: { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: Spacing.sm },
    sectionTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.lg },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
    infoIcon: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.secondaryFaded,
        alignItems: 'center', justifyContent: 'center',
    },
    infoLabel: { fontSize: Fonts.sizes.xs, color: Colors.textLight, fontWeight: '500' },
    infoValue: { fontSize: Fonts.sizes.sm, color: Colors.text, fontWeight: '500', marginTop: 1 },
    instructionBox: {
        flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.warningLight,
        borderRadius: BorderRadius.sm, padding: Spacing.md, marginTop: Spacing.sm,
        borderLeftWidth: 3, borderLeftColor: Colors.warning,
    },
    instructionText: { flex: 1, fontSize: Fonts.sizes.sm, color: Colors.text, lineHeight: 20 },
    inputGroup: { marginBottom: Spacing.md },
    inputLabel: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
    inputField: {
        backgroundColor: Colors.background, borderRadius: BorderRadius.sm, padding: Spacing.md,
        fontSize: Fonts.sizes.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border,
    },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        borderRadius: BorderRadius.md, paddingVertical: Spacing.lg, marginBottom: Spacing.sm,
    },
    actionText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.white },
    cancelBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        backgroundColor: Colors.errorLight, borderRadius: BorderRadius.md, paddingVertical: Spacing.md,
        borderWidth: 1, borderColor: Colors.error + '30', marginTop: Spacing.sm,
    },
    cancelText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.error },
});

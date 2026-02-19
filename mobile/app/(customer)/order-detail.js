import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { StatusBadge, DirectionBadge, LoadingScreen } from '../../components/UIComponents';

export default function OrderDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadOrder(); }, [id]);

    const loadOrder = async () => {
        try {
            const res = await api.get(`${API_ENDPOINTS.ORDERS}/${id}`);
            setOrder(res.data);
        } catch (e) {
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
            { text: 'No' },
            {
                text: 'Yes, Cancel',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.patch(`${API_ENDPOINTS.ORDERS}/${id}/cancel`);
                        Alert.alert('Cancelled', 'Order has been cancelled.');
                        loadOrder();
                    } catch (e) {
                        Alert.alert('Error', e.message);
                    }
                },
            },
        ]);
    };

    if (loading) return <LoadingScreen />;
    if (!order) return null;

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    const statusSteps = [
        { key: 'pending', label: 'Pending', icon: 'time' },
        { key: 'confirmed', label: 'Confirmed', icon: 'checkmark' },
        { key: 'pickup_scheduled', label: 'Pickup Scheduled', icon: 'calendar' },
        { key: 'picked_up', label: 'Picked Up', icon: 'cube' },
        { key: 'in_transit', label: 'In Transit', icon: 'boat' },
        { key: 'delivered', label: 'Delivered', icon: 'checkmark-circle' },
    ];

    const currentIndex = statusSteps.findIndex((s) => s.key === order.status);
    const isCancelled = order.status === 'cancelled';

    const InfoRow = ({ icon, label, value }) => (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
                <Ionicons name={icon} size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || '—'}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Order Header */}
                <View style={styles.card}>
                    <View style={styles.cardTop}>
                        <Text style={styles.orderNumber}>{order.order_number}</Text>
                        <StatusBadge status={order.status} />
                    </View>
                    <DirectionBadge direction={order.direction} />
                    <Text style={styles.dateCreated}>Booked on {formatDate(order.created_at)}</Text>
                </View>

                {/* Status Tracker */}
                {!isCancelled && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Order Progress</Text>
                        <View style={styles.tracker}>
                            {statusSteps.map((step, i) => {
                                const isActive = i <= currentIndex;
                                const isCurrent = i === currentIndex;
                                return (
                                    <View key={step.key} style={styles.stepRow}>
                                        <View style={styles.stepIndicator}>
                                            <View style={[styles.stepDot, isActive && styles.stepDotActive, isCurrent && styles.stepDotCurrent]}>
                                                <Ionicons name={step.icon} size={12} color={isActive ? Colors.white : Colors.textLight} />
                                            </View>
                                            {i < statusSteps.length - 1 && (
                                                <View style={[styles.stepLine, isActive && styles.stepLineActive]} />
                                            )}
                                        </View>
                                        <Text style={[styles.stepLabel, isActive && styles.stepLabelActive, isCurrent && styles.stepLabelCurrent]}>
                                            {step.label}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Item Details */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Item Details</Text>
                    <InfoRow icon="cube-outline" label="Description" value={order.item_description} />
                    <InfoRow icon="layers-outline" label="Quantity" value={order.quantity?.toString()} />
                    <InfoRow icon="barbell-outline" label="Weight" value={order.weight_estimate} />
                    {order.special_instructions && (
                        <InfoRow icon="document-text-outline" label="Instructions" value={order.special_instructions} />
                    )}
                </View>

                {/* Pickup & Delivery */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Pickup & Delivery</Text>
                    <InfoRow icon="location-outline" label="Pickup Address" value={`${order.pickup_address}${order.pickup_city ? `, ${order.pickup_city}` : ''}`} />
                    {order.pickup_date && <InfoRow icon="calendar-outline" label="Pickup Date" value={`${formatDate(order.pickup_date)}${order.pickup_time_slot ? ` (${order.pickup_time_slot})` : ''}`} />}
                    <View style={styles.divider} />
                    <InfoRow icon="navigate-outline" label="Delivery Address" value={`${order.delivery_address}${order.delivery_city ? `, ${order.delivery_city}` : ''}`} />
                    <InfoRow icon="person-outline" label="Receiver" value={order.receiver_name} />
                    <InfoRow icon="call-outline" label="Receiver Phone" value={order.receiver_phone} />
                </View>

                {/* Admin Notes */}
                {order.admin_notes && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Notes from Ship2Door</Text>
                        <Text style={styles.adminNotes}>{order.admin_notes}</Text>
                    </View>
                )}

                {/* Cancel Button */}
                {order.status === 'pending' && (
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
                        <Text style={styles.cancelText}>Cancel Order</Text>
                    </TouchableOpacity>
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
    orderNumber: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.secondary },
    dateCreated: { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: Spacing.sm },
    sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.lg },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.lg },
    infoIcon: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryFaded,
        alignItems: 'center', justifyContent: 'center',
    },
    infoLabel: { fontSize: Fonts.sizes.xs, color: Colors.textLight, fontWeight: '500' },
    infoValue: { fontSize: Fonts.sizes.md, color: Colors.text, fontWeight: '500', marginTop: 2 },
    divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },
    tracker: { marginLeft: 4 },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.lg },
    stepIndicator: { alignItems: 'center', width: 28 },
    stepDot: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.borderLight,
        alignItems: 'center', justifyContent: 'center',
    },
    stepDotActive: { backgroundColor: Colors.primary },
    stepDotCurrent: { backgroundColor: Colors.secondary, borderWidth: 2, borderColor: Colors.primary },
    stepLine: { width: 2, height: 20, backgroundColor: Colors.borderLight, marginVertical: 2 },
    stepLineActive: { backgroundColor: Colors.primary },
    stepLabel: { fontSize: Fonts.sizes.sm, color: Colors.textLight, fontWeight: '500', paddingTop: 5 },
    stepLabelActive: { color: Colors.text },
    stepLabelCurrent: { fontWeight: '700', color: Colors.secondary },
    adminNotes: { fontSize: Fonts.sizes.md, color: Colors.text, lineHeight: 22, fontStyle: 'italic' },
    cancelButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        backgroundColor: Colors.errorLight, borderRadius: BorderRadius.lg, padding: Spacing.lg,
        borderWidth: 1, borderColor: Colors.error + '30',
    },
    cancelText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.error },
});

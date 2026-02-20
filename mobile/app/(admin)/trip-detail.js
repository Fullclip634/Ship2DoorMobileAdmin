import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { StatusBadge, DirectionBadge, LoadingScreen, EmptyState } from '../../components/UIComponents';

export default function AdminTripDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [trip, setTrip] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDelay, setShowDelay] = useState(false);
    const [delayReason, setDelayReason] = useState('');

    useEffect(() => { loadData(); }, [id]);

    const loadData = async () => {
        try {
            const [tripRes, ordersRes] = await Promise.all([
                api.get(`${API_ENDPOINTS.TRIPS}/${id}`),
                api.get(`${API_ENDPOINTS.ORDERS}?trip_id=${id}`),
            ]);
            setTrip(tripRes.data);
            setOrders(ordersRes.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const updateStatus = async (status) => {
        Alert.alert('Update Status', `Change trip status to "${status.replace(/_/g, ' ')}"?`, [
            { text: 'Cancel' },
            {
                text: 'Update', onPress: async () => {
                    try {
                        await api.patch(`${API_ENDPOINTS.TRIPS}/${id}/status`, { status });
                        Alert.alert('✅ Updated', 'All customers on this trip have been notified.');
                        loadData();
                    } catch (e) { Alert.alert('Error', e.message); }
                },
            },
        ]);
    };

    const sendDelay = async () => {
        if (!delayReason.trim()) { Alert.alert('Required', 'Please enter a delay reason.'); return; }
        try {
            await api.patch(`${API_ENDPOINTS.TRIPS}/${id}/status`, { status: trip.status, delay_reason: delayReason });
            Alert.alert('✅ Sent', 'Delay notification sent to all customers.');
            setShowDelay(false);
            setDelayReason('');
        } catch (e) { Alert.alert('Error', e.message); }
    };

    if (loading) return <LoadingScreen />;
    if (!trip) return null;

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const statusFlow = ['upcoming', 'pickup_phase', 'in_transit', 'boarding_ship', 'at_sea', 'arrived', 'delivering', 'completed'];
    const currentIdx = statusFlow.indexOf(trip.status);
    const nextStatus = currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Trip</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Trip Info */}
                <View style={styles.card}>
                    <View style={styles.cardTop}>
                        <DirectionBadge direction={trip.direction} />
                        <StatusBadge status={trip.status} />
                    </View>
                    <View style={styles.dateRow}>
                        <MaterialCommunityIcons name="calendar" size={18} color={Colors.primary} />
                        <Text style={styles.dateText}>Departure: {formatDate(trip.departure_date)}</Text>
                    </View>
                    {trip.estimated_arrival && (
                        <View style={[styles.dateRow, { marginTop: 6 }]}>
                            <MaterialCommunityIcons name="flag" size={18} color={Colors.success} />
                            <Text style={styles.dateText}>Arrival: {formatDate(trip.estimated_arrival)}</Text>
                        </View>
                    )}
                </View>

                {/* Status Actions */}
                {trip.status !== 'completed' && trip.status !== 'cancelled' && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Trip Actions</Text>

                        {nextStatus && (
                            <TouchableOpacity style={styles.statusBtn} onPress={() => updateStatus(nextStatus)}>
                                <MaterialCommunityIcons name="arrow-right-circle" size={22} color={Colors.white} />
                                <Text style={styles.statusBtnText}>
                                    Move to: {nextStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.delayBtn} onPress={() => setShowDelay(!showDelay)}>
                            <MaterialCommunityIcons name="alert" size={20} color={Colors.warning} />
                            <Text style={styles.delayBtnText}>Send Delay Notice</Text>
                        </TouchableOpacity>

                        {showDelay && (
                            <View style={styles.delayForm}>
                                <TextInput
                                    style={styles.delayInput}
                                    placeholder="Reason for delay (e.g., rough seas, port congestion)..."
                                    placeholderTextColor={Colors.textLight}
                                    value={delayReason}
                                    onChangeText={setDelayReason}
                                    multiline
                                    numberOfLines={3}
                                />
                                <TouchableOpacity style={styles.delaySendBtn} onPress={sendDelay}>
                                    <Text style={styles.delaySendText}>Send to All Customers</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Orders on This Trip */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Orders ({orders.length})</Text>
                    {orders.length === 0 ? (
                        <Text style={styles.noOrders}>No orders on this trip yet.</Text>
                    ) : (
                        orders.map((order) => (
                            <TouchableOpacity
                                key={order.id} style={styles.orderItem}
                                onPress={() => router.push({ pathname: '/(admin)/order-detail', params: { id: order.id } })}
                                activeOpacity={0.7}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.orderNum}>{order.order_number}</Text>
                                    <Text style={styles.orderCustomer}>{order.customer_first_name} {order.customer_last_name}</Text>
                                    <Text style={styles.orderDesc} numberOfLines={1}>{order.item_description}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <StatusBadge status={order.status} size="sm" />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

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
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dateText: { fontSize: Fonts.sizes.md, color: Colors.text, fontWeight: '500' },
    sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.lg },
    statusBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        backgroundColor: Colors.secondary, borderRadius: BorderRadius.md, paddingVertical: Spacing.lg, marginBottom: Spacing.md,
    },
    statusBtnText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.white },
    delayBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        backgroundColor: Colors.warningLight, borderRadius: BorderRadius.md, paddingVertical: Spacing.md,
        borderWidth: 1, borderColor: Colors.warning + '40',
    },
    delayBtnText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.warning },
    delayForm: { marginTop: Spacing.md },
    delayInput: {
        backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: Spacing.md,
        fontSize: Fonts.sizes.md, color: Colors.text, minHeight: 80, textAlignVertical: 'top',
        borderWidth: 1, borderColor: Colors.border,
    },
    delaySendBtn: {
        backgroundColor: Colors.warning, borderRadius: BorderRadius.md, paddingVertical: Spacing.md,
        alignItems: 'center', marginTop: Spacing.md,
    },
    delaySendText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.white },
    noOrders: { fontSize: Fonts.sizes.sm, color: Colors.textLight, fontStyle: 'italic' },
    orderItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    },
    orderNum: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.secondary },
    orderCustomer: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, marginTop: 1 },
    orderDesc: { fontSize: Fonts.sizes.sm, color: Colors.text, marginTop: 2 },
});

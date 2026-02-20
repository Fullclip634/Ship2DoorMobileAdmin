import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Plus, Truck, ChevronRight, PlusCircle, Users, Megaphone } from 'lucide-react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { StatCard, StatusBadge, DirectionBadge, SectionHeader } from '../../components/UIComponents';

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ active_trips: 0, pending_orders: 0, total_customers: 0, total_delivered: 0, today_pickups: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [activeTrips, setActiveTrips] = useState([]);

    const loadData = async () => {
        try {
            const [statsRes, ordersRes, tripsRes] = await Promise.all([
                api.get(API_ENDPOINTS.DASHBOARD),
                api.get(API_ENDPOINTS.ORDERS),
                api.get(API_ENDPOINTS.UPCOMING_TRIPS),
            ]);
            setStats(statsRes.data || {});
            setRecentOrders((ordersRes.data || []).slice(0, 5));
            setActiveTrips((tripsRes.data || []).slice(0, 3));
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.secondary} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Ship<Text style={styles.greetingAccent}>2</Text>Door Admin</Text>
                        <Text style={styles.headerSub}>Welcome back, {user?.first_name}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => router.push('/(admin)/create-trip')}
                    >
                        <Plus size={24} color={Colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Stats Row 1 */}
                <View style={styles.statsRow}>
                    <StatCard icon="ship" label="Active Trips" value={stats.active_trips} color={Colors.info} />
                    <StatCard icon="clock" label="Pending Orders" value={stats.pending_orders} color={Colors.warning} />
                </View>

                {/* Stats Row 2 */}
                <View style={styles.statsRow}>
                    <StatCard icon="users" label="Customers" value={stats.total_customers} color={Colors.secondary} />
                    <StatCard icon="check-circle" label="Delivered" value={stats.total_delivered} color={Colors.success} />
                </View>

                {/* Today's Pickups */}
                {stats.today_pickups > 0 && (
                    <View style={styles.pickupBanner}>
                        <Truck size={22} color={Colors.white} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.pickupTitle}>{stats.today_pickups} Pickup{stats.today_pickups > 1 ? 's' : ''} Today</Text>
                            <Text style={styles.pickupSub}>Items scheduled for pickup today</Text>
                        </View>
                        <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
                    </View>
                )}

                {/* Quick Actions */}
                <View style={styles.quickRow}>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/(admin)/create-trip')}>
                        <PlusCircle size={20} color={Colors.secondary} />
                        <Text style={styles.quickText}>New Trip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/(admin)/customers')}>
                        <Users size={20} color={Colors.secondary} />
                        <Text style={styles.quickText}>Customers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/(admin)/announcements')}>
                        <Megaphone size={20} color={Colors.secondary} />
                        <Text style={styles.quickText}>Announce</Text>
                    </TouchableOpacity>
                </View>

                {/* Active Trips */}
                <SectionHeader title="Active Trips" actionText="See All" onAction={() => router.push('/(admin)/trips')} />
                {activeTrips.map((trip) => (
                    <TouchableOpacity
                        key={trip.id} style={styles.tripCard}
                        onPress={() => router.push({ pathname: '/(admin)/trip-detail', params: { id: trip.id } })}
                        activeOpacity={0.7}
                    >
                        <View style={styles.tripTop}>
                            <DirectionBadge direction={trip.direction} />
                            <StatusBadge status={trip.status} size="sm" />
                        </View>
                        <View style={styles.tripMeta}>
                            <Text style={styles.tripDate}>{formatDate(trip.departure_date)}</Text>
                            <Text style={styles.tripOrders}>{trip.order_count || 0} orders</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Recent Orders */}
                <SectionHeader title="Recent Orders" actionText="See All" onAction={() => router.push('/(admin)/orders')} />
                {recentOrders.map((order) => (
                    <TouchableOpacity
                        key={order.id} style={styles.orderCard}
                        onPress={() => router.push({ pathname: '/(admin)/order-detail', params: { id: order.id } })}
                        activeOpacity={0.7}
                    >
                        <View style={styles.orderTop}>
                            <View>
                                <Text style={styles.orderNum}>{order.order_number}</Text>
                                <Text style={styles.orderCustomer}>{order.customer_first_name} {order.customer_last_name}</Text>
                            </View>
                            <StatusBadge status={order.status} size="sm" />
                        </View>
                        <Text style={styles.orderItem} numberOfLines={1}>{order.item_description}</Text>
                    </TouchableOpacity>
                ))}

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
    },
    greeting: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.secondary, letterSpacing: -0.5 },
    greetingAccent: { color: Colors.primary },
    headerSub: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    addBtn: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.md, marginTop: Spacing.md },
    pickupBanner: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        backgroundColor: Colors.primary, marginHorizontal: Spacing.xl, marginTop: Spacing.lg,
        borderRadius: BorderRadius.lg, padding: Spacing.lg,
    },
    pickupTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.white },
    pickupSub: { fontSize: Fonts.sizes.xs, color: 'rgba(255,255,255,0.8)' },
    quickRow: {
        flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.md, marginTop: Spacing.xl,
    },
    quickBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: Colors.secondaryFaded, borderRadius: BorderRadius.md, paddingVertical: Spacing.md,
    },
    quickText: { fontSize: Fonts.sizes.xs, fontWeight: '700', color: Colors.secondary },
    tripCard: {
        backgroundColor: Colors.white, marginHorizontal: Spacing.xl, marginBottom: Spacing.sm,
        borderRadius: BorderRadius.lg, padding: Spacing.lg,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    },
    tripTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
    tripMeta: { flexDirection: 'row', justifyContent: 'space-between' },
    tripDate: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: '500' },
    tripOrders: { fontSize: Fonts.sizes.sm, color: Colors.primary, fontWeight: '600' },
    orderCard: {
        backgroundColor: Colors.white, marginHorizontal: Spacing.xl, marginBottom: Spacing.sm,
        borderRadius: BorderRadius.lg, padding: Spacing.lg,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    },
    orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xs },
    orderNum: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.secondary },
    orderCustomer: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, marginTop: 1 },
    orderItem: { fontSize: Fonts.sizes.sm, color: Colors.text, fontWeight: '500' },
});

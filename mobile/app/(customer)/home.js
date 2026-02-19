import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { StatusBadge, DirectionBadge, EmptyState, SectionHeader } from '../../components/UIComponents';

export default function CustomerHome() {
    const { user } = useAuth();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [upcomingTrips, setUpcomingTrips] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadData = async () => {
        try {
            const [tripsRes, ordersRes, announcementsRes, notifsRes] = await Promise.all([
                api.get(API_ENDPOINTS.UPCOMING_TRIPS),
                api.get(API_ENDPOINTS.ORDERS),
                api.get(API_ENDPOINTS.ANNOUNCEMENTS),
                api.get(API_ENDPOINTS.NOTIFICATIONS),
            ]);
            setUpcomingTrips(tripsRes.data?.slice(0, 3) || []);
            setActiveOrders((ordersRes.data || []).filter((o) => !['delivered', 'cancelled'].includes(o.status)).slice(0, 3));
            setAnnouncements(announcementsRes.data?.slice(0, 2) || []);
            setUnreadCount(notifsRes.data?.unread_count || 0);
        } catch (error) {
            console.error('Load data error:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello, {user?.first_name} 👋</Text>
                        <Text style={styles.headerSub}>Manila — Bohol Cargo Delivery</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.notifButton}
                        onPress={() => router.push('/(customer)/notifications')}
                    >
                        <Ionicons name="notifications-outline" size={24} color={Colors.text} />
                        {unreadCount > 0 && (
                            <View style={styles.notifBadge}>
                                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(customer)/trips')}>
                        <View style={[styles.quickIcon, { backgroundColor: Colors.primaryFaded }]}>
                            <Ionicons name="boat-outline" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.quickLabel}>View Trips</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(customer)/orders')}>
                        <View style={[styles.quickIcon, { backgroundColor: Colors.secondaryFaded }]}>
                            <Ionicons name="cube-outline" size={24} color={Colors.secondary} />
                        </View>
                        <Text style={styles.quickLabel}>My Orders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(customer)/notifications')}>
                        <View style={[styles.quickIcon, { backgroundColor: Colors.successLight }]}>
                            <Ionicons name="notifications-outline" size={24} color={Colors.success} />
                        </View>
                        <Text style={styles.quickLabel}>Alerts</Text>
                    </TouchableOpacity>
                </View>

                {/* Announcements */}
                {announcements.length > 0 && (
                    <>
                        <SectionHeader title="Announcements" />
                        {announcements.map((a) => (
                            <View key={a.id} style={styles.announcementCard}>
                                <View style={styles.announcementIcon}>
                                    <Ionicons name="megaphone" size={18} color={Colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.announcementTitle}>{a.title}</Text>
                                    <Text style={styles.announcementMsg} numberOfLines={2}>{a.message}</Text>
                                    <Text style={styles.announcementDate}>{formatDate(a.created_at)}</Text>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {/* Upcoming Trips */}
                <SectionHeader
                    title="Upcoming Trips"
                    actionText="See All"
                    onAction={() => router.push('/(customer)/trips')}
                />
                {upcomingTrips.length === 0 ? (
                    <EmptyState icon="boat-outline" title="No Upcoming Trips" message="Check back later for new trip schedules." />
                ) : (
                    upcomingTrips.map((trip) => (
                        <TouchableOpacity
                            key={trip.id}
                            style={styles.tripCard}
                            onPress={() => router.push({ pathname: '/(customer)/trip-detail', params: { id: trip.id } })}
                            activeOpacity={0.7}
                        >
                            <View style={styles.tripTop}>
                                <DirectionBadge direction={trip.direction} />
                                <StatusBadge status={trip.status} size="sm" />
                            </View>
                            <View style={styles.tripInfo}>
                                <View style={styles.tripDateRow}>
                                    <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                                    <Text style={styles.tripDate}>Departure: {formatDate(trip.departure_date)}</Text>
                                </View>
                                {trip.estimated_arrival && (
                                    <View style={styles.tripDateRow}>
                                        <Ionicons name="flag-outline" size={16} color={Colors.textSecondary} />
                                        <Text style={styles.tripDate}>Est. Arrival: {formatDate(trip.estimated_arrival)}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.tripFooter}>
                                <Text style={styles.bookNow}>Book Shipment</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {/* Active Orders */}
                {activeOrders.length > 0 && (
                    <>
                        <SectionHeader
                            title="Active Orders"
                            actionText="See All"
                            onAction={() => router.push('/(customer)/orders')}
                        />
                        {activeOrders.map((order) => (
                            <TouchableOpacity
                                key={order.id}
                                style={styles.orderCard}
                                onPress={() => router.push({ pathname: '/(customer)/order-detail', params: { id: order.id } })}
                                activeOpacity={0.7}
                            >
                                <View style={styles.orderTop}>
                                    <Text style={styles.orderNumber}>{order.order_number}</Text>
                                    <StatusBadge status={order.status} size="sm" />
                                </View>
                                <Text style={styles.orderItem} numberOfLines={1}>{order.item_description}</Text>
                                <Text style={styles.orderMeta}>
                                    {order.receiver_name} • {formatDate(order.created_at)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
    },
    greeting: {
        fontSize: Fonts.sizes.xxl,
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: -0.5,
    },
    headerSub: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
        marginTop: 2,
    },
    notifButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    notifBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: Colors.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    notifBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: '700',
    },
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.xl,
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    quickCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.lg,
        alignItems: 'center',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    quickIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    quickLabel: {
        fontSize: Fonts.sizes.xs,
        fontWeight: '600',
        color: Colors.text,
    },
    announcementCard: {
        flexDirection: 'row',
        backgroundColor: Colors.primaryFaded,
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.sm,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        gap: Spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
    },
    announcementIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    announcementTitle: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 2,
    },
    announcementMsg: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    announcementDate: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textLight,
        marginTop: 4,
    },
    tripCard: {
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    tripTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    tripInfo: {
        gap: 6,
        marginBottom: Spacing.md,
    },
    tripDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tripDate: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    tripFooter: {
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        paddingTop: Spacing.md,
    },
    bookNow: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '700',
        color: Colors.primary,
    },
    orderCard: {
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    orderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    orderNumber: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '700',
        color: Colors.secondary,
    },
    orderItem: {
        fontSize: Fonts.sizes.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    orderMeta: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textLight,
    },
});

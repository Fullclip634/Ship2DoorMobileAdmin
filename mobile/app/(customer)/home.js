import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Bell, Ship, Package, Megaphone, Calendar, Flag } from 'lucide-react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { StatusBadge, DirectionBadge, EmptyState, SectionHeader } from '../../components/UIComponents';
import { TripSkeleton, OrderSkeleton } from '../../components/SkeletonLoader';
import AnimatedPressable from '../../components/AnimatedPressable';

export default function CustomerHome() {
    const { user } = useAuth();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [upcomingTrips, setUpcomingTrips] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

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
        } finally {
            setLoading(false);
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
                        <Bell size={24} color={Colors.text} />
                        {unreadCount > 0 && (
                            <View style={styles.notifBadge}>
                                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <AnimatedPressable scaleTo={0.96} style={styles.quickCard} onPress={() => router.push('/(customer)/trips')}>
                        <View style={[styles.quickIcon, { backgroundColor: Colors.primaryFaded }]}>
                            <Ship size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.quickLabel}>View Trips</Text>
                    </AnimatedPressable>
                    <AnimatedPressable scaleTo={0.96} style={styles.quickCard} onPress={() => router.push('/(customer)/orders')}>
                        <View style={[styles.quickIcon, { backgroundColor: Colors.secondaryFaded }]}>
                            <Package size={24} color={Colors.secondary} />
                        </View>
                        <Text style={styles.quickLabel}>My Orders</Text>
                    </AnimatedPressable>
                    <AnimatedPressable scaleTo={0.96} style={styles.quickCard} onPress={() => router.push('/(customer)/notifications')}>
                        <View style={[styles.quickIcon, { backgroundColor: Colors.successLight }]}>
                            <Bell size={24} color={Colors.success} />
                        </View>
                        <Text style={styles.quickLabel}>Alerts</Text>
                    </AnimatedPressable>
                </View>

                {/* Announcements */}
                {announcements.length > 0 && (
                    <>
                        <SectionHeader title="Announcements" />
                        {announcements.map((a) => (
                            <View key={a.id} style={styles.announcementCard}>
                                <View style={styles.announcementIcon}>
                                    <Megaphone size={20} color={Colors.primary} />
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
                {loading ? (
                    <View style={{ paddingHorizontal: Spacing.xl }}>
                        <TripSkeleton />
                        <TripSkeleton />
                    </View>
                ) : upcomingTrips.length === 0 ? (
                    <EmptyState icon="ship" title="No Upcoming Trips" message="Check back later for new trip schedules." />
                ) : (
                    upcomingTrips.map((trip) => (
                        <AnimatedPressable
                            key={trip.id}
                            style={styles.tripCard}
                            onPress={() => router.push({ pathname: '/(customer)/trip-detail', params: { id: trip.id } })}
                        >
                            <View style={styles.tripTop}>
                                <DirectionBadge direction={trip.direction} />
                                <StatusBadge status={trip.status} size="sm" />
                            </View>
                            <View style={styles.tripInfo}>
                                <View style={styles.tripDateRow}>
                                    <Calendar size={16} color={Colors.textSecondary} />
                                    <Text style={styles.tripDate}>Departure: {formatDate(trip.departure_date)}</Text>
                                </View>
                                {trip.estimated_arrival && (
                                    <View style={styles.tripDateRow}>
                                        <Flag size={16} color={Colors.textSecondary} />
                                        <Text style={styles.tripDate}>Est. Arrival: {formatDate(trip.estimated_arrival)}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.tripFooter}>
                                <Text style={styles.bookNow}>Book Shipment</Text>
                            </View>
                        </AnimatedPressable>
                    ))
                )}

                {/* Active Orders */}
                {(loading || activeOrders.length > 0) && (
                    <>
                        <SectionHeader
                            title="Active Orders"
                            actionText="See All"
                            onAction={() => router.push('/(customer)/orders')}
                        />
                        {loading ? (
                            <View style={{ paddingHorizontal: Spacing.xl }}>
                                <OrderSkeleton />
                                <OrderSkeleton />
                            </View>
                        ) : (
                            activeOrders.map((order) => (
                                <AnimatedPressable
                                    key={order.id}
                                    style={styles.orderCard}
                                    onPress={() => router.push({ pathname: '/(customer)/order-detail', params: { id: order.id } })}
                                >
                                    <View style={styles.orderTop}>
                                        <Text style={styles.orderNumber}>{order.order_number}</Text>
                                        <StatusBadge status={order.status} size="sm" />
                                    </View>
                                    <Text style={styles.orderItem} numberOfLines={1}>{order.item_description}</Text>
                                    <Text style={styles.orderMeta}>
                                        {order.receiver_name} • {formatDate(order.created_at)}
                                    </Text>
                                </AnimatedPressable>
                            ))
                        )}
                    </>
                )}

                <View style={{ height: 50 }} />
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
        fontFamily: Fonts.extraBold,
        color: Colors.text,
        letterSpacing: -0.5,
    },
    headerSub: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        fontFamily: Fonts.medium,
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
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
        borderWidth: 2,
        borderColor: Colors.white, // Pop badge effect
    },
    notifBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontFamily: Fonts.bold,
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
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
        fontFamily: Fonts.semiBold,
        color: Colors.text,
    },
    announcementCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.lg,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        gap: Spacing.lg,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    announcementIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    announcementTitle: {
        fontSize: Fonts.sizes.md,
        fontFamily: Fonts.bold,
        color: Colors.text,
        marginBottom: 4,
    },
    announcementMsg: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        fontFamily: Fonts.regular,
        lineHeight: 20,
    },
    announcementDate: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textLight,
        fontFamily: Fonts.medium,
        marginTop: 6,
    },
    tripCard: {
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl, // Increased padding
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4,
    },
    tripTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    tripInfo: {
        gap: 8,
        marginBottom: Spacing.lg,
    },
    tripDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tripDate: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        fontFamily: Fonts.medium,
    },
    tripFooter: {
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        paddingTop: Spacing.md,
    },
    bookNow: {
        fontSize: Fonts.sizes.sm,
        fontFamily: Fonts.bold,
        color: Colors.primary,
        letterSpacing: 0.2,
    },
    orderCard: {
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl, // Increased padding
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4,
    },
    orderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    orderNumber: {
        fontSize: Fonts.sizes.sm,
        fontFamily: Fonts.bold,
        color: Colors.secondary,
        letterSpacing: 0.5,
    },
    orderItem: {
        fontSize: Fonts.sizes.md,
        fontFamily: Fonts.semiBold,
        color: Colors.text,
        marginBottom: 6,
    },
    orderMeta: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textLight,
        fontFamily: Fonts.regular,
    },
});

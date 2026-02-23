import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import Icon from '../../components/LucideIcon';
import { ChevronRight } from 'lucide-react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { EmptyState } from '../../components/UIComponents';

export default function CustomerNotifications() {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.NOTIFICATIONS);
            setNotifications(res.data?.notifications || []);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(useCallback(() => { loadNotifications(); }, []));

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const markRead = async (id) => {
        try {
            await api.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`);
            setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
        } catch (e) {
            console.error(e);
        }
    };

    const markAllRead = async () => {
        try {
            await api.patch(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`);
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (e) {
            console.error(e);
        }
    };

    const getIcon = (type) => {
        const icons = {
            trip_update: { name: 'ship', color: Colors.info },
            order_update: { name: 'package', color: Colors.primary },
            pickup_schedule: { name: 'calendar-check', color: Colors.indigo },
            delay: { name: 'alert-triangle', color: Colors.warning },
            announcement: { name: 'megaphone', color: Colors.success },
            general: { name: 'bell', color: Colors.textSecondary },
        };
        return icons[type] || icons.general;
    };

    const timeAgo = (date) => {
        const diff = (Date.now() - new Date(date).getTime()) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const handleNotificationTap = async (item) => {
        if (!item.is_read) await markRead(item.id);

        if (item.reference_id) {
            const orderTypes = ['order_update', 'pickup_schedule'];
            const tripTypes = ['trip_update', 'delay'];

            if (orderTypes.includes(item.type)) {
                router.push({ pathname: '/(customer)/order-detail', params: { id: item.reference_id } });
            } else if (tripTypes.includes(item.type)) {
                router.push({ pathname: '/(customer)/trip-detail', params: { id: item.reference_id } });
            }
        }
    };

    const isNavigable = (type) => ['order_update', 'pickup_schedule', 'trip_update', 'delay'].includes(type);

    const renderNotification = ({ item }) => {
        const icon = getIcon(item.type);
        return (
            <TouchableOpacity
                style={[styles.card, !item.is_read && styles.cardUnread]}
                onPress={() => handleNotificationTap(item)}
                activeOpacity={0.6}
            >
                <View style={[styles.iconWrap, { backgroundColor: icon.color + '10' }]}>
                    <Icon name={icon.name} size={22} color={icon.color} />
                    {!item.is_read && <View style={styles.unreadDot} />}
                </View>
                <View style={{ flex: 1 }}>
                    <View style={styles.cardTop}>
                        <Text style={[styles.notifTitle, !item.is_read && styles.notifTitleUnread]} numberOfLines={1}>
                            {item.title}
                        </Text>
                    </View>
                    <Text style={styles.notifMsg} numberOfLines={2}>{item.message}</Text>
                    <Text style={styles.notifTime}>{timeAgo(item.created_at)}</Text>
                </View>
                {isNavigable(item.type) && item.reference_id && (
                    <ChevronRight size={18} color={Colors.textLight} style={{ alignSelf: 'center' }} />
                )}
            </TouchableOpacity>
        );
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Notifications</Text>
                    <Text style={styles.subtitle}>
                        {unreadCount > 0 ? `${unreadCount} new notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </Text>
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
                        <Text style={styles.markAllText}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderNotification}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                ListEmptyComponent={<EmptyState icon="bell-off" title="No Notifications" message="You'll see updates about your orders and trips here." />}
            />
            <View style={{ height: 40 }} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
    },
    title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
    subtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    markAllBtn: {
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
        backgroundColor: Colors.primaryFaded, borderRadius: BorderRadius.full,
    },
    markAllText: { fontSize: Fonts.sizes.xs, fontWeight: '700', color: Colors.primary },
    list: { paddingHorizontal: Spacing.xl, paddingBottom: 20 },
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.sm,
        gap: Spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: 'transparent',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cardUnread: {
        backgroundColor: Colors.white, // Keep white or very subtle tint
        borderLeftColor: Colors.primary,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        position: 'absolute',
        right: -4,
        top: -4,
        borderWidth: 1.5,
        borderColor: Colors.white,
    },
    notifTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: '500',
        color: Colors.text,
        flex: 1,
    },
    notifTitleUnread: {
        fontWeight: '700',
        color: Colors.secondary,
    },
    notifMsg: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    notifTime: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textLight,
        marginTop: 6,
    },
});

import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import Icon from '../../components/LucideIcon';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { EmptyState } from '../../components/UIComponents';

export default function AdminNotifications() {
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

    const getIcon = (type, refType) => {
        if (refType === 'ticket') return { name: 'ticket', color: Colors.secondary };
        const icons = {
            trip_update: { name: 'ship', color: Colors.info },
            order_update: { name: 'package', color: Colors.primary },
            pickup_schedule: { name: 'calendar-check', color: Colors.info },
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
            if (item.reference_type === 'ticket') {
                router.push({ pathname: '/(admin)/ticket-detail', params: { ticketId: item.reference_id } });
                return;
            }

            const orderTypes = ['order_update', 'pickup_schedule'];
            const tripTypes = ['trip_update', 'delay'];

            if (orderTypes.includes(item.type)) {
                router.push({ pathname: '/(admin)/order-detail', params: { id: item.reference_id } });
            } else if (tripTypes.includes(item.type)) {
                router.push({ pathname: '/(admin)/trip-detail', params: { id: item.reference_id } });
            }
        }
    };

    const isNavigable = (item) => {
        if (item.reference_type === 'ticket' && item.reference_id) return true;
        return ['order_update', 'pickup_schedule', 'trip_update', 'delay'].includes(item.type) && item.reference_id;
    };

    const renderNotification = ({ item }) => {
        const icon = getIcon(item.type, item.reference_type);
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
                    <Text style={[styles.notifTitle, !item.is_read && styles.notifTitleUnread]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.notifMsg} numberOfLines={2}>{item.message}</Text>
                    <Text style={styles.notifTime}>{timeAgo(item.created_at)}</Text>
                </View>
                {isNavigable(item) && (
                    <ChevronRight size={18} color={Colors.textLight} style={{ alignSelf: 'center' }} />
                )}
            </TouchableOpacity>
        );
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 ? (
                    <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
                        <Text style={styles.markAllText}>Read all</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 44 }} />
                )}
            </View>

            {unreadCount > 0 && (
                <View style={styles.unreadBanner}>
                    <Text style={styles.unreadBannerText}>{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</Text>
                </View>
            )}

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderNotification}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.secondary} />}
                ListEmptyComponent={<EmptyState icon="bell-off" title="No Notifications" message="You'll see ticket updates, order alerts, and system notifications here." />}
            />
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
    markAllBtn: {
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
        backgroundColor: Colors.secondaryFaded, borderRadius: BorderRadius.full,
    },
    markAllText: { fontSize: Fonts.sizes.xs, fontWeight: '700', color: Colors.secondary },
    unreadBanner: {
        backgroundColor: Colors.secondary + '10', marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
        borderRadius: BorderRadius.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg,
    },
    unreadBannerText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.secondary, textAlign: 'center' },
    list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
    card: {
        flexDirection: 'row', backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
        padding: Spacing.lg, marginBottom: Spacing.sm, gap: Spacing.md,
        borderLeftWidth: 4, borderLeftColor: 'transparent',
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },
    cardUnread: { borderLeftColor: Colors.secondary },
    iconWrap: {
        width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    },
    unreadDot: {
        width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary,
        position: 'absolute', right: -4, top: -4, borderWidth: 1.5, borderColor: Colors.white,
    },
    notifTitle: { fontSize: Fonts.sizes.md, fontWeight: '500', color: Colors.text, flex: 1 },
    notifTitleUnread: { fontWeight: '700', color: Colors.secondary },
    notifMsg: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, lineHeight: 18 },
    notifTime: { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 6 },
});

import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { ArrowLeft, Ticket, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { CATEGORY_LABELS } from '../../services/chatbot';

const STATUS_CONFIG = {
    open: { label: 'Open', color: Colors.info, bg: Colors.info + '15', icon: AlertCircle },
    in_progress: { label: 'In Progress', color: Colors.warning, bg: Colors.warningLight, icon: Clock },
    resolved: { label: 'Resolved', color: Colors.success, bg: Colors.success + '15', icon: CheckCircle },
    closed: { label: 'Closed', color: Colors.textLight, bg: Colors.borderLight, icon: CheckCircle },
};

const TicketCard = ({ ticket, onPress }) => {
    const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
    const StatusIcon = cfg.icon;
    const categoryLabel = CATEGORY_LABELS[ticket.category] || ticket.category;
    const date = new Date(ticket.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
    const hasAdminReply = ticket.last_sender_role === 'admin';

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
                <View style={styles.ticketNumRow}>
                    <Ticket size={16} color={Colors.primary} />
                    <Text style={styles.ticketNum}>{ticket.ticket_number}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <StatusIcon size={12} color={cfg.color} />
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
            </View>

            <Text style={styles.subject} numberOfLines={1}>{ticket.subject}</Text>
            <Text style={styles.category}>{categoryLabel}</Text>

            <View style={styles.cardFooter}>
                <Text style={styles.date}>{date}</Text>
                <View style={styles.messageCount}>
                    <MessageCircle size={12} color={Colors.textLight} />
                    <Text style={styles.messageCountText}>{ticket.message_count} messages</Text>
                </View>
            </View>

            {hasAdminReply && (
                <View style={styles.replyIndicator}>
                    <Text style={styles.replyIndicatorText}>💬 Admin replied</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default function MyTicketsScreen() {
    const router = useRouter();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');

    const loadTickets = useCallback(async () => {
        try {
            const endpoint = filter === 'all'
                ? API_ENDPOINTS.TICKETS
                : `${API_ENDPOINTS.TICKETS}?status=${filter}`;
            const res = await api.get(endpoint);
            if (res.success) setTickets(res.data || []);
        } catch (e) {
            console.error('Load tickets error:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filter]);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadTickets();
        }, [loadTickets])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadTickets();
    };

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'open', label: 'Open' },
        { key: 'in_progress', label: 'In Progress' },
        { key: 'resolved', label: 'Resolved' },
    ];

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ArrowLeft size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Tickets</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Tickets</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Filter Chips */}
            <View style={styles.filterRow}>
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={tickets}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TicketCard
                        ticket={item}
                        onPress={() => router.push({ pathname: '/(customer)/ticket-detail', params: { ticketId: item.id } })}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ticket size={48} color={Colors.textLight} />
                        <Text style={styles.emptyTitle}>No tickets yet</Text>
                        <Text style={styles.emptyDesc}>When you create a support ticket via the chatbot, it will appear here.</Text>
                    </View>
                }
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
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    filterRow: {
        flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.sm,
    },
    filterChip: {
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
        borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
    },
    filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded },
    filterText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary },
    filterTextActive: { color: Colors.primary },
    list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
    card: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.md,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
    ticketNumRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    ticketNum: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.primary },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full,
    },
    statusText: { fontSize: 11, fontWeight: '700' },
    subject: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text, marginBottom: 4 },
    category: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, marginBottom: Spacing.sm },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    date: { fontSize: Fonts.sizes.xs, color: Colors.textLight },
    messageCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    messageCountText: { fontSize: Fonts.sizes.xs, color: Colors.textLight },
    replyIndicator: {
        marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight,
    },
    replyIndicatorText: { fontSize: Fonts.sizes.xs, color: Colors.success, fontWeight: '600' },
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginTop: Spacing.lg },
    emptyDesc: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, paddingHorizontal: Spacing.xl },
});

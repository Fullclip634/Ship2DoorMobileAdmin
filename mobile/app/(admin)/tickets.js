import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Ticket, MessageCircle, Clock, CheckCircle, AlertCircle, User } from 'lucide-react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';

const CATEGORY_LABELS = {
    order_issue: '📦 Order Issue',
    delivery_problem: '🚚 Delivery Problem',
    payment: '💰 Payment',
    general_inquiry: '❓ General Inquiry',
    app_bug: '🐛 App Bug',
};

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
    const date = new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const lastMsg = ticket.last_message ? ticket.last_message.substring(0, 60) + (ticket.last_message.length > 60 ? '...' : '') : '';
    const needsReply = ticket.last_sender_role === 'customer' && ticket.status !== 'resolved' && ticket.status !== 'closed';

    return (
        <TouchableOpacity style={[styles.card, needsReply && styles.cardNeedsReply]} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
                <View style={styles.ticketNumRow}>
                    <Ticket size={14} color={Colors.primary} />
                    <Text style={styles.ticketNum}>{ticket.ticket_number}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <StatusIcon size={10} color={cfg.color} />
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
            </View>

            <Text style={styles.subject} numberOfLines={1}>{ticket.subject}</Text>

            <View style={styles.metaRow}>
                <View style={styles.customerInfo}>
                    <User size={12} color={Colors.textLight} />
                    <Text style={styles.customerName}>{ticket.first_name} {ticket.last_name}</Text>
                </View>
                <Text style={styles.category}>{categoryLabel}</Text>
            </View>

            {lastMsg ? (
                <Text style={styles.lastMsg} numberOfLines={1}>
                    {ticket.last_sender_role === 'admin' ? 'You: ' : ''}{lastMsg}
                </Text>
            ) : null}

            <View style={styles.cardFooter}>
                <Text style={styles.date}>{date}</Text>
                <View style={styles.messageCount}>
                    <MessageCircle size={12} color={Colors.textLight} />
                    <Text style={styles.messageCountText}>{ticket.message_count}</Text>
                </View>
                {needsReply && (
                    <View style={styles.replyBadge}>
                        <Text style={styles.replyBadgeText}>Needs Reply</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default function AdminTicketsScreen() {
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
        { key: 'in_progress', label: 'Active' },
        { key: 'resolved', label: 'Resolved' },
    ];

    const openCount = tickets.filter(t => t.status === 'open').length;
    const needsReplyCount = tickets.filter(t => t.last_sender_role === 'customer' && !['resolved', 'closed'].includes(t.status)).length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Support Tickets</Text>
                {needsReplyCount > 0 && (
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>{needsReplyCount} pending</Text>
                    </View>
                )}
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statNum}>{tickets.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={[styles.statNum, { color: Colors.info }]}>{openCount}</Text>
                    <Text style={styles.statLabel}>Open</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={[styles.statNum, { color: Colors.error }]}>{needsReplyCount}</Text>
                    <Text style={styles.statLabel}>Needs Reply</Text>
                </View>
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

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={tickets}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TicketCard
                            ticket={item}
                            onPress={() => router.push({ pathname: '/(admin)/ticket-detail', params: { ticketId: item.id } })}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ticket size={48} color={Colors.textLight} />
                            <Text style={styles.emptyTitle}>No tickets</Text>
                            <Text style={styles.emptyDesc}>Customer support tickets will appear here.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
    },
    headerTitle: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text },
    headerBadge: {
        backgroundColor: Colors.error, borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md, paddingVertical: 4,
    },
    headerBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.white },
    statsRow: {
        flexDirection: 'row', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, gap: Spacing.md,
    },
    stat: {
        flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.md, padding: Spacing.md,
        alignItems: 'center',
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    statNum: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text },
    statLabel: { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 2 },
    filterRow: {
        flexDirection: 'row', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, gap: Spacing.sm,
    },
    filterChip: {
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
        borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
    },
    filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded },
    filterText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary },
    filterTextActive: { color: Colors.primary },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
    card: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardNeedsReply: { borderLeftWidth: 3, borderLeftColor: Colors.error },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
    ticketNumRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ticketNum: { fontSize: Fonts.sizes.xs, fontWeight: '700', color: Colors.primary },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full,
    },
    statusText: { fontSize: 10, fontWeight: '700' },
    subject: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text, marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs },
    customerInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    customerName: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, fontWeight: '500' },
    category: { fontSize: Fonts.sizes.xs, color: Colors.textLight },
    lastMsg: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, marginBottom: Spacing.sm, fontStyle: 'italic' },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    date: { fontSize: Fonts.sizes.xs, color: Colors.textLight },
    messageCount: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    messageCountText: { fontSize: Fonts.sizes.xs, color: Colors.textLight },
    replyBadge: {
        marginLeft: 'auto', backgroundColor: Colors.error + '15', borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm, paddingVertical: 2,
    },
    replyBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.error },
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginTop: Spacing.lg },
    emptyDesc: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
});

import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { StatusBadge, EmptyState } from '../../components/UIComponents';

export default function CustomerOrders() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');

    const loadOrders = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.ORDERS);
            setOrders(res.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(useCallback(() => { loadOrders(); }, []));

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    const filteredOrders = orders.filter((o) => {
        if (filter === 'active') return !['delivered', 'cancelled'].includes(o.status);
        if (filter === 'delivered') return o.status === 'delivered';
        return true;
    });

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const FilterButton = ({ label, value }) => (
        <TouchableOpacity
            style={[styles.filterBtn, filter === value && styles.filterBtnActive]}
            onPress={() => setFilter(value)}
        >
            <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderOrder = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/(customer)/order-detail', params: { id: item.id } })}
            activeOpacity={0.7}
        >
            <View style={styles.cardTop}>
                <Text style={styles.orderNumber}>{item.order_number}</Text>
                <StatusBadge status={item.status} size="sm" />
            </View>
            <Text style={styles.itemDesc} numberOfLines={1}>{item.item_description}</Text>
            <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                    <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{item.receiver_name}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <View style={styles.dirRow}>
                    <Ionicons
                        name={item.direction === 'manila_to_bohol' ? 'arrow-down' : 'arrow-up'}
                        size={14}
                        color={Colors.textSecondary}
                    />
                    <Text style={styles.dirText}>
                        {item.direction === 'manila_to_bohol' ? 'Manila to Bohol' : 'Bohol to Manila'}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Orders</Text>
                <Text style={styles.subtitle}>{orders.length} total orders</Text>
            </View>

            <View style={styles.filters}>
                <FilterButton label="All" value="all" />
                <FilterButton label="Active" value="active" />
                <FilterButton label="Delivered" value="delivered" />
            </View>

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderOrder}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                ListEmptyComponent={<EmptyState icon="cube-outline" title="No Orders Yet" message="Book your first shipment from the Trips tab!" />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
    title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
    subtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    filters: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.md },
    filterBtn: {
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
        backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
    },
    filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    filterText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary },
    filterTextActive: { color: Colors.white },
    list: { paddingHorizontal: Spacing.xl, paddingBottom: 20 },
    card: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardTop: { flexDirection: 'column', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
    orderNumber: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.secondary },
    itemDesc: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
    cardMeta: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.md },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, fontWeight: '500' },
    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.md,
    },
    dirRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dirText: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, fontWeight: '500' },
});

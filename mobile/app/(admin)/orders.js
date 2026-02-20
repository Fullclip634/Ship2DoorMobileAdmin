import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { ChevronRight, Search, XCircle } from 'lucide-react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { StatusBadge, EmptyState } from '../../components/UIComponents';

export default function AdminOrders() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const loadOrders = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.ORDERS);
            setOrders(res.data || []);
        } catch (e) { console.error(e); }
    };

    useFocusEffect(useCallback(() => { loadOrders(); }, []));

    const onRefresh = async () => { setRefreshing(true); await loadOrders(); setRefreshing(false); };

    const filteredOrders = orders.filter((o) => {
        if (filter === 'pending' && o.status !== 'pending') return false;
        if (filter === 'active' && ['delivered', 'cancelled', 'pending'].includes(o.status)) return false;
        if (filter === 'delivered' && o.status !== 'delivered') return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            return (o.order_number || '').toLowerCase().includes(q)
                || (o.customer_first_name || '').toLowerCase().includes(q)
                || (o.customer_last_name || '').toLowerCase().includes(q)
                || (o.item_description || '').toLowerCase().includes(q);
        }
        return true;
    });

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const FilterButton = ({ label, value, count }) => (
        <TouchableOpacity
            style={[styles.filterBtn, filter === value && styles.filterBtnActive]}
            onPress={() => setFilter(value)}
        >
            <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{label}</Text>
            {count > 0 && <View style={[styles.filterCount, filter === value && styles.filterCountActive]}>
                <Text style={[styles.filterCountText, filter === value && styles.filterCountTextActive]}>{count}</Text>
            </View>}
        </TouchableOpacity>
    );

    const pendingCount = orders.filter((o) => o.status === 'pending').length;

    const renderOrder = ({ item }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/(admin)/order-detail', params: { id: item.id } })}
        >
            <View style={styles.cardTop}>
                <View style={styles.cardTopLeft}>
                    <Text style={styles.orderNum}>{item.order_number}</Text>
                    <Text style={styles.customer}>{item.customer_first_name} {item.customer_last_name}</Text>
                </View>
                <StatusBadge status={item.status} size="sm" />
            </View>
            <Text style={styles.itemDesc} numberOfLines={1}>{item.item_description}</Text>
            <View style={styles.cardFooter}>
                <Text style={styles.footerText}>
                    {item.direction === 'manila_to_bohol' ? 'Manila to Bohol' : 'Bohol to Manila'} • {formatDate(item.created_at)}
                </Text>
                <ChevronRight size={18} color={Colors.textLight} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Order Management</Text>
                <Text style={styles.subtitle}>{orders.length} total orders</Text>
            </View>

            <View style={styles.searchContainer}>
                <Search size={18} color={Colors.textLight} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search orders..."
                    placeholderTextColor={Colors.textLight}
                    value={search}
                    onChangeText={setSearch}
                    autoCorrect={false}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <XCircle size={18} color={Colors.textLight} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.filters}>
                <FilterButton label="All" value="all" />
                <FilterButton label="Pending" value="pending" count={pendingCount} />
                <FilterButton label="Active" value="active" />
                <FilterButton label="Done" value="delivered" />
            </View>

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderOrder}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.secondary} />}
                ListEmptyComponent={<EmptyState icon="package" title="No Orders" message="No orders match this filter." />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
    title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
    subtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.white, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border,
        paddingHorizontal: Spacing.lg, height: 44, marginHorizontal: Spacing.xl, marginBottom: Spacing.md,
    },
    searchInput: { flex: 1, fontSize: Fonts.sizes.md, color: Colors.text, height: '100%' },
    filters: {
        flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: 'wrap',
    },
    filterBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
        backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
    },
    filterBtnActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
    filterText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary },
    filterTextActive: { color: Colors.white },
    filterCount: { backgroundColor: Colors.error, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
    filterCountActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
    filterCountText: { fontSize: 10, fontWeight: '700', color: Colors.white },
    filterCountTextActive: { color: Colors.white },
    list: { paddingHorizontal: Spacing.xl, paddingBottom: 20 },
    card: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardTop: { flexDirection: 'column', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
    cardTopLeft: {},
    orderNum: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.secondary },
    customer: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    itemDesc: { fontSize: Fonts.sizes.md, fontWeight: '500', color: Colors.text, marginBottom: Spacing.sm },
    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.md,
    },
    footerText: { fontSize: Fonts.sizes.xs, color: Colors.textLight },
});

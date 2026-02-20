import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Calendar, Flag, Package } from 'lucide-react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { StatusBadge, DirectionBadge, EmptyState } from '../../components/UIComponents';

export default function CustomerTrips() {
    const router = useRouter();
    const [trips, setTrips] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');

    const loadTrips = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.UPCOMING_TRIPS);
            setTrips(res.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(useCallback(() => { loadTrips(); }, []));

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTrips();
        setRefreshing(false);
    };

    const filteredTrips = trips.filter((t) => {
        if (filter === 'manila') return t.direction === 'manila_to_bohol';
        if (filter === 'bohol') return t.direction === 'bohol_to_manila';
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

    const renderTrip = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/(customer)/trip-detail', params: { id: item.id } })}
            activeOpacity={0.7}
        >
            <View style={styles.cardTop}>
                <DirectionBadge direction={item.direction} />
                <StatusBadge status={item.status} size="sm" />
            </View>
            <View style={styles.cardBody}>
                <View style={styles.dateRow}>
                    <Calendar size={16} color={Colors.textSecondary} />
                    <Text style={styles.dateText}>Departs: {formatDate(item.departure_date)}</Text>
                </View>
                {item.estimated_arrival && (
                    <View style={styles.dateRow}>
                        <Flag size={16} color={Colors.textSecondary} />
                        <Text style={styles.dateText}>Arrives: {formatDate(item.estimated_arrival)}</Text>
                    </View>
                )}
                {item.notes && (
                    <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
                )}
            </View>
            <View style={styles.cardFooter}>
                <View style={styles.orderCount}>
                    <Package size={14} color={Colors.textSecondary} />
                    <Text style={styles.orderCountText}>{item.order_count || 0} orders</Text>
                </View>
                <Text style={styles.viewDetail}>View Details</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Trip Schedules</Text>
                <Text style={styles.subtitle}>Available cargo trips</Text>
            </View>

            <View style={styles.filters}>
                <FilterButton label="All" value="all" />
                <FilterButton label="Manila to Bohol" value="manila" />
                <FilterButton label="Bohol to Manila" value="bohol" />
            </View>

            <FlatList
                data={filteredTrips}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTrip}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                ListEmptyComponent={<EmptyState icon="ship" title="No Trips Available" message="No upcoming trips at the moment. Check back soon!" />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
    },
    title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
    subtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    filters: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.xl,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    filterBtn: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    filterBtnActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary },
    filterTextActive: { color: Colors.white },
    list: { paddingHorizontal: Spacing.xl, paddingBottom: 20 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTop: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md,
    },
    cardBody: { gap: 6, marginBottom: Spacing.md },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: '500' },
    notes: { fontSize: Fonts.sizes.sm, color: Colors.textLight, fontStyle: 'italic', marginTop: 4 },
    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.md,
    },
    orderCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    orderCountText: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, fontWeight: '500' },
    viewDetail: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.primary },
});

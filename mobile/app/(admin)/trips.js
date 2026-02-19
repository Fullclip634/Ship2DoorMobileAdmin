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
import { StatusBadge, DirectionBadge, EmptyState } from '../../components/UIComponents';

export default function AdminTrips() {
    const router = useRouter();
    const [trips, setTrips] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadTrips = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.TRIPS);
            setTrips(res.data || []);
        } catch (e) { console.error(e); }
    };

    useFocusEffect(useCallback(() => { loadTrips(); }, []));

    const onRefresh = async () => { setRefreshing(true); await loadTrips(); setRefreshing(false); };
    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const renderTrip = ({ item }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/(admin)/trip-detail', params: { id: item.id } })}
        >
            <View style={styles.cardTop}>
                <DirectionBadge direction={item.direction} />
                <StatusBadge status={item.status} size="sm" />
            </View>
            <View style={styles.cardBody}>
                <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.dateText}>{formatDate(item.departure_date)}</Text>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.orderCount}>{item.order_count || 0} orders</Text>
                <Text style={styles.manage}>Manage</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Trip Management</Text>
                    <Text style={styles.subtitle}>{trips.length} total trips</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(admin)/create-trip')}>
                    <Ionicons name="add" size={22} color={Colors.white} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={trips}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTrip}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.secondary} />}
                ListEmptyComponent={<EmptyState icon="boat-outline" title="No Trips Yet" message="Tap + to create your first trip." />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
    },
    title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
    subtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    addBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.secondary,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    list: { paddingHorizontal: Spacing.xl, paddingBottom: 20 },
    card: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    cardBody: { marginBottom: Spacing.md },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: '500' },
    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.md,
    },
    orderCount: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: '500' },
    manage: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.secondary },
});

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { EmptyState } from '../../components/UIComponents';

export default function AdminCustomers() {
    const router = useRouter();
    const [customers, setCustomers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const load = async () => { try { const r = await api.get(API_ENDPOINTS.CUSTOMERS); setCustomers(r.data || []); } catch (e) { } };
    useFocusEffect(useCallback(() => { load(); }, []));
    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const renderCustomer = ({ item }) => {
        const initials = `${item.first_name?.[0] || ''}${item.last_name?.[0] || ''}`.toUpperCase();
        return (
            <View style={s.card}>
                <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
                <View style={{ flex: 1 }}>
                    <Text style={s.name}>{item.first_name} {item.last_name}</Text>
                    <Text style={s.email}>{item.email}</Text>
                    {item.phone && <Text style={s.phone}>{item.phone}</Text>}
                    <View style={s.statsRow}>
                        <View style={s.stat}><Ionicons name="cube-outline" size={12} color={Colors.primary} /><Text style={s.statText}>{item.total_orders} orders</Text></View>
                        <View style={s.stat}><Ionicons name="checkmark-circle-outline" size={12} color={Colors.success} /><Text style={s.statText}>{item.completed_orders} delivered</Text></View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={Colors.text} /></TouchableOpacity>
                <Text style={s.title}>Customers ({customers.length})</Text>
                <View style={{ width: 44 }} />
            </View>
            <View style={s.searchContainer}>
                <Ionicons name="search-outline" size={18} color={Colors.textLight} />
                <TextInput
                    style={s.searchInput}
                    placeholder="Search customers..."
                    placeholderTextColor={Colors.textLight}
                    value={search}
                    onChangeText={setSearch}
                    autoCorrect={false}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={18} color={Colors.textLight} />
                    </TouchableOpacity>
                )}
            </View>
            <FlatList data={customers.filter(c => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return (c.first_name || '').toLowerCase().includes(q)
                    || (c.last_name || '').toLowerCase().includes(q)
                    || (c.email || '').toLowerCase().includes(q)
                    || (c.phone || '').toLowerCase().includes(q);
            })} keyExtractor={i => i.id.toString()} renderItem={renderCustomer} contentContainerStyle={s.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.secondary} />}
                ListEmptyComponent={<EmptyState icon="people-outline" title="No Customers Found" message="No customers match your search." />}
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
    title: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text },
    list: { paddingHorizontal: Spacing.xl, paddingBottom: 20, paddingTop: Spacing.sm },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.white, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border,
        paddingHorizontal: Spacing.lg, height: 44, marginHorizontal: Spacing.xl, marginBottom: Spacing.md,
    },
    searchInput: { flex: 1, fontSize: Fonts.sizes.md, color: Colors.text, height: '100%' },
    card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.sm, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 16, fontWeight: '800', color: Colors.white },
    name: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
    email: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, marginTop: 1 },
    phone: { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 1 },
    statsRow: { flexDirection: 'row', gap: Spacing.md, marginTop: 4 },
    stat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    statText: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600' },
});

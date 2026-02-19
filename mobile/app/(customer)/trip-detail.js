import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { StatusBadge, DirectionBadge, LoadingScreen } from '../../components/UIComponents';

export default function TripDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrip();
    }, [id]);

    const loadTrip = async () => {
        try {
            const res = await api.get(`${API_ENDPOINTS.TRIPS}/${id}`);
            setTrip(res.data);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load trip details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingScreen />;
    if (!trip) return null;

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const isBookable = ['upcoming', 'pickup_phase'].includes(trip.status);

    const statusSteps = [
        { key: 'upcoming', label: 'Upcoming', icon: 'calendar' },
        { key: 'pickup_phase', label: 'Pickup Phase', icon: 'cube' },
        { key: 'in_transit', label: 'In Transit', icon: 'car' },
        { key: 'boarding_ship', label: 'Boarding Ship', icon: 'boat' },
        { key: 'at_sea', label: 'At Sea', icon: 'water' },
        { key: 'arrived', label: 'Arrived', icon: 'location' },
        { key: 'delivering', label: 'Delivering', icon: 'bicycle' },
        { key: 'completed', label: 'Completed', icon: 'checkmark-circle' },
    ];

    const currentIndex = statusSteps.findIndex((s) => s.key === trip.status);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Trip Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Trip Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardTop}>
                        <DirectionBadge direction={trip.direction} />
                        <StatusBadge status={trip.status} />
                    </View>

                    <View style={styles.dateSection}>
                        <View style={styles.dateItem}>
                            <Ionicons name="calendar" size={20} color={Colors.primary} />
                            <View>
                                <Text style={styles.dateLabel}>Departure</Text>
                                <Text style={styles.dateValue}>{formatDate(trip.departure_date)}</Text>
                            </View>
                        </View>
                        {trip.estimated_arrival && (
                            <View style={styles.dateItem}>
                                <Ionicons name="flag" size={20} color={Colors.success} />
                                <View>
                                    <Text style={styles.dateLabel}>Est. Arrival</Text>
                                    <Text style={styles.dateValue}>{formatDate(trip.estimated_arrival)}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {trip.notes && (
                        <View style={styles.notesSection}>
                            <Text style={styles.notesLabel}>Notes</Text>
                            <Text style={styles.notesText}>{trip.notes}</Text>
                        </View>
                    )}
                </View>

                {/* Status Tracker */}
                {trip.status !== 'cancelled' && (
                    <View style={styles.card}>
                        <Text style={styles.trackerTitle}>Trip Progress</Text>
                        {statusSteps.map((step, i) => {
                            const isActive = i <= currentIndex;
                            const isCurrent = i === currentIndex;
                            return (
                                <View key={step.key} style={styles.stepRow}>
                                    <View style={styles.stepIndicator}>
                                        <View style={[styles.stepDot, isActive && styles.stepDotActive, isCurrent && styles.stepDotCurrent]}>
                                            <Ionicons name={step.icon} size={14} color={isActive ? Colors.white : Colors.textLight} />
                                        </View>
                                        {i < statusSteps.length - 1 && (
                                            <View style={[styles.stepLine, isActive && styles.stepLineActive]} />
                                        )}
                                    </View>
                                    <Text style={[styles.stepLabel, isActive && styles.stepLabelActive, isCurrent && styles.stepLabelCurrent]}>
                                        {step.label}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Book Button */}
                {isBookable && (
                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => router.push({ pathname: '/(customer)/book-shipment', params: { tripId: trip.id, direction: trip.direction, departureDate: trip.departure_date } })}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add-circle-outline" size={22} color={Colors.white} />
                        <Text style={styles.bookButtonText}>Book Shipment on This Trip</Text>
                    </TouchableOpacity>
                )}

                <View style={{ height: 30 }} />
            </ScrollView>
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
    content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
    card: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.lg,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
    dateSection: { gap: Spacing.lg },
    dateItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    dateLabel: { fontSize: Fonts.sizes.xs, color: Colors.textLight, fontWeight: '500' },
    dateValue: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text },
    notesSection: { marginTop: Spacing.xl, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.borderLight },
    notesLabel: { fontSize: Fonts.sizes.xs, fontWeight: '600', color: Colors.textLight, marginBottom: 4 },
    notesText: { fontSize: Fonts.sizes.md, color: Colors.text, lineHeight: 22 },
    trackerTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xl },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.lg },
    stepIndicator: { alignItems: 'center', width: 30 },
    stepDot: {
        width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.borderLight,
        alignItems: 'center', justifyContent: 'center',
    },
    stepDotActive: { backgroundColor: Colors.primary },
    stepDotCurrent: { backgroundColor: Colors.secondary, borderWidth: 2, borderColor: Colors.primary },
    stepLine: { width: 2, height: 24, backgroundColor: Colors.borderLight, marginVertical: 2 },
    stepLineActive: { backgroundColor: Colors.primary },
    stepLabel: { fontSize: Fonts.sizes.sm, color: Colors.textLight, fontWeight: '500', paddingTop: 6 },
    stepLabelActive: { color: Colors.text },
    stepLabelCurrent: { fontWeight: '700', color: Colors.secondary },
    bookButton: {
        flexDirection: 'row', backgroundColor: Colors.primary, height: 56, borderRadius: BorderRadius.lg,
        alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    bookButtonText: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.white },
});

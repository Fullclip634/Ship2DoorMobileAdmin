import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';

export default function CreateTrip() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        direction: 'manila_to_bohol',
        departure_date: '',
        estimated_arrival: '',
        notes: '',
    });

    // Date picker state
    const [showDeparturePicker, setShowDeparturePicker] = useState(false);
    const [showArrivalPicker, setShowArrivalPicker] = useState(false);
    const [departureDate, setDepartureDate] = useState(new Date());
    const [arrivalDate, setArrivalDate] = useState(new Date());

    const updateField = (key, value) => setForm({ ...form, [key]: value });

    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
        });
    };

    const formatDateForAPI = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const onDepartureChange = (event, selectedDate) => {
        setShowDeparturePicker(false);
        if (event.type === 'set' && selectedDate) {
            setDepartureDate(selectedDate);
            updateField('departure_date', formatDateForAPI(selectedDate));
        }
    };

    const onArrivalChange = (event, selectedDate) => {
        setShowArrivalPicker(false);
        if (event.type === 'set' && selectedDate) {
            setArrivalDate(selectedDate);
            updateField('estimated_arrival', formatDateForAPI(selectedDate));
        }
    };

    const handleSubmit = async () => {
        if (!form.departure_date.trim()) {
            Alert.alert('Missing Field', 'Please select the departure date.');
            return;
        }

        setLoading(true);
        try {
            const body = {
                ...form,
            };
            if (!body.estimated_arrival) delete body.estimated_arrival;

            const res = await api.post(API_ENDPOINTS.TRIPS, body);
            if (res.success) {
                Alert.alert('Success!', 'Trip created and customers have been notified.', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            }
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Trip</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    {/* Direction */}
                    <Text style={styles.sectionTitle}>Trip Direction</Text>
                    <View style={styles.directionRow}>
                        <TouchableOpacity
                            style={[styles.dirBtn, form.direction === 'manila_to_bohol' && styles.dirBtnActive]}
                            onPress={() => updateField('direction', 'manila_to_bohol')}
                        >
                            <Ionicons name="arrow-down" size={18} color={form.direction === 'manila_to_bohol' ? Colors.white : Colors.primary} />
                            <Text style={[styles.dirText, form.direction === 'manila_to_bohol' && styles.dirTextActive]}>Manila to Bohol</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.dirBtn, form.direction === 'bohol_to_manila' && styles.dirBtnActiveSecondary]}
                            onPress={() => updateField('direction', 'bohol_to_manila')}
                        >
                            <Ionicons name="arrow-up" size={18} color={form.direction === 'bohol_to_manila' ? Colors.white : Colors.secondary} />
                            <Text style={[styles.dirText, form.direction === 'bohol_to_manila' && styles.dirTextActive]}>Bohol to Manila</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Dates */}
                    <Text style={styles.sectionTitle}>Schedule</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Departure Date <Text style={styles.required}>*</Text></Text>
                        <TouchableOpacity
                            style={styles.datePickerBtn}
                            onPress={() => setShowDeparturePicker(true)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.dateIconWrap}>
                                <Ionicons name="calendar" size={18} color={Colors.primary} />
                            </View>
                            <Text style={[styles.dateText, !form.departure_date && styles.datePlaceholder]}>
                                {form.departure_date ? formatDateForDisplay(form.departure_date) : 'Tap to select departure date'}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color={Colors.textLight} />
                        </TouchableOpacity>
                    </View>

                    {showDeparturePicker && (
                        <DateTimePicker
                            value={departureDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDepartureChange}
                            minimumDate={new Date()}
                        />
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Estimated Arrival</Text>
                        <TouchableOpacity
                            style={styles.datePickerBtn}
                            onPress={() => setShowArrivalPicker(true)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.dateIconWrap, { backgroundColor: Colors.secondaryFaded }]}>
                                <Ionicons name="flag" size={18} color={Colors.secondary} />
                            </View>
                            <Text style={[styles.dateText, !form.estimated_arrival && styles.datePlaceholder]}>
                                {form.estimated_arrival ? formatDateForDisplay(form.estimated_arrival) : 'Tap to select arrival date'}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color={Colors.textLight} />
                        </TouchableOpacity>
                    </View>

                    {showArrivalPicker && (
                        <DateTimePicker
                            value={arrivalDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onArrivalChange}
                            minimumDate={departureDate}
                        />
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Notes</Text>
                        <View style={styles.notesContainer}>
                            <TextInput
                                style={styles.notesInput}
                                placeholder="Any special notes for this trip..."
                                placeholderTextColor={Colors.textLight}
                                value={form.notes}
                                onChangeText={(v) => updateField('notes', v)}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <>
                                <Ionicons name="boat" size={22} color={Colors.white} />
                                <Text style={styles.submitText}>Create Trip & Notify Customers</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
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
    sectionTitle: {
        fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.secondary,
        marginBottom: Spacing.md, marginTop: Spacing.xl,
        textTransform: 'uppercase', letterSpacing: 0.5,
    },
    directionRow: { flexDirection: 'row', gap: Spacing.md },
    dirBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: Colors.white, borderRadius: BorderRadius.md, paddingVertical: Spacing.lg,
        borderWidth: 2, borderColor: Colors.border,
    },
    dirBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    dirBtnActiveSecondary: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
    dirText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.text },
    dirTextActive: { color: Colors.white },
    inputGroup: { marginBottom: Spacing.lg },
    label: {
        fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text,
        marginBottom: Spacing.sm, marginLeft: 2,
    },
    required: { color: Colors.error, fontWeight: '400' },
    datePickerBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.white, borderRadius: BorderRadius.md,
        borderWidth: 1.5, borderColor: Colors.border,
        paddingHorizontal: Spacing.lg, height: 56, gap: Spacing.md,
    },
    dateIconWrap: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryFaded,
        alignItems: 'center', justifyContent: 'center',
    },
    dateText: {
        flex: 1, fontSize: Fonts.sizes.md, fontWeight: '500', color: Colors.text,
    },
    datePlaceholder: { color: Colors.textLight, fontWeight: '400' },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
        borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border,
        paddingHorizontal: Spacing.lg, height: 52,
    },
    inputIcon: { marginRight: Spacing.sm },
    input: { flex: 1, fontSize: Fonts.sizes.md, color: Colors.text, height: '100%' },
    notesContainer: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.md,
        borderWidth: 1.5, borderColor: Colors.border, overflow: 'hidden',
    },
    notesInput: {
        fontSize: Fonts.sizes.md, color: Colors.text,
        paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.lg,
        minHeight: 120, textAlignVertical: 'top', lineHeight: 22,
    },
    submitButton: {
        flexDirection: 'row', backgroundColor: Colors.secondary, height: 56, borderRadius: BorderRadius.lg,
        alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.xl,
        shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    submitDisabled: { opacity: 0.7 },
    submitText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.white },
});

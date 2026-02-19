import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    RefreshControl, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { EmptyState } from '../../components/UIComponents';

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ title: '', message: '' });

    const loadAnnouncements = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.ANNOUNCEMENTS);
            setAnnouncements(res.data || []);
        } catch (e) { console.error(e); }
    };

    useFocusEffect(useCallback(() => { loadAnnouncements(); }, []));

    const onRefresh = async () => { setRefreshing(true); await loadAnnouncements(); setRefreshing(false); };

    const handleCreate = async () => {
        if (!form.title.trim() || !form.message.trim()) {
            Alert.alert('Required', 'Please fill in both title and message.');
            return;
        }
        setCreating(true);
        try {
            await api.post(API_ENDPOINTS.ANNOUNCEMENTS, form);
            Alert.alert('✅ Posted', 'Announcement sent to all customers.');
            setShowCreate(false);
            setForm({ title: '', message: '' });
            loadAnnouncements();
        } catch (e) { Alert.alert('Error', e.message); }
        finally { setCreating(false); }
    };

    const handleDelete = (id) => {
        Alert.alert('Delete', 'Remove this announcement?', [
            { text: 'Cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try { await api.delete(`${API_ENDPOINTS.ANNOUNCEMENTS}/${id}`); loadAnnouncements(); }
                    catch (e) { Alert.alert('Error', e.message); }
                }
            },
        ]);
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardTop}>
                <View style={styles.pinIcon}>
                    <Ionicons name={item.is_pinned ? 'pin' : 'megaphone'} size={18} color={Colors.primary} />
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMsg}>{item.message}</Text>
            <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Announcements</Text>
                    <Text style={styles.subtitle}>{announcements.length} posted</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
                    <Ionicons name="add" size={22} color={Colors.white} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={announcements}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.secondary} />}
                ListEmptyComponent={<EmptyState icon="megaphone-outline" title="No Announcements" message="Post your first announcement to notify all customers." />}
            />

            {/* Create Modal */}
            <Modal visible={showCreate} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Announcement</Text>
                            <TouchableOpacity onPress={() => setShowCreate(false)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Title"
                            placeholderTextColor={Colors.textLight}
                            value={form.title}
                            onChangeText={(v) => setForm({ ...form, title: v })}
                        />

                        <TextInput
                            style={[styles.modalInput, { minHeight: 120, textAlignVertical: 'top' }]}
                            placeholder="Write your announcement message..."
                            placeholderTextColor={Colors.textLight}
                            value={form.message}
                            onChangeText={(v) => setForm({ ...form, message: v })}
                            multiline
                            numberOfLines={5}
                        />

                        <TouchableOpacity
                            style={[styles.postBtn, creating && { opacity: 0.7 }]}
                            onPress={handleCreate}
                            disabled={creating}
                        >
                            {creating ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <>
                                    <Ionicons name="send" size={18} color={Colors.white} />
                                    <Text style={styles.postText}>Post & Notify All Customers</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    list: { paddingHorizontal: Spacing.xl, paddingBottom: 20 },
    card: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        borderLeftWidth: 3, borderLeftColor: Colors.primary,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
    pinIcon: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryFaded,
        alignItems: 'center', justifyContent: 'center',
    },
    cardTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, marginBottom: 4 },
    cardMsg: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },
    cardDate: { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: Spacing.sm },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: {
        backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: Spacing.xxl, paddingBottom: 40,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
    modalTitle: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text },
    modalInput: {
        backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: Spacing.lg,
        fontSize: Fonts.sizes.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
    },
    postBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.lg, marginTop: Spacing.sm,
    },
    postText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.white },
});

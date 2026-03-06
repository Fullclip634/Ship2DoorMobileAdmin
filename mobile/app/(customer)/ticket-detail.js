import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput,
    TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { ArrowLeft, Send, Ship, User, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';
import { CATEGORY_LABELS } from '../../services/chatbot';

const STATUS_CONFIG = {
    open: { label: 'Open', color: Colors.info, bg: Colors.info + '15', icon: AlertCircle },
    in_progress: { label: 'In Progress', color: Colors.warning, bg: Colors.warningLight, icon: Clock },
    resolved: { label: 'Resolved', color: Colors.success, bg: Colors.success + '15', icon: CheckCircle },
    closed: { label: 'Closed', color: Colors.textLight, bg: Colors.borderLight, icon: CheckCircle },
};

export default function TicketDetailScreen() {
    const router = useRouter();
    const { ticketId } = useLocalSearchParams();
    const flatListRef = useRef(null);

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);

    const loadTicket = useCallback(async () => {
        try {
            const res = await api.get(`${API_ENDPOINTS.TICKETS}/${ticketId}`);
            if (res.success) setTicket(res.data);
        } catch (e) {
            console.error('Load ticket error:', e);
        } finally {
            setLoading(false);
        }
    }, [ticketId]);

    useFocusEffect(
        useCallback(() => {
            loadTicket();
        }, [loadTicket])
    );

    const handleSend = async () => {
        if (!inputText.trim() || sending) return;

        setSending(true);
        try {
            const res = await api.post(`${API_ENDPOINTS.TICKETS}/${ticketId}/messages`, {
                message: inputText.trim(),
            });
            if (res.success) {
                setInputText('');
                loadTicket(); // Reload to get updated messages
            }
        } catch (e) {
            console.error('Send message error:', e);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ArrowLeft size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ticket Details</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!ticket) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ArrowLeft size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ticket Not Found</Text>
                    <View style={{ width: 44 }} />
                </View>
            </SafeAreaView>
        );
    }

    const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
    const StatusIcon = statusCfg.icon;
    const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

    const renderMessage = ({ item: msg }) => {
        const isAdmin = msg.sender_role === 'admin';
        const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return (
            <View style={[styles.msgRow, isAdmin ? styles.msgRowAdmin : styles.msgRowCustomer]}>
                {isAdmin && (
                    <View style={styles.adminAvatar}>
                        <Ship size={14} color={Colors.white} />
                    </View>
                )}
                <View style={[styles.msgBubble, isAdmin ? styles.msgBubbleAdmin : styles.msgBubbleCustomer]}>
                    {isAdmin && (
                        <Text style={styles.senderName}>Ship2Door Support</Text>
                    )}
                    <Text style={[styles.msgText, isAdmin ? styles.msgTextAdmin : styles.msgTextCustomer]}>
                        {msg.message}
                    </Text>
                    <Text style={[styles.msgTime, isAdmin ? styles.msgTimeAdmin : styles.msgTimeCustomer]}>
                        {dateStr} • {timeStr}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{ticket.ticket_number}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                        <StatusIcon size={10} color={statusCfg.color} />
                        <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                    </View>
                </View>
                <View style={{ width: 44 }} />
            </View>

            {/* Ticket Info Card */}
            <View style={styles.infoCard}>
                <Text style={styles.subject}>{ticket.subject}</Text>
                <Text style={styles.category}>{CATEGORY_LABELS[ticket.category] || ticket.category}</Text>
                <Text style={styles.date}>
                    Created {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={ticket.messages || []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMessage}
                contentContainerStyle={styles.messageList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />

            {/* Input Bar (hidden if ticket is closed) */}
            {!isClosed ? (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 65 : 0}
                >
                    <View style={[styles.inputBar, { paddingBottom: Spacing.sm + 55 }]}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Type your reply..."
                                placeholderTextColor={Colors.textLight}
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
                            onPress={handleSend}
                            disabled={!inputText.trim() || sending}
                            activeOpacity={0.7}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                                <Send size={20} color={Colors.white} />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            ) : (
                <View style={styles.closedBar}>
                    <CheckCircle size={16} color={Colors.success} />
                    <Text style={styles.closedText}>This ticket has been {ticket.status}.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { alignItems: 'center' },
    headerTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2,
        paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full,
    },
    statusText: { fontSize: 10, fontWeight: '700' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    infoCard: {
        backgroundColor: Colors.white, marginHorizontal: Spacing.lg, marginTop: Spacing.md,
        borderRadius: BorderRadius.lg, padding: Spacing.lg,
        borderLeftWidth: 4, borderLeftColor: Colors.primary,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    subject: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
    category: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 4 },
    date: { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 4 },
    messageList: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
    msgRow: { flexDirection: 'row', marginBottom: Spacing.md, alignItems: 'flex-end' },
    msgRowAdmin: { justifyContent: 'flex-start' },
    msgRowCustomer: { justifyContent: 'flex-end' },
    adminAvatar: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm,
    },
    msgBubble: { maxWidth: '80%', borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
    msgBubbleAdmin: {
        backgroundColor: Colors.white, borderBottomLeftRadius: 4,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    msgBubbleCustomer: {
        backgroundColor: Colors.primary, borderBottomRightRadius: 4,
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
    },
    senderName: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
    msgText: { fontSize: Fonts.sizes.sm, lineHeight: 20 },
    msgTextAdmin: { color: Colors.text },
    msgTextCustomer: { color: Colors.white },
    msgTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
    msgTimeAdmin: { color: Colors.textLight },
    msgTimeCustomer: { color: 'rgba(255,255,255,0.7)' },
    inputBar: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm, backgroundColor: Colors.white,
        borderTopWidth: 1, borderTopColor: Colors.borderLight, gap: Spacing.sm,
    },
    inputContainer: {
        flex: 1, backgroundColor: Colors.background, borderRadius: BorderRadius.full,
        borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.lg, height: 44, justifyContent: 'center',
    },
    input: { fontSize: Fonts.sizes.md, color: Colors.text, height: '100%' },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
    },
    sendBtnDisabled: { opacity: 0.5 },
    closedBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        paddingVertical: Spacing.lg, paddingBottom: Spacing.xl + 55,
        backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.borderLight,
    },
    closedText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: '500' },
});

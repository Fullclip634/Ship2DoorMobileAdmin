import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput,
    TouchableOpacity, KeyboardAvoidingView, Platform,
    Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/Colors';
import { MessageCircle, Ship, ArrowLeft, Send, Ticket } from 'lucide-react-native';
import { getBotResponse, getWelcomeMessage, TICKET_CATEGORIES } from '../../services/chatbot';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/Api';

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────
let msgId = 0;
const nextId = () => `msg_${++msgId}`;

const createBotMessage = (text, quickReplies = [], action = null) => ({
    id: nextId(),
    text,
    quickReplies,
    action,
    sender: 'bot',
    time: new Date(),
});

const createUserMessage = (text) => ({
    id: nextId(),
    text,
    sender: 'user',
    time: new Date(),
});

// ────────────────────────────────────────────────
// Ticket Flow States
// ────────────────────────────────────────────────
const FLOW = {
    NONE: 'NONE',
    CATEGORY: 'CATEGORY',       // waiting for category selection
    DESCRIPTION: 'DESCRIPTION', // waiting for issue description
    ORDER_REF: 'ORDER_REF',     // waiting for optional order number
    CONFIRMING: 'CONFIRMING',   // waiting for confirm/cancel
};

// ────────────────────────────────────────────────
// Typing Indicator Dots
// ────────────────────────────────────────────────
const TypingIndicator = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = (dot, delay) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
                ])
            );
        const a1 = animate(dot1, 0);
        const a2 = animate(dot2, 200);
        const a3 = animate(dot3, 400);
        a1.start(); a2.start(); a3.start();
        return () => { a1.stop(); a2.stop(); a3.stop(); };
    }, []);

    const dotStyle = (dot) => ({
        opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
        transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
    });

    return (
        <View style={styles.typingRow}>
            <View style={styles.botAvatarSmall}>
                <MessageCircle size={14} color={Colors.white} />
            </View>
            <View style={styles.typingBubble}>
                {[dot1, dot2, dot3].map((dot, i) => (
                    <Animated.View key={i} style={[styles.typingDot, dotStyle(dot)]} />
                ))}
            </View>
        </View>
    );
};

// ────────────────────────────────────────────────
// Message Bubble
// ────────────────────────────────────────────────
const MessageBubble = ({ message }) => {
    const isBot = message.sender === 'bot';
    const timeStr = message.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Simple markdown-ish bold rendering
    const renderText = (text) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <Text key={i} style={{ fontWeight: '700' }}>
                        {part.slice(2, -2)}
                    </Text>
                );
            }
            return <Text key={i}>{part}</Text>;
        });
    };

    return (
        <View style={[styles.bubbleRow, isBot ? styles.bubbleRowBot : styles.bubbleRowUser]}>
            {isBot && (
                <View style={styles.botAvatar}>
                    <Ship size={16} color={Colors.white} />
                </View>
            )}
            <View style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}>
                <Text style={[styles.bubbleText, isBot ? styles.bubbleTextBot : styles.bubbleTextUser]}>
                    {renderText(message.text)}
                </Text>
                <Text style={[styles.bubbleTime, isBot ? styles.bubbleTimeBot : styles.bubbleTimeUser]}>
                    {timeStr}
                </Text>
            </View>
        </View>
    );
};

// ────────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────────
export default function SupportChatScreen() {
    const router = useRouter();
    const flatListRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [context, setContext] = useState({ orders: [], trips: [] });

    // Ticket flow state
    const [ticketFlow, setTicketFlow] = useState(FLOW.NONE);
    const [ticketDraft, setTicketDraft] = useState({
        category: null,
        subject: '',
        description: '',
        relatedOrderId: null,
    });

    // Load user data for context-aware responses
    useFocusEffect(
        useCallback(() => {
            const loadContext = async () => {
                try {
                    const [ordersRes, tripsRes] = await Promise.all([
                        api.get(API_ENDPOINTS.ORDERS),
                        api.get(API_ENDPOINTS.UPCOMING_TRIPS),
                    ]);
                    setContext({
                        orders: ordersRes.data || [],
                        trips: tripsRes.data || [],
                    });
                } catch (e) {
                    // Fail silently – chatbot works without context
                }
            };
            loadContext();
        }, [])
    );

    // Welcome message on mount
    useEffect(() => {
        const welcome = getWelcomeMessage();
        setMessages([createBotMessage(welcome.text, welcome.quickReplies)]);
    }, []);

    const addBotReply = useCallback((text, quickReplies = [], action = null) => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages((prev) => [...prev, createBotMessage(text, quickReplies, action)]);
            setIsTyping(false);
        }, 600 + Math.random() * 300);
    }, []);

    // ────────────────────────────────────────
    // Ticket Flow Handler
    // ────────────────────────────────────────
    const handleTicketFlow = useCallback(async (text) => {
        const userMsg = createUserMessage(text.trim());
        setMessages((prev) => [...prev, userMsg]);
        setInputText('');

        switch (ticketFlow) {
            case FLOW.CATEGORY: {
                // User picked a category
                const categoryKey = TICKET_CATEGORIES[text];
                if (!categoryKey) {
                    addBotReply(
                        "Please select one of the categories below:",
                        Object.keys(TICKET_CATEGORIES),
                    );
                    return;
                }
                setTicketDraft(prev => ({ ...prev, category: categoryKey, subject: text.replace(/^[^\s]+ /, '') }));
                setTicketFlow(FLOW.DESCRIPTION);
                addBotReply(
                    "📝 Got it. Please **describe your issue** in detail so our team can help you.",
                    ['Cancel ticket'],
                );
                break;
            }

            case FLOW.DESCRIPTION: {
                if (text.toLowerCase() === 'cancel ticket') {
                    setTicketFlow(FLOW.NONE);
                    setTicketDraft({ category: null, subject: '', description: '', relatedOrderId: null });
                    addBotReply(
                        "Ticket creation cancelled. How else can I help you?",
                        ['How to book', 'Track my order', 'Report an issue'],
                    );
                    return;
                }
                setTicketDraft(prev => ({ ...prev, description: text.trim() }));
                setTicketFlow(FLOW.ORDER_REF);

                const activeOrders = (context?.orders || []).filter(
                    (o) => !['delivered', 'cancelled'].includes(o.status)
                );

                if (activeOrders.length > 0) {
                    const orderReplies = activeOrders.slice(0, 4).map(o => o.order_number);
                    addBotReply(
                        "🔗 Is this related to a specific order? Tap an order below or type **\"skip\"** to proceed without one.",
                        [...orderReplies, 'Skip'],
                    );
                } else {
                    // No active orders, skip to confirmation
                    setTicketFlow(FLOW.CONFIRMING);
                    addBotReply(
                        `🎫 **Ticket Summary**\n\n• **Category**: ${text}\n• **Issue**: ${text.trim().substring(0, 80)}...\n\nShall I submit this ticket?`,
                        ['✅ Submit Ticket', 'Cancel ticket'],
                    );
                }
                break;
            }

            case FLOW.ORDER_REF: {
                if (text.toLowerCase() === 'cancel ticket') {
                    setTicketFlow(FLOW.NONE);
                    setTicketDraft({ category: null, subject: '', description: '', relatedOrderId: null });
                    addBotReply(
                        "Ticket creation cancelled. How else can I help you?",
                        ['How to book', 'Track my order', 'Report an issue'],
                    );
                    return;
                }

                let relatedOrderId = null;
                let orderRef = 'None';
                if (text.toLowerCase() !== 'skip') {
                    const matchedOrder = (context?.orders || []).find(o => o.order_number === text);
                    if (matchedOrder) {
                        relatedOrderId = matchedOrder.id;
                        orderRef = text;
                    }
                }

                setTicketDraft(prev => ({ ...prev, relatedOrderId }));
                setTicketFlow(FLOW.CONFIRMING);

                const draft = ticketDraft;
                addBotReply(
                    `🎫 **Ticket Summary**\n\n• **Category**: ${draft.subject || draft.category}\n• **Issue**: ${draft.description.substring(0, 100)}${draft.description.length > 100 ? '...' : ''}\n• **Related Order**: ${orderRef}\n\nShall I submit this ticket?`,
                    ['✅ Submit Ticket', 'Cancel ticket'],
                );
                break;
            }

            case FLOW.CONFIRMING: {
                if (text === '✅ Submit Ticket') {
                    // Submit the ticket via API
                    setIsTyping(true);
                    setMessages((prev) => [...prev]);
                    try {
                        const payload = {
                            category: ticketDraft.category,
                            subject: ticketDraft.subject || ticketDraft.category.replace('_', ' '),
                            message: ticketDraft.description,
                            related_order_id: ticketDraft.relatedOrderId,
                        };
                        const res = await api.post(API_ENDPOINTS.TICKETS, payload);
                        setIsTyping(false);

                        if (res.success) {
                            setMessages((prev) => [...prev, createBotMessage(
                                `✅ **Ticket Created!**\n\n🎫 Ticket Number: **${res.data.ticket_number}**\n\nOur support team has been notified and will respond shortly. You can track your tickets in **My Tickets**.\n\nIs there anything else I can help with?`,
                                ['View My Tickets', 'How to book', 'Track my order'],
                                'TICKET_CREATED',
                            )]);
                        } else {
                            setMessages((prev) => [...prev, createBotMessage(
                                "❌ Sorry, I couldn't create the ticket. Please try again or contact support directly.",
                                ['Report an issue', 'Contact support'],
                            )]);
                        }
                    } catch (e) {
                        setIsTyping(false);
                        setMessages((prev) => [...prev, createBotMessage(
                            "❌ Something went wrong while creating your ticket. Please try again.",
                            ['Report an issue', 'Contact support'],
                        )]);
                    }

                    setTicketFlow(FLOW.NONE);
                    setTicketDraft({ category: null, subject: '', description: '', relatedOrderId: null });
                } else {
                    // Cancel
                    setTicketFlow(FLOW.NONE);
                    setTicketDraft({ category: null, subject: '', description: '', relatedOrderId: null });
                    addBotReply(
                        "Ticket creation cancelled. How else can I help you?",
                        ['How to book', 'Track my order', 'Report an issue'],
                    );
                }
                break;
            }
        }
    }, [ticketFlow, ticketDraft, context, addBotReply]);

    // ────────────────────────────────────────
    // Normal Message Handler
    // ────────────────────────────────────────
    const sendMessage = useCallback((text) => {
        if (!text.trim()) return;

        // If in ticket flow, delegate to ticket handler
        if (ticketFlow !== FLOW.NONE) {
            handleTicketFlow(text.trim());
            return;
        }

        const userMsg = createUserMessage(text.trim());
        setMessages((prev) => [...prev, userMsg]);
        setInputText('');

        const botRes = getBotResponse(text.trim(), context);

        // Check if the response triggers ticket flow
        if (botRes.action === 'START_TICKET_FLOW') {
            setTicketFlow(FLOW.CATEGORY);
            addBotReply(botRes.text, botRes.quickReplies);
            return;
        }

        if (botRes.action === 'VIEW_TICKETS') {
            addBotReply(botRes.text, botRes.quickReplies);
            return;
        }

        addBotReply(botRes.text, botRes.quickReplies);
    }, [context, ticketFlow, handleTicketFlow, addBotReply]);

    const handleQuickReply = (reply) => {
        // Handle navigation quick replies
        if (reply === 'View My Tickets') {
            router.push('/(customer)/my-tickets');
            return;
        }
        sendMessage(reply);
    };

    const handleSend = () => {
        sendMessage(inputText);
    };

    // Get quick replies from the last bot message
    const lastBotMsg = [...messages].reverse().find((m) => m.sender === 'bot');
    const quickReplies = lastBotMsg?.quickReplies || [];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={styles.headerAvatar}>
                        <Ship size={18} color={Colors.white} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Ship2Door Support</Text>
                        <Text style={styles.headerStatus}>
                            {ticketFlow !== FLOW.NONE ? '🎫 Creating ticket...' : 'Online • Typically replies instantly'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.ticketBtn} onPress={() => router.push('/(customer)/my-tickets')}>
                    <Ticket size={20} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MessageBubble message={item} />}
                contentContainerStyle={styles.messageList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                ListFooterComponent={isTyping ? <TypingIndicator /> : null}
            />

            {/* Quick Replies */}
            {quickReplies.length > 0 && !isTyping && (
                <View style={styles.quickRepliesContainer}>
                    <FlatList
                        data={quickReplies}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item}
                        contentContainerStyle={styles.quickRepliesList}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.quickReplyChip,
                                    item === '✅ Submit Ticket' && styles.quickReplyChipSubmit,
                                    item === 'Cancel ticket' && styles.quickReplyChipCancel,
                                ]}
                                onPress={() => handleQuickReply(item)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.quickReplyText,
                                    item === '✅ Submit Ticket' && styles.quickReplyTextSubmit,
                                    item === 'Cancel ticket' && styles.quickReplyTextCancel,
                                ]}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {/* Input Bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 65 : 0}
            >
                <View style={[styles.inputBar, { paddingBottom: Spacing.sm + 55 }]}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder={ticketFlow === FLOW.DESCRIPTION ? 'Describe your issue...' : 'Type your question...'}
                            placeholderTextColor={Colors.textLight}
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={handleSend}
                            returnKeyType="send"
                            multiline={false}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                        activeOpacity={0.7}
                    >
                        <Send size={20} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    headerAvatar: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
    headerStatus: { fontSize: Fonts.sizes.xs, color: Colors.success, fontWeight: '500', marginTop: 1 },
    ticketBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryFaded,
        alignItems: 'center', justifyContent: 'center',
    },

    // Messages
    messageList: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
    bubbleRow: { flexDirection: 'row', marginBottom: Spacing.md, alignItems: 'flex-end' },
    bubbleRowBot: { justifyContent: 'flex-start' },
    bubbleRowUser: { justifyContent: 'flex-end' },
    botAvatar: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm,
    },
    bubble: { maxWidth: '78%', borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
    bubbleBot: {
        backgroundColor: Colors.white, borderBottomLeftRadius: 4,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    bubbleUser: {
        backgroundColor: Colors.primary, borderBottomRightRadius: 4,
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
    },
    bubbleText: { fontSize: Fonts.sizes.sm, lineHeight: 20 },
    bubbleTextBot: { color: Colors.text },
    bubbleTextUser: { color: Colors.white },
    bubbleTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
    bubbleTimeBot: { color: Colors.textLight },
    bubbleTimeUser: { color: 'rgba(255,255,255,0.7)' },

    // Typing indicator
    typingRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing.md },
    botAvatarSmall: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm,
    },
    typingBubble: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg, borderBottomLeftRadius: 4,
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, height: 40,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textLight },

    // Quick Replies
    quickRepliesContainer: { borderTopWidth: 1, borderTopColor: Colors.borderLight, backgroundColor: Colors.white },
    quickRepliesList: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.sm },
    quickReplyChip: {
        borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.primaryFaded,
    },
    quickReplyChipSubmit: {
        borderColor: Colors.success, backgroundColor: Colors.success,
    },
    quickReplyTextSubmit: { color: Colors.white },
    quickReplyChipCancel: {
        borderColor: Colors.error + '60', backgroundColor: Colors.errorLight,
    },
    quickReplyTextCancel: { color: Colors.error },
    quickReplyText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.primary },

    // Input Bar
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
});

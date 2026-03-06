/**
 * Ship2Door — Rule-Based Chatbot Engine
 *
 * Uses keyword matching to classify user messages into intents
 * and return pre-written, Ship2Door-specific responses.
 * Accepts optional context (orders, trips) for personalised answers.
 *
 * Now includes ticket escalation flow support.
 */

// ────────────────────────────────────────────────
// Intent Definitions
// ────────────────────────────────────────────────
const INTENTS = [
    {
        id: 'greeting',
        keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo'],
        response: () => ({
            text: "Hi there! 👋 I'm your Ship2Door assistant. How can I help you today?",
            quickReplies: ['How to book', 'Track my order', 'Delivery time', 'Report an issue'],
        }),
    },
    {
        id: 'booking_help',
        keywords: ['book', 'shipment', 'send', 'ship', 'how to send', 'package', 'parcel', 'cargo', 'how to book'],
        response: () => ({
            text: "📦 **How to Book a Shipment**\n\n1. Go to the **Trips** tab at the bottom\n2. Find an upcoming trip and tap on it\n3. Tap **\"Book Shipment\"**\n4. Fill in the receiver's name, phone, address, and item description\n5. Tap **\"Submit Booking\"**\n\nYour order will be confirmed by the admin shortly!",
            quickReplies: ['Delivery time', 'Pricing info', 'Track my order'],
        }),
    },
    {
        id: 'order_tracking',
        keywords: ['track', 'status', 'where', 'order', 'my order', 'update', 'progress', 'check'],
        response: (context) => {
            const activeOrders = (context?.orders || []).filter(
                (o) => !['delivered', 'cancelled'].includes(o.status)
            );

            if (activeOrders.length === 0) {
                return {
                    text: "📋 You don't have any active orders right now.\n\nTo book a new shipment, go to the **Trips** tab and select an upcoming trip.",
                    quickReplies: ['How to book', 'Trip schedule', 'Report an issue'],
                };
            }

            const orderLines = activeOrders
                .slice(0, 5)
                .map((o) => `• **${o.order_number}** — ${formatStatus(o.status)}`)
                .join('\n');

            return {
                text: `📋 You have **${activeOrders.length}** active order${activeOrders.length > 1 ? 's' : ''}:\n\n${orderLines}\n\nGo to **My Orders** to view full details.`,
                quickReplies: ['Delivery time', 'Report an issue', 'Contact support'],
            };
        },
    },
    {
        id: 'delivery_time',
        keywords: ['how long', 'delivery', 'arrive', 'time', 'duration', 'days', 'eta', 'when'],
        response: () => ({
            text: "🚢 **Estimated Delivery Times**\n\n• **Manila → Bohol**: 2–3 business days\n• **Bohol → Manila**: 2–3 business days\n\nDelivery times may vary depending on weather conditions and cargo volume. You'll receive notifications at every stage of your shipment.",
            quickReplies: ['Track my order', 'Trip schedule', 'How to book'],
        }),
    },
    {
        id: 'cancel_order',
        keywords: ['cancel', 'refund', 'remove', 'delete order', 'undo'],
        response: () => ({
            text: "❌ **Cancelling an Order**\n\nYou can cancel an order **only while it's still pending**.\n\n1. Go to **My Orders**\n2. Tap the order you want to cancel\n3. Tap **\"Cancel Order\"** at the bottom\n\nOnce an order is confirmed or picked up, it cannot be cancelled. Please contact support for special cases.",
            quickReplies: ['Track my order', 'Report an issue', 'Pricing info'],
        }),
    },
    {
        id: 'pricing',
        keywords: ['price', 'cost', 'fee', 'how much', 'rate', 'charge', 'payment', 'pay'],
        response: () => ({
            text: "💰 **Pricing Information**\n\nShipping rates are based on the size and weight of your items. For a detailed quote, please contact our support team.\n\n📧 support@ship2door.com\n📱 Contact through the app\n\nPayment can be arranged upon booking confirmation.",
            quickReplies: ['How to book', 'Report an issue', 'Delivery time'],
        }),
    },
    {
        id: 'trip_schedule',
        keywords: ['trip', 'schedule', 'next trip', 'upcoming', 'when is', 'next', 'route', 'voyage'],
        response: (context) => {
            const trips = context?.trips || [];

            if (trips.length === 0) {
                return {
                    text: "📅 There are no upcoming trips scheduled at the moment.\n\nCheck back soon or enable notifications to be alerted when new trips are posted!",
                    quickReplies: ['How to book', 'Report an issue'],
                };
            }

            const tripLines = trips
                .slice(0, 3)
                .map((t) => {
                    const dir = t.direction === 'bohol_to_manila' ? 'Bohol → Manila' : 'Manila → Bohol';
                    const date = new Date(t.departure_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    });
                    return `• **${dir}** — Departs ${date}`;
                })
                .join('\n');

            return {
                text: `📅 **Upcoming Trips**\n\n${tripLines}\n\nGo to the **Trips** tab to view all trips and book a shipment.`,
                quickReplies: ['How to book', 'Delivery time', 'Pricing info'],
            };
        },
    },
    {
        id: 'contact_support',
        keywords: ['contact', 'phone', 'email', 'support', 'help', 'agent', 'human', 'speak', 'call', 'reach'],
        response: () => ({
            text: "📞 **Contact Support**\n\n• **Email**: support@ship2door.com\n• **Phone**: +63 XXX XXX XXXX\n• **Hours**: Monday – Saturday, 8 AM – 6 PM\n\nOr you can create a **support ticket** right here and our team will respond!\n\nWould you like to report an issue?",
            quickReplies: ['Report an issue', 'How to book', 'Track my order'],
        }),
    },
    {
        id: 'account_help',
        keywords: ['password', 'account', 'profile', 'login', 'sign in', 'change password', 'edit', 'update'],
        response: () => ({
            text: "🔑 **Account Help**\n\n• **Update Profile**: Go to **Profile → Personal Information**\n• **Change Password**: Go to **Profile → Change Password**\n• **Forgot Password**: On the login screen, tap **\"Forgot Password?\"** to receive a reset code via email\n\nIf you're having trouble, contact our support team.",
            quickReplies: ['Report an issue', 'How to book', 'Track my order'],
        }),
    },
    {
        id: 'create_ticket',
        keywords: ['report', 'issue', 'problem', 'complaint', 'damaged', 'missing', 'wrong', 'broken', 'lost', 'late', 'delayed', 'ticket', 'escalate'],
        response: () => ({
            text: "🎫 I'm sorry to hear you're having an issue. I'll help you **create a support ticket** so our team can assist you.\n\nWhat type of issue are you experiencing?",
            quickReplies: ['📦 Order Issue', '🚚 Delivery Problem', '💰 Payment', '❓ General Inquiry', '🐛 App Bug'],
            action: 'START_TICKET_FLOW',
        }),
    },
    {
        id: 'view_tickets',
        keywords: ['my tickets', 'ticket status', 'tickets', 'view ticket', 'check ticket'],
        response: () => ({
            text: "🎫 You can view all your support tickets in **My Tickets**.\n\nGo to **Profile → My Tickets** or tap below to check on an existing ticket.",
            quickReplies: ['Report an issue', 'Track my order', 'Contact support'],
            action: 'VIEW_TICKETS',
        }),
    },
    {
        id: 'thank_you',
        keywords: ['thanks', 'thank you', 'thank', 'appreciate', 'helpful', 'great', 'awesome', 'nice'],
        response: () => ({
            text: "You're welcome! 😊 Happy to help. Is there anything else I can assist you with?",
            quickReplies: ['How to book', 'Track my order', 'Trip schedule', 'Report an issue'],
        }),
    },
    {
        id: 'goodbye',
        keywords: ['bye', 'goodbye', 'see you', 'later', 'exit', 'close', 'done', 'that\'s all'],
        response: () => ({
            text: "Goodbye! 👋 If you need help in the future, I'm always here. Have a great day!",
            quickReplies: [],
        }),
    },
];

// ────────────────────────────────────────────────
// Ticket Flow Category Mapping
// ────────────────────────────────────────────────
export const TICKET_CATEGORIES = {
    '📦 Order Issue': 'order_issue',
    '🚚 Delivery Problem': 'delivery_problem',
    '💰 Payment': 'payment',
    '❓ General Inquiry': 'general_inquiry',
    '🐛 App Bug': 'app_bug',
};

export const CATEGORY_LABELS = {
    order_issue: '📦 Order Issue',
    delivery_problem: '🚚 Delivery Problem',
    payment: '💰 Payment',
    general_inquiry: '❓ General Inquiry',
    app_bug: '🐛 App Bug',
};

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────
const STATUS_LABELS = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    pickup_scheduled: 'Pickup Scheduled',
    picked_up: 'Picked Up',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

function formatStatus(status) {
    return STATUS_LABELS[status] || status;
}

// ────────────────────────────────────────────────
// Main Engine
// ────────────────────────────────────────────────

/**
 * Process a user message and return a bot response.
 * @param {string} message   – The user's input text
 * @param {object} context   – Optional { orders: [], trips: [] }
 * @returns {{ text: string, quickReplies: string[], action?: string }}
 */
export function getBotResponse(message, context = {}) {
    const input = message.toLowerCase().trim();

    if (!input) {
        return {
            text: "I didn't catch that. Could you rephrase your question?",
            quickReplies: ['How to book', 'Track my order', 'Report an issue'],
        };
    }

    // Score each intent by how many keywords match
    let bestIntent = null;
    let bestScore = 0;

    for (const intent of INTENTS) {
        let score = 0;
        for (const keyword of intent.keywords) {
            if (input.includes(keyword)) {
                // Longer keywords get more weight (phrase matching)
                score += keyword.split(' ').length;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestIntent = intent;
        }
    }

    if (bestIntent) {
        return bestIntent.response(context);
    }

    // Fallback – no intent matched
    return {
        text: "I'm not sure I understand that question. Here are some things I can help you with:",
        quickReplies: ['How to book', 'Track my order', 'Delivery time', 'Pricing info', 'Report an issue'],
    };
}

/**
 * Returns the welcome message shown when the chat opens.
 */
export function getWelcomeMessage() {
    return {
        text: "👋 **Welcome to Ship2Door Support!**\n\nI'm your virtual assistant. I can help you with booking shipments, tracking orders, delivery times, and more.\n\nIf you need human support, just say **\"report an issue\"** and I'll create a ticket for you!\n\nTap a topic below or type your question!",
        quickReplies: ['How to book', 'Track my order', 'Delivery time', 'Trip schedule', 'Report an issue'],
    };
}

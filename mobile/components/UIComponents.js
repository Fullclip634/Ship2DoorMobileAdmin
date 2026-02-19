import { View, Text, StyleSheet, Image, ActivityIndicator, Pressable } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export const StatusBadge = ({ status, size = 'md' }) => {
    const statusConfig = {
        // Trip statuses
        upcoming: { label: 'Upcoming', color: Colors.info, bg: Colors.infoLight, icon: 'calendar-outline' },
        pickup_phase: { label: 'Pickup Phase', color: Colors.warning, bg: Colors.warningLight, icon: 'cube-outline' },
        in_transit: { label: 'In Transit', color: Colors.primaryDark, bg: Colors.primaryFaded, icon: 'car-outline' },
        boarding_ship: { label: 'Boarding Ship', color: '#6366F1', bg: '#EEF2FF', icon: 'boat-outline' },
        at_sea: { label: 'At Sea', color: '#0EA5E9', bg: '#F0F9FF', icon: 'water-outline' },
        arrived: { label: 'Arrived', color: Colors.success, bg: Colors.successLight, icon: 'location-outline' },
        delivering: { label: 'Delivering', color: '#8B5CF6', bg: '#F5F3FF', icon: 'bicycle-outline' },
        completed: { label: 'Completed', color: Colors.success, bg: Colors.successLight, icon: 'checkmark-circle-outline' },
        cancelled: { label: 'Cancelled', color: Colors.error, bg: Colors.errorLight, icon: 'close-circle-outline' },
        // Order statuses
        pending: { label: 'Pending', color: Colors.warning, bg: Colors.warningLight, icon: 'time-outline' },
        confirmed: { label: 'Confirmed', color: Colors.info, bg: Colors.infoLight, icon: 'checkmark-outline' },
        pickup_scheduled: { label: 'Pickup Scheduled', color: '#6366F1', bg: '#EEF2FF', icon: 'calendar-outline' },
        picked_up: { label: 'Picked Up', color: '#8B5CF6', bg: '#F5F3FF', icon: 'cube-outline' },
        delivered: { label: 'Delivered', color: Colors.success, bg: Colors.successLight, icon: 'checkmark-circle-outline' },
    };

    const config = statusConfig[status] || { label: status, color: Colors.textSecondary, bg: Colors.borderLight, icon: 'help-outline' };
    const isSmall = size === 'sm';

    return (
        <View style={[styles.badge, { backgroundColor: config.bg }, isSmall && styles.badgeSmall]}>
            <Ionicons name={config.icon} size={isSmall ? 12 : 14} color={config.color} />
            <Text style={[styles.badgeText, { color: config.color }, isSmall && styles.badgeTextSmall]}>
                {config.label}
            </Text>
        </View>
    );
};

export const DirectionBadge = ({ direction }) => {
    const isToManila = direction === 'bohol_to_manila';
    return (
        <View style={[styles.directionBadge, { backgroundColor: isToManila ? Colors.secondaryFaded : Colors.primaryFaded }]}>
            <Ionicons
                name={isToManila ? 'arrow-up' : 'arrow-down'}
                size={14}
                color={isToManila ? Colors.secondary : Colors.primary}
            />
            <Text style={[styles.directionText, { color: isToManila ? Colors.secondary : Colors.primary }]}>
                {isToManila ? 'Bohol to Manila' : 'Manila to Bohol'}
            </Text>
        </View>
    );
};

export const EmptyState = ({ icon, title, message }) => (
    <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
            <Ionicons name={icon || 'cube-outline'} size={48} color={Colors.textLight} />
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        {message && <Text style={styles.emptyMessage}>{message}</Text>}
    </View>
);

export const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
    </View>
);

export const StatCard = ({ icon, label, value, color }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIconWrap, { backgroundColor: (color || Colors.primary) + '15' }]}>
            <Ionicons name={icon} size={22} color={color || Colors.primary} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

export const SectionHeader = ({ title, actionText, onAction }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {actionText && (
            <Text style={styles.sectionAction} onPress={onAction}>{actionText}</Text>
        )}
    </View>
);

export const MenuItem = ({ icon, iconBg, label, subtitle, onPress, trailing, danger }) => (
    <Pressable
        style={({ pressed }) => [
            styles.menuItem,
            pressed && { backgroundColor: Colors.borderLight }
        ]}
        onPress={onPress}
    >
        <View style={[styles.menuIcon, { backgroundColor: iconBg || Colors.secondaryFaded }]}>
            <Ionicons name={icon} size={19} color={danger ? Colors.error : Colors.white} />
        </View>
        <View style={styles.menuContent}>
            <Text style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</Text>
            {subtitle ? <Text style={styles.menuSub}>{subtitle}</Text> : null}
        </View>
        {trailing !== undefined ? trailing : <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />}
    </Pressable>
);

export const MenuDivider = () => <View style={styles.menuDivider} />;

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BorderRadius.full,
        gap: 4,
        alignSelf: 'flex-start',
    },
    badgeSmall: {
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    badgeText: {
        fontSize: Fonts.sizes.xs,
        fontWeight: '600',
    },
    badgeTextSmall: {
        fontSize: 10,
    },
    directionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BorderRadius.full,
        gap: 4,
        alignSelf: 'flex-start',
    },
    directionText: {
        fontSize: Fonts.sizes.xs,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    emptyMessage: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    statIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    statValue: {
        fontSize: Fonts.sizes.xxl,
        fontWeight: '700',
        color: Colors.text,
    },
    statLabel: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textSecondary,
        fontWeight: '500',
        marginTop: 2,
        textAlign: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
        marginTop: Spacing.xl,
    },
    sectionTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    sectionAction: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '600',
        color: Colors.primary,
    },
    // Menu Items
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuContent: {
        flex: 1,
    },
    menuLabel: {
        fontSize: Fonts.sizes.md,
        fontWeight: '600',
        color: Colors.text,
    },
    menuSub: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textSecondary,
        marginTop: 1,
    },
    menuDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.border,
        marginLeft: 62,
    },
});

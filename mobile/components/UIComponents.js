import { View, Text, StyleSheet, Image, ActivityIndicator, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/Colors';
import Icon from './LucideIcon';
import AnimatedPressable from './AnimatedPressable';

export const StatusBadge = ({ status, size = 'md' }) => {
    const statusConfig = {
        // Trip statuses
        upcoming: { label: 'Upcoming', color: Colors.info, bg: Colors.infoLight, icon: 'calendar' },
        pickup_phase: { label: 'Pickup Phase', color: Colors.warning, bg: Colors.warningLight, icon: 'package' },
        in_transit: { label: 'In Transit', color: Colors.primaryDark, bg: Colors.primaryFaded, icon: 'truck' },
        boarding_ship: { label: 'Boarding Ship', color: Colors.indigo, bg: Colors.indigoLight, icon: 'ship' },
        at_sea: { label: 'At Sea', color: Colors.sky, bg: Colors.skyLight, icon: 'waves' },
        arrived: { label: 'Arrived', color: Colors.success, bg: Colors.successLight, icon: 'map-pin-check' },
        delivering: { label: 'Delivering', color: Colors.purple, bg: Colors.purpleLight, icon: 'bike' },
        completed: { label: 'Completed', color: Colors.success, bg: Colors.successLight, icon: 'check-circle' },
        cancelled: { label: 'Cancelled', color: Colors.error, bg: Colors.errorLight, icon: 'x-circle' },
        // Order statuses
        pending: { label: 'Pending', color: Colors.warning, bg: Colors.warningLight, icon: 'clock' },
        confirmed: { label: 'Confirmed', color: Colors.info, bg: Colors.infoLight, icon: 'check' },
        pickup_scheduled: { label: 'Pickup Scheduled', color: Colors.indigo, bg: Colors.indigoLight, icon: 'calendar-check' },
        picked_up: { label: 'Picked Up', color: Colors.purple, bg: Colors.purpleLight, icon: 'package-check' },
        delivered: { label: 'Delivered', color: Colors.success, bg: Colors.successLight, icon: 'check-circle' },
    };

    const config = statusConfig[status] || { label: status, color: Colors.textSecondary, bg: Colors.borderLight, icon: 'help-circle' };
    const isSmall = size === 'sm';

    return (
        <View style={[styles.badge, { backgroundColor: config.bg }, isSmall && styles.badgeSmall]}>
            <Icon name={config.icon} size={isSmall ? 12 : 14} color={config.color} strokeWidth={2.5} />
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
            <Icon
                name={isToManila ? 'arrow-up' : 'arrow-down'}
                size={14}
                color={isToManila ? Colors.secondary : Colors.primary}
                strokeWidth={2.5}
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
            <Icon name={icon || 'package'} size={48} color={Colors.textLight} strokeWidth={1.5} />
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

export const GlassCard = ({ children, style, intensity = 60, tint = "light" }) => (
    <View style={[styles.glassCardContainer, style]}>
        <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
        {children}
    </View>
);

export const StatCard = ({ icon, label, value, color }) => (
    <AnimatedPressable scaleTo={0.98} style={styles.statCard}>
        <View style={[styles.statIconWrap, { backgroundColor: (color || Colors.primary) + '15' }]}>
            <Icon name={icon} size={22} color={color || Colors.primary} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </AnimatedPressable>
);

export const SectionHeader = ({ title, actionText, onAction }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {actionText && (
            <Pressable onPress={onAction} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                <Text style={styles.sectionAction}>{actionText}</Text>
            </Pressable>
        )}
    </View>
);

export const MenuItem = ({ icon, iconBg, iconColor, label, subtitle, onPress, trailing, danger }) => {
    const defaultIconColor = iconBg ? Colors.white : Colors.secondary;
    return (
        <AnimatedPressable
            scaleTo={0.98}
            onPress={onPress}
        >
            <View style={styles.menuItem}>
                <View style={[styles.menuIcon, { backgroundColor: iconBg || Colors.secondaryFaded }]}>
                    <Icon name={icon} size={19} color={danger ? Colors.error : (iconColor || defaultIconColor)} />
                </View>
                <View style={styles.menuContent}>
                    <Text style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</Text>
                    {subtitle ? <Text style={styles.menuSub}>{subtitle}</Text> : null}
                </View>
                {trailing !== undefined ? trailing : <Icon name="chevron-right" size={18} color={Colors.textLight} />}
            </View>
        </AnimatedPressable>
    );
};

export const MenuDivider = () => <View style={styles.menuDivider} />;

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        gap: 6,
        alignSelf: 'flex-start',
    },
    badgeSmall: {
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: {
        fontSize: Fonts.sizes.xs,
        fontFamily: Fonts.semiBold,
    },
    badgeTextSmall: {
        fontSize: 11,
    },
    directionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        gap: 6,
        alignSelf: 'flex-start',
    },
    directionText: {
        fontSize: Fonts.sizes.xs,
        fontFamily: Fonts.bold,
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
        fontFamily: Fonts.bold,
        color: Colors.text,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    emptyMessage: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        fontFamily: Fonts.regular,
        textAlign: 'center',
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    glassCardContainer: {
        overflow: 'hidden',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)', // subtle glass border
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        alignItems: 'center',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4,
    },
    statIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 16, // squircle shape
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    statValue: {
        fontSize: Fonts.sizes.xxl,
        fontFamily: Fonts.extraBold,
        color: Colors.text,
    },
    statLabel: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        fontFamily: Fonts.medium,
        marginTop: 4,
        textAlign: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
        marginTop: Spacing.xxl,
    },
    sectionTitle: {
        fontSize: Fonts.sizes.lg,
        fontFamily: Fonts.bold,
        color: Colors.text,
        letterSpacing: -0.3,
    },
    sectionAction: {
        fontSize: Fonts.sizes.sm,
        fontFamily: Fonts.semiBold,
        color: Colors.primary,
    },
    // Menu Items
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: Spacing.xl,
        gap: Spacing.md,
        backgroundColor: Colors.white,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuContent: {
        flex: 1,
    },
    menuLabel: {
        fontSize: Fonts.sizes.md,
        fontFamily: Fonts.semiBold,
        color: Colors.text,
    },
    menuSub: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textSecondary,
        fontFamily: Fonts.regular,
        marginTop: 2,
    },
    menuDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.border,
        marginLeft: 76,
    },
});

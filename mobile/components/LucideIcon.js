/**
 * Centralized Lucide icon utility.
 * Provides a dynamic <Icon /> wrapper that renders Lucide icons by string name,
 * enabling backward-compatible usage in components like StatusBadge, MenuItem, etc.
 */
import {
    ArrowLeft, ArrowRight, ArrowDown, ArrowUp, ArrowRightCircle,
    ChevronRight, ChevronDown,
    Ship, Package, PackageCheck, PackageOpen,
    User, Users, UserCircle,
    Mail, Lock, LockOpen, LockKeyhole,
    Phone, MapPin, MapPinCheck,
    Eye, EyeOff,
    Bell, Home,
    Calendar, CalendarCheck, Clock,
    Check, CheckCircle, XCircle, X, CircleAlert, BellOff,
    Plus, PlusCircle,
    Search, Flag, Truck, Waves, Bike,
    Weight, Layers, FileText, File,
    ShieldCheck, Megaphone,
    Trash2, Send, MessageCircle, HelpCircle,
    LogOut, Navigation, Building2, Map,
    Grid3X3, CircleDot, ChevronUp, Pin, BarChart3, AlertTriangle
} from 'lucide-react-native';

// ── Map of string names → Lucide components ──
const iconMap = {
    // Navigation
    'arrow-left': ArrowLeft,
    'arrow-right': ArrowRight,
    'arrow-down': ArrowDown,
    'arrow-up': ArrowUp,
    'arrow-right-circle': ArrowRightCircle,
    'chevron-right': ChevronRight,
    'chevron-down': ChevronDown,
    'chevron-up': ChevronUp,

    // Shipping & Packages
    'ship': Ship,
    'package': Package,
    'package-check': PackageCheck,
    'package-open': PackageOpen,

    // People
    'user': User,
    'users': Users,
    'user-circle': UserCircle,

    // Auth
    'mail': Mail,
    'lock': Lock,
    'lock-open': LockOpen,
    'lock-keyhole': LockKeyhole,
    'eye': Eye,
    'eye-off': EyeOff,
    'shield-check': ShieldCheck,

    // Contact & Location
    'phone': Phone,
    'map-pin': MapPin,
    'map-pin-check': MapPinCheck,
    'navigation': Navigation,
    'building': Building2,
    'map': Map,

    // UI
    'bell': Bell,
    'bell-off': BellOff,
    'home': Home,
    'search': Search,
    'plus': Plus,
    'plus-circle': PlusCircle,
    'x': X,
    'x-circle': XCircle,
    'help-circle': HelpCircle,

    // Status
    'calendar': Calendar,
    'calendar-check': CalendarCheck,
    'clock': Clock,
    'check': Check,
    'check-circle': CheckCircle,
    'circle-alert': CircleAlert,
    'flag': Flag,

    // Transport
    'truck': Truck,
    'waves': Waves,
    'bike': Bike,

    // Content
    'weight': Weight,
    'layers': Layers,
    'file-text': FileText,
    'file': File,

    // Actions
    'megaphone': Megaphone,
    'trash': Trash2,
    'send': Send,
    'message-circle': MessageCircle,
    'log-out': LogOut,
    'grid': Grid3X3,
    'circle-dot': CircleDot,
    'pin': Pin,
    'bar-chart-3': BarChart3,
    'alert-triangle': AlertTriangle,
};

/**
 * Renders a Lucide icon by string name.
 * @param {string} name - Icon name from the iconMap
 * @param {number} size - Icon size (default 20)
 * @param {string} color - Icon color
 * @param {number} strokeWidth - Stroke width (default 2)
 * @param {object} style - Additional style
 */
export const Icon = ({ name, size = 20, color = '#000', strokeWidth = 2, style }) => {
    const LucideComponent = iconMap[name];
    if (!LucideComponent) {
        console.warn(`[LucideIcon] Unknown icon name: "${name}"`);
        return null;
    }
    return <LucideComponent size={size} color={color} strokeWidth={strokeWidth} style={style} />;
};

/**
 * Returns the Lucide component for a given string name
 */
export const getIconComponent = (name) => iconMap[name] || HelpCircle;

export { iconMap };
export default Icon;

import { Tabs } from 'expo-router';
import {
  Briefcase,
  Calendar,
  Car,
  CircleUserRound,
  FileText,
  Gauge,
  Home,
  LayoutGrid,
  Mail,
  Menu,
  User,
  type LucideIcon,
} from 'lucide-react-native';
import { View } from 'react-native';

import { t } from '../../lib/i18n/i18n';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

const TAB_ICON_SIZE = 24;

function TabBarIcon({
  focused,
  Icon,
  activeColor,
  inactiveColor,
}: {
  focused: boolean;
  Icon: LucideIcon;
  activeColor: string;
  inactiveColor: string;
}) {
  const { isDark } = useTheme();
  const tint = isDark ? 'rgba(91, 118, 224, 0.28)' : 'rgba(44, 84, 198, 0.14)';
  const color = focused ? activeColor : inactiveColor;

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: TAB_ICON_SIZE + 4,
        minHeight: TAB_ICON_SIZE + 4,
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 14,
        backgroundColor: focused ? tint : 'transparent',
      }}
    >
      <Icon size={TAB_ICON_SIZE} color={color} strokeWidth={2} />
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const { isGuest } = useAuthStore();
  const hideWhenGuest: { href: null } | Record<string, never> = isGuest ? { href: null } : {};
  const hideWhenMember: { href: null } | Record<string, never> = isGuest ? {} : { href: null };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 78,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              Icon={Home}
              activeColor={colors.primary}
              inactiveColor={colors.mutedText}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: t('tabs.services'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              Icon={LayoutGrid}
              activeColor={colors.primary}
              inactiveColor={colors.mutedText}
            />
          ),
          ...hideWhenMember,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: t('tabs.sales'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              Icon={Car}
              activeColor={colors.primary}
              inactiveColor={colors.mutedText}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: t('tabs.book'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              Icon={Calendar}
              activeColor={colors.primary}
              inactiveColor={colors.mutedText}
            />
          ),
          ...hideWhenGuest,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: t('tabs.contact'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              Icon={Mail}
              activeColor={colors.primary}
              inactiveColor={colors.mutedText}
            />
          ),
          ...hideWhenMember,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              Icon={Gauge}
              activeColor={colors.primary}
              inactiveColor={colors.mutedText}
            />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: t('tabs.cases'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              Icon={Briefcase}
              activeColor={colors.primary}
              inactiveColor={colors.mutedText}
            />
          ),
          ...hideWhenGuest,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: t('tabs.documents'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              Icon={FileText}
              activeColor={colors.primary}
              inactiveColor={colors.mutedText}
            />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              Icon={User}
              activeColor={colors.primary}
              inactiveColor={colors.mutedText}
            />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('tabs.more'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              Icon={Menu}
              activeColor={colors.primary}
              inactiveColor={colors.mutedText}
            />
          ),
          ...hideWhenGuest,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t('tabs.account'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              Icon={CircleUserRound}
              activeColor={colors.primary}
              inactiveColor={colors.mutedText}
            />
          ),
          ...hideWhenMember,
        }}
      />
    </Tabs>
  );
}

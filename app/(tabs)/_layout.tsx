import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { t } from '../../lib/i18n/i18n';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { isGuest } = useAuthStore();
  const hideWhenGuest = isGuest ? { href: null as const } : {};

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: t('tabs.services'),
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: t('tabs.book'),
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: t('tabs.contact'),
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'mail' : 'mail-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'speedometer' : 'speedometer-outline'} size={size} color={color} />,
          ...hideWhenGuest,
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: t('tabs.cases'),
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={size} color={color} />,
          ...hideWhenGuest,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: t('tabs.documents'),
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={size} color={color} />,
          ...hideWhenGuest,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />,
          ...hideWhenGuest,
        }}
      />
    </Tabs>
  );
}

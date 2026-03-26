import { Tabs } from 'expo-router';

import { useAuthStore } from '../../store/auth-store';

export default function TabsLayout() {
  const { isGuest } = useAuthStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1D4ED8',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Services' }} />
      <Tabs.Screen name="cases" options={{ title: 'Cases', href: isGuest ? null : undefined }} />
      <Tabs.Screen name="book" options={{ title: 'Book Service' }} />
      <Tabs.Screen name="documents" options={{ title: 'Documents', href: isGuest ? null : undefined }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

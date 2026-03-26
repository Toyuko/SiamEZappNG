import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuthStore } from '../../store/auth-store';

export default function HomeScreen() {
  const router = useRouter();
  const { isGuest } = useAuthStore();
  const services = [
    { id: 'visa-consultation', title: 'Visa Consultation', subtitle: 'Personalized visa strategy and requirements review.' },
    { id: 'work-permit', title: 'Work Permit Assistance', subtitle: 'End-to-end support for permit filing and follow-up.' },
    { id: 'family-visa', title: 'Family Visa Service', subtitle: 'Guidance on spouse and dependent visa pathways.' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View>
          <Text className="text-2xl font-bold text-slate-900">Browse Services</Text>
          <Text className="mt-1 text-slate-500">Explore available services and book in minutes.</Text>
        </View>

        {isGuest ? (
          <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Text className="font-semibold text-amber-900">Guest mode</Text>
            <Text className="mt-1 text-amber-800">You can browse services and book now. Sign up anytime to track your case progress.</Text>
          </View>
        ) : null}

        <View className="gap-3">
          {services.map((service) => (
            <View key={service.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <Text className="text-base font-semibold text-slate-900">{service.title}</Text>
              <Text className="mt-1 text-slate-500">{service.subtitle}</Text>
              <Pressable
                className="mt-4 rounded-xl bg-blue-700 px-4 py-3"
                onPress={() => router.push({ pathname: '/(tabs)/book', params: { service: service.title } })}
              >
                <Text className="text-center font-semibold text-white">Book this service</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useCreateBooking } from '../../hooks/use-create-booking';
import { useAuthStore } from '../../store/auth-store';

export default function BookScreen() {
  const router = useRouter();
  const { service } = useLocalSearchParams<{ service?: string }>();
  const { isGuest, guestProfile, user, updateGuestProfile } = useAuthStore();
  const bookingMutation = useCreateBooking();
  const [name, setName] = useState(isGuest ? guestProfile?.name ?? '' : user?.name ?? '');
  const [email, setEmail] = useState(isGuest ? guestProfile?.email ?? '' : user?.email ?? '');
  const [phone, setPhone] = useState(isGuest ? guestProfile?.phone ?? '' : '');
  const [notes, setNotes] = useState('');
  const [booked, setBooked] = useState(false);

  const selectedService = service ?? 'Visa Consultation';

  const handleBooking = async () => {
    if (!name || !email || (isGuest && !phone)) {
      Alert.alert('Missing details', 'Please provide name, email, and phone to continue.');
      return;
    }

    try {
      await bookingMutation.mutateAsync({
        service: selectedService,
        name,
        email,
        phone: isGuest ? phone : undefined,
        notes,
        isGuest,
      });
      if (isGuest) {
        updateGuestProfile({ name, email, phone });
      }
      setBooked(true);
    } catch (error) {
      Alert.alert('Booking failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4">
      {!booked ? (
        <>
          <Text className="text-2xl font-bold text-slate-900">Book Service</Text>
          <Text className="mt-1 text-slate-500">Complete this form and we will contact you shortly.</Text>

          <View className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <Text className="text-sm text-slate-500">Selected service</Text>
            <Text className="mt-1 font-semibold text-slate-900">{selectedService}</Text>
          </View>

          <View className="mt-4 gap-3">
            <TextInput className="rounded-xl border border-slate-300 bg-white px-4 py-3" placeholder="Name" value={name} onChangeText={setName} />
            <TextInput
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput className="rounded-xl border border-slate-300 bg-white px-4 py-3" keyboardType="phone-pad" placeholder="Phone" value={phone} onChangeText={setPhone} />
            <TextInput
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              placeholder="Additional notes (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <Pressable className="rounded-xl bg-blue-700 px-4 py-3" onPress={() => void handleBooking()} disabled={bookingMutation.isPending}>
              <Text className="text-center font-semibold text-white">{bookingMutation.isPending ? 'Submitting...' : 'Confirm Booking'}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <Text className="text-xl font-bold text-emerald-900">Booking successful</Text>
          <Text className="mt-2 text-emerald-800">Create an account to track your case.</Text>
          <View className="mt-4 gap-3">
            <Pressable className="rounded-xl bg-blue-700 px-4 py-3" onPress={() => router.replace('/(auth)/signup')}>
              <Text className="text-center font-semibold text-white">Sign Up</Text>
            </Pressable>
            <Pressable className="rounded-xl border border-slate-300 bg-white px-4 py-3" onPress={() => router.replace('/(auth)/login')}>
              <Text className="text-center font-semibold text-slate-700">Login</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

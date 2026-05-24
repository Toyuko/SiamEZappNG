import { useLocalSearchParams } from 'expo-router';

import { ClientTrackingScreen } from '../../../screens/Client/ClientTrackingScreen';

export default function ClientJobTrackingRoute() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  if (!jobId) {
    return null;
  }
  return <ClientTrackingScreen jobId={jobId} />;
}

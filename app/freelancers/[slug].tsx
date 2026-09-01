import { useLocalSearchParams } from 'expo-router';

import { FreelancerProfileDetailScreen } from '../../screens/Freelancer/FreelancerProfileDetailScreen';

export default function FreelancerPublicProfileRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  if (!slug) {
    return null;
  }
  return <FreelancerProfileDetailScreen slug={slug} />;
}

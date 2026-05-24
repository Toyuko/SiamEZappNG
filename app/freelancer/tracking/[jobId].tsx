import { useLocalSearchParams } from 'expo-router';

import { JobTrackingScreen } from '../../../screens/Freelancer/JobTrackingScreen';

export default function FreelancerJobTrackingRoute() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  if (!jobId) {
    return null;
  }
  return <JobTrackingScreen jobId={jobId} />;
}

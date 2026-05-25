import { useLocalSearchParams } from 'expo-router';

import { JobChatScreen } from '../../../screens/Chat/JobChatScreen';

export default function FreelancerJobChatRoute() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  if (!jobId) {
    return null;
  }
  return <JobChatScreen jobId={jobId} role="freelancer" />;
}

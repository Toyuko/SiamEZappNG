import { useLocalSearchParams } from 'expo-router';

import { CorporatePublicProfileScreen } from '../../screens/corporate/PublicProfile';

export default function CompanyPublicProfileRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  if (!slug) {
    return null;
  }
  return <CorporatePublicProfileScreen companyIdOrSlug={slug} />;
}

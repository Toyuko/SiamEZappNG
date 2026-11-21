import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { DriverLicenseBookingWizard } from '../../features/bookings/driver-license/DriverLicenseBookingWizard';
import { GenericBookingWizard } from '../../features/bookings/GenericBookingWizard';
import { serviceCatalog } from '../../features/services/services.data';

/**
 * Book tab entry. Driver-license uses the website-aligned 4-stage wizard;
 * other services keep the generic multi-step booking flow.
 */
export default function BookScreen() {
  const { service, serviceSlug } = useLocalSearchParams<{ service?: string; serviceSlug?: string }>();

  const selectedService = useMemo(() => {
    if (serviceSlug) {
      const bySlug = serviceCatalog.find((item) => item.slug === serviceSlug);
      if (bySlug) return bySlug;
    }
    if (service) {
      return (
        serviceCatalog.find((item) => item.title.toLowerCase() === service.toLowerCase()) ??
        serviceCatalog[0]
      );
    }
    return serviceCatalog[0];
  }, [service, serviceSlug]);

  if (selectedService.slug === 'driver-license') {
    return <DriverLicenseBookingWizard serviceTitle={selectedService.title} />;
  }

  return <GenericBookingWizard selectedService={selectedService} />;
}

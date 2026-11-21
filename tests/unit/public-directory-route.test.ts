import { describe, expect, it } from 'vitest';

import { publicFreelancerDirectoryHref } from '../../features/freelancer/public-directory-route';

describe('publicFreelancerDirectoryHref', () => {
  it('uses the stack route during soft launch so Home / Services / Book stay primary', () => {
    expect(
      publicFreelancerDirectoryHref({
        softLaunchEnabled: true,
        showFreelancers: true,
        isFreelancer: false,
        isCorporate: false,
      }),
    ).toBe('/freelancers');
  });

  it('opens the freelancers tab after soft launch for guests and clients', () => {
    expect(
      publicFreelancerDirectoryHref({
        softLaunchEnabled: false,
        showFreelancers: true,
        isFreelancer: false,
        isCorporate: false,
      }),
    ).toBe('/(tabs)/freelancers');
  });

  it('keeps the stack screen for freelancer and company accounts', () => {
    expect(
      publicFreelancerDirectoryHref({
        softLaunchEnabled: false,
        showFreelancers: true,
        isFreelancer: true,
        isCorporate: false,
      }),
    ).toBe('/freelancers');
    expect(
      publicFreelancerDirectoryHref({
        softLaunchEnabled: false,
        showFreelancers: true,
        isFreelancer: false,
        isCorporate: true,
      }),
    ).toBe('/freelancers');
  });
});

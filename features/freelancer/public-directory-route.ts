/**
 * Guests and clients use the Freelancers tab when it is visible in the tab bar.
 * Soft launch keeps freelancers in More / stack routes so Home / Services / Book stay primary.
 * Freelancer and company accounts keep the stack screen because that tab is hidden for them.
 */
export function publicFreelancerDirectoryHref(input: {
  softLaunchEnabled: boolean;
  showFreelancers: boolean;
  isFreelancer: boolean;
  isCorporate: boolean;
}): '/(tabs)/freelancers' | '/freelancers' {
  const tabVisible =
    !input.softLaunchEnabled && input.showFreelancers && !input.isFreelancer && !input.isCorporate;
  return tabVisible ? '/(tabs)/freelancers' : '/freelancers';
}

/**
 * One-at-a-time guard for async UI actions (booking submit, login, etc.).
 * Succeeds stay locked so a late tap cannot start a second request.
 */
export function createSingleFlight() {
  let inFlight = false;

  return async function runSingleFlight<T>(fn: () => Promise<T>): Promise<T | undefined> {
    if (inFlight) {
      return undefined;
    }
    inFlight = true;
    try {
      return await fn();
    } catch (error) {
      inFlight = false;
      throw error;
    }
  };
}

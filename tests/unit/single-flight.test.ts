import { describe, expect, it } from 'vitest';

import { createSingleFlight } from '../../lib/single-flight';

describe('createSingleFlight', () => {
  it('runs only the first call while an attempt is in flight', async () => {
    const run = createSingleFlight();
    let started = 0;
    let finished = 0;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    const first = run(async () => {
      started += 1;
      await gate;
      finished += 1;
      return 'ok';
    });
    const second = run(async () => {
      started += 1;
      finished += 1;
      return 'dup';
    });

    expect(started).toBe(1);
    expect(await second).toBeUndefined();
    release();
    await expect(first).resolves.toBe('ok');
    expect(started).toBe(1);
    expect(finished).toBe(1);
  });

  it('stays locked after a successful run so a follow-up tap cannot start another request', async () => {
    const run = createSingleFlight();
    await expect(run(async () => 1)).resolves.toBe(1);
    await expect(run(async () => 2)).resolves.toBeUndefined();
  });

  it('unlocks after failure so the user can retry', async () => {
    const run = createSingleFlight();
    await expect(
      run(async () => {
        throw new Error('network');
      }),
    ).rejects.toThrow('network');
    await expect(run(async () => 'retry')).resolves.toBe('retry');
  });
});

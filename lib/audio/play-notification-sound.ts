import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/** Filename bundled via `expo-notifications` `sounds` and Android channel config. */
export const EZ_NOTIFICATION_SOUND = 'ez_notification.wav';

const soundSource = require('../../assets/sounds/ez_notification.wav');

let player: AudioPlayer | null = null;
let audioModeReady = false;
let playInFlight: Promise<void> | null = null;

async function ensureAudioMode() {
  if (audioModeReady) {
    return;
  }
  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
  });
  audioModeReady = true;
}

/**
 * Plays the short "EZ!" notification cue. Best-effort — never throws.
 * Safe to call from toast / push receive handlers on any platform.
 */
export function playNotificationSound() {
  if (playInFlight) {
    return playInFlight;
  }

  playInFlight = (async () => {
    try {
      await ensureAudioMode();

      if (!player) {
        player = createAudioPlayer(soundSource);
      } else {
        await player.seekTo(0);
      }

      player.play();
    } catch {
      // Sound is non-critical; ignore load/play failures (e.g. web restrictions).
    } finally {
      playInFlight = null;
    }
  })();

  return playInFlight;
}

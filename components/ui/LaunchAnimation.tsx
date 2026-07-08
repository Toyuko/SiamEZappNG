import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const LAUNCH_VIDEO = require('../../assets/launch-intro.mp4');

const FULL_EXIT_MS = 750;
const BRIEF_EXIT_MS = 500;
const BRIEF_EXIT_DELAY_MS = 380;
const MAX_INTRO_MS = 12_000;

type LaunchAnimationProps = {
  /** App bootstrap (auth + fonts) is finished — play the reveal / exit sequence. */
  ready: boolean;
  /** Full branded sequence for login; brief pulse for returning users. */
  variant: 'full' | 'brief';
  onComplete: () => void;
};

/**
 * Cold-start overlay: plays the branded launch video, then fades out to reveal
 * the screen underneath (login or home).
 */
export function LaunchAnimation({ ready, variant, onComplete }: LaunchAnimationProps) {
  const isFull = variant === 'full';
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const completedRef = useRef(false);
  const notifyComplete = useCallback(() => {
    if (completedRef.current) {
      return;
    }
    completedRef.current = true;
    onCompleteRef.current();
  }, []);

  const [videoEnded, setVideoEnded] = useState(false);
  const overlay = useSharedValue(1);
  const exitStarted = useRef(false);

  const player = useVideoPlayer(LAUNCH_VIDEO, (instance) => {
    instance.loop = false;
    instance.muted = false;
    instance.play();
  });

  useEventListener(player, 'playToEnd', () => {
    setVideoEnded(true);
  });

  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'error') {
      setVideoEnded(true);
    }
  });

  useEffect(() => {
    const timeout = setTimeout(() => setVideoEnded(true), MAX_INTRO_MS);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isFull && ready) {
      player.pause();
    }
  }, [isFull, player, ready]);

  useEffect(() => {
    if (!ready || exitStarted.current) {
      return;
    }

    const canExit = isFull ? videoEnded : true;
    if (!canExit) {
      return;
    }

    exitStarted.current = true;

    const finish = (finished?: boolean) => {
      'worklet';
      if (finished === false) {
        return;
      }
      runOnJS(notifyComplete)();
    };

    const exitDelay = isFull ? 0 : BRIEF_EXIT_DELAY_MS;
    const exitDuration = isFull ? FULL_EXIT_MS : BRIEF_EXIT_MS;

    overlay.value = withDelay(
      exitDelay,
      withTiming(0, { duration: exitDuration, easing: Easing.inOut(Easing.cubic) }, finish),
    );
  }, [isFull, notifyComplete, overlay, ready, videoEnded]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlay.value,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, overlayStyle]}
      pointerEvents={ready ? 'none' : 'auto'}
    >
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: '#000000',
  },
});

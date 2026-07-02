import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { goldGradient, radius, siam } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const GOOGLE_RED = '#DB4437';
const FACEBOOK_BLUE = '#1877F2';
const LINE_GREEN = '#06C755';
const TEXT_ON_GOLD = '#1f2937';

/** Soft background used behind the auth card (light mode only). */
export function useAuthColors() {
  const { colors, resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  return {
    colors,
    isLight,
    pageBackground: isLight ? '#f4f6fb' : colors.background,
    inputFill: isLight ? '#eef1f8' : 'rgba(255,255,255,0.06)',
  };
}

/** Blue rounded-square "SZ" mark (matches the website portal logo). */
export function AuthLogo() {
  return (
    <View
      style={{
        alignSelf: 'center',
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: siam.blue.DEFAULT,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 20, letterSpacing: 0.5 }}>SZ</Text>
    </View>
  );
}

type AuthFieldProps = TextInputProps & {
  label: string;
  rightElement?: ReactNode;
};

/** Labeled, soft-filled input matching the website form fields. */
export function AuthField({ label, rightElement, style, ...inputProps }: AuthFieldProps) {
  const { colors, inputFill } = useAuthColors();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 6 }}>{label}</Text>
      <View style={{ justifyContent: 'center' }}>
        <TextInput
          placeholderTextColor={colors.muted}
          style={[
            {
              minHeight: 50,
              borderRadius: radius.button,
              backgroundColor: inputFill,
              paddingHorizontal: 14,
              paddingVertical: 12,
              paddingRight: rightElement ? 44 : 14,
              fontSize: 15,
              color: colors.foreground,
            },
            style,
          ]}
          {...inputProps}
        />
        {rightElement ? <View style={{ position: 'absolute', right: 12 }}>{rightElement}</View> : null}
      </View>
    </View>
  );
}

/** "Or continue with email" style divider. */
export function OrDivider({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 14 }}>
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
      <Text style={{ fontSize: 13, fontWeight: '500', color: colors.muted }}>{label}</Text>
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
    </View>
  );
}

type SocialKind = 'google' | 'google-outline' | 'facebook' | 'line' | 'guest';

const SOCIAL_BADGE: Record<SocialKind, string | null> = {
  google: 'G',
  'google-outline': 'G',
  facebook: 'f',
  line: 'LINE',
  guest: null,
};

/** Full-width social / guest auth button in the website's style. */
export function SocialButton({ label, onPress, kind }: { label: string; onPress: () => void; kind: SocialKind }) {
  const { colors } = useTheme();
  const palette = {
    google: { bg: GOOGLE_RED, border: GOOGLE_RED, text: '#ffffff', borderWidth: 0 },
    'google-outline': { bg: colors.card, border: colors.border, text: colors.foreground, borderWidth: 1 },
    facebook: { bg: FACEBOOK_BLUE, border: FACEBOOK_BLUE, text: '#ffffff', borderWidth: 0 },
    line: { bg: LINE_GREEN, border: LINE_GREEN, text: '#ffffff', borderWidth: 0 },
    guest: { bg: 'transparent', border: colors.primary, text: colors.primary, borderWidth: 1 },
  }[kind];
  const badge = SOCIAL_BADGE[kind];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        width: '100%',
        height: 50,
        borderRadius: radius.button,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.bg,
        borderColor: palette.border,
        borderWidth: palette.borderWidth,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {badge ? (
        <View style={{ position: 'absolute', left: 16 }}>
          <Text
            style={{
              fontSize: kind === 'line' ? 11 : 18,
              fontWeight: kind === 'line' ? '800' : '700',
              color: kind === 'line' ? '#ffffff' : palette.text,
              letterSpacing: kind === 'line' ? 0.4 : 0,
            }}
          >
            {badge}
          </Text>
        </View>
      ) : null}
      <Text style={{ fontSize: 15, fontWeight: '600', color: palette.text }}>{label}</Text>
    </Pressable>
  );
}

/** Gold full-width submit button (Sign in / Create account). */
export function AuthSubmitButton({ label, onPress, loading }: { label: string; onPress: () => void; loading?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => ({
        width: '100%',
        height: 50,
        borderRadius: radius.button,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
        opacity: pressed || loading ? 0.9 : 1,
      })}
    >
      <LinearGradient
        colors={[...goldGradient.colors]}
        start={goldGradient.start}
        end={goldGradient.end}
        style={StyleSheet.absoluteFill}
      />
      {loading ? (
        <ActivityIndicator color={TEXT_ON_GOLD} />
      ) : (
        <Text style={{ fontSize: 16, fontWeight: '700', color: TEXT_ON_GOLD }}>{label}</Text>
      )}
    </Pressable>
  );
}

/** "Don't have an account? Create account" style footer link. */
export function AuthSwitchLink({ prompt, actionLabel, onPress }: { prompt: string; actionLabel: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Text style={{ textAlign: 'center', fontSize: 14, color: colors.muted, marginTop: 16 }}>
      {prompt}{' '}
      <Text style={{ color: colors.primary, fontWeight: '700' }} onPress={onPress}>
        {actionLabel}
      </Text>
    </Text>
  );
}

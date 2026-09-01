import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { goldGradient, radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const GOOGLE_RED = '#DB4437';
const FACEBOOK_BLUE = '#1877F2';
const LINE_GREEN = '#06C755';
const OUTLINE_BORDER = '#cbd5e1';
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

/** The SiamEZ brand logo (blue circle + gold elephant). */
export function AuthLogo({ size = 84 }: { size?: number }) {
  return (
    <Image
      source={require('../../assets/siamez-logo.png')}
      style={{ alignSelf: 'center', width: size, height: size, borderRadius: size / 2 }}
      resizeMode="contain"
      accessibilityLabel="SiamEZ logo"
    />
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

const socialStyles = StyleSheet.create({
  badgeSlot: {
    position: 'absolute',
    left: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/** Full-width social / guest auth button in the website's style. */
export function SocialButton({ label, onPress, kind }: { label: string; onPress: () => void; kind: SocialKind }) {
  const { colors, isLight } = useAuthColors();
  const outlineBg = isLight ? '#ffffff' : colors.card;
  const outlineBorder = isLight ? OUTLINE_BORDER : colors.border;
  const palette = {
    google: { bg: GOOGLE_RED, border: GOOGLE_RED, text: '#ffffff', badge: '#ffffff', borderWidth: 0 },
    'google-outline': {
      bg: outlineBg,
      border: outlineBorder,
      text: colors.foreground,
      badge: colors.foreground,
      borderWidth: 1.5,
    },
    facebook: { bg: FACEBOOK_BLUE, border: FACEBOOK_BLUE, text: '#ffffff', badge: '#ffffff', borderWidth: 0 },
    line: { bg: LINE_GREEN, border: LINE_GREEN, text: '#ffffff', badge: '#ffffff', borderWidth: 0 },
    guest: { bg: outlineBg, border: colors.primary, text: colors.primary, badge: colors.primary, borderWidth: 1.5 },
  }[kind];
  const badge = SOCIAL_BADGE[kind];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ width: '100%', opacity: pressed ? 0.9 : 1 })}
    >
      <View
        style={{
          width: '100%',
          height: 50,
          marginBottom: spacing.stackLg,
          borderRadius: radius.button,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: palette.borderWidth,
        }}
      >
        {badge ? (
          <View style={socialStyles.badgeSlot}>
            <Text
              style={{
                fontSize: kind === 'line' ? 11 : 18,
                fontWeight: kind === 'line' ? '800' : '700',
                color: palette.badge,
                letterSpacing: kind === 'line' ? 0.4 : 0,
              }}
            >
              {badge}
            </Text>
          </View>
        ) : null}
        <Text style={{ fontSize: 15, fontWeight: '700', color: palette.text }}>{label}</Text>
      </View>
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
        marginTop: 6,
        opacity: pressed || loading ? 0.9 : 1,
      })}
    >
      <LinearGradient
        colors={[...goldGradient.colors]}
        start={goldGradient.start}
        end={goldGradient.end}
        style={{
          width: '100%',
          height: 50,
          borderRadius: radius.button,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <ActivityIndicator color={TEXT_ON_GOLD} />
        ) : (
          <Text style={{ fontSize: 16, fontWeight: '700', color: TEXT_ON_GOLD }}>{label}</Text>
        )}
      </LinearGradient>
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

/** Small demo-credentials hint shown at the bottom of the auth card. */
export function AuthDemoHint({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text style={{ textAlign: 'center', fontSize: 12, lineHeight: 18, color: colors.muted, marginTop: 16 }}>
      {children}
    </Text>
  );
}

/** Outlined demo-account button below the auth card. */
export function AuthDemoButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          minHeight: 44,
          paddingHorizontal: 18,
          borderRadius: radius.button,
          borderWidth: 1.5,
          borderColor: colors.primary,
          backgroundColor: colors.card,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>{label}</Text>
      </View>
    </Pressable>
  );
}

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSendFreelancerInquiry } from '../../hooks/use-send-freelancer-inquiry';
import { t } from '../../lib/i18n/i18n';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

type FreelancerInquirySheetProps = {
  visible: boolean;
  slug: string;
  freelancerName: string;
  onClose: () => void;
};

export function FreelancerInquirySheet({
  visible,
  slug,
  freelancerName,
  onClose,
}: FreelancerInquirySheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const inquiryMutation = useSendFreelancerInquiry();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setSent(false);
    if (user?.name) {
      setName(user.name);
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email, user?.name, visible]);

  const handleClose = () => {
    onClose();
    setSent(false);
  };

  const handleSubmit = async () => {
    if (name.trim().length < 2) {
      Alert.alert(t('freelancer.publicProfile.inquiry.invalidTitle'), t('freelancer.publicProfile.inquiry.nameRequired'));
      return;
    }
    if (!email.trim().includes('@')) {
      Alert.alert(t('freelancer.publicProfile.inquiry.invalidTitle'), t('freelancer.publicProfile.inquiry.emailRequired'));
      return;
    }
    if (message.trim().length < 10) {
      Alert.alert(t('freelancer.publicProfile.inquiry.invalidTitle'), t('freelancer.publicProfile.inquiry.messageRequired'));
      return;
    }

    try {
      await inquiryMutation.mutateAsync({
        slug,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });
      setSent(true);
      setMessage('');
    } catch (error) {
      Alert.alert(
        t('freelancer.publicProfile.inquiry.errorTitle'),
        error instanceof Error ? error.message : t('freelancer.publicProfile.inquiry.errorMessage'),
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
            maxHeight: '88%',
            gap: spacing.stackMd,
          }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-lg font-bold" style={{ color: colors.foreground }}>
              {t('freelancer.publicProfile.inquiry.title', { name: freelancerName })}
            </Text>
            <Pressable onPress={handleClose} hitSlop={10} accessibilityRole="button">
              <X size={22} color={colors.muted} />
            </Pressable>
          </View>

          {sent ? (
            <View className="gap-4 py-2">
              <Text className="text-sm leading-5" style={{ color: colors.muted }}>
                {t('freelancer.publicProfile.inquiry.success')}
              </Text>
              <Button label={t('freelancer.publicProfile.inquiry.close')} onPress={handleClose} />
            </View>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View className="gap-3 pb-2">
                <Input
                  label={t('freelancer.publicProfile.inquiry.name')}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
                <Input
                  label={t('freelancer.publicProfile.inquiry.email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label={t('freelancer.publicProfile.inquiry.phone')}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <View className="gap-1.5">
                  <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                    {t('freelancer.publicProfile.inquiry.message')}
                  </Text>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    placeholder={t('freelancer.publicProfile.inquiry.messagePlaceholder')}
                    placeholderTextColor={colors.muted}
                    style={{
                      minHeight: 120,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      borderRadius: radius.button,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      color: colors.foreground,
                      fontSize: 16,
                    }}
                  />
                </View>
                <Button
                  label={
                    inquiryMutation.isPending
                      ? t('freelancer.publicProfile.inquiry.sending')
                      : t('freelancer.publicProfile.inquiry.send')
                  }
                  onPress={() => void handleSubmit()}
                  disabled={inquiryMutation.isPending}
                />
                {inquiryMutation.isPending ? (
                  <ActivityIndicator color={colors.primary} style={{ marginTop: 4 }} />
                ) : null}
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

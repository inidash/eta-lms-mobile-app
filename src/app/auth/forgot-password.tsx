import {
  ArrowLeft01Icon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  Mail01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';

type ResetStep = 'email' | 'verification' | 'password';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const normalizedEmail = email.trim().toLowerCase();
  const statusBarPadding =
    Platform.OS === 'android'
      ? Math.max(insets.top, StatusBar.currentHeight || 24) + 8
      : Math.max(insets.top, 14);
  const bottomPadding = Math.max(insets.bottom, 20) + 12;

  const clearMessages = () => {
    setError('');
    setMessage('');
  };

  const handleSendCode = async () => {
    clearMessages();

    if (!normalizedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.forgotPassword(normalizedEmail);

      if (!result.success) {
        setError(
          result.error ||
            'Unable to send the verification code. Please try again.',
        );
        return;
      }

      setStep('verification');
      setMessage(
        result.message ||
          'If the account is eligible for recovery, a verification code will be sent to your email.',
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    clearMessages();
    const code = verificationCode.trim();

    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.verifyResetCode(normalizedEmail, code);

      if (!result.success) {
        setError(
          result.error ||
            'Invalid or expired verification code. Please try again.',
        );
        return;
      }

      setStep('password');
      setMessage('Code verified. You can now create a new password.');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to verify the code. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    clearMessages();

    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.resetPassword(
        normalizedEmail,
        verificationCode.trim(),
        password,
      );

      if (!result.success) {
        setError(
          result.error || 'Unable to reset your password. Please try again.',
        );
        return;
      }

      setMessage('Your password has been reset successfully.');
      setTimeout(() => router.replace('/auth/login'), 1200);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while resetting your password.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    clearMessages();

    try {
      setLoading(true);
      const result = await authService.forgotPassword(normalizedEmail);

      if (!result.success) {
        setError(result.error || 'Unable to resend the verification code.');
        return;
      }

      setVerificationCode('');
      setMessage(result.message || 'A new verification code has been requested.');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to resend the code. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (loading) return;
    clearMessages();

    if (step === 'password') {
      setStep('verification');
      return;
    }

    if (step === 'verification') {
      setStep('email');
      setVerificationCode('');
      return;
    }

    router.back();
  };

  const currentStep = step === 'email' ? 1 : step === 'verification' ? 2 : 3;
  const title =
    step === 'email'
      ? 'Forgot password?'
      : step === 'verification'
        ? 'Verify your email'
        : 'Create a new password';
  const subtitle =
    step === 'email'
      ? 'No worries. Enter your email address and we’ll help you get back into your account.'
      : step === 'verification'
        ? `Enter the 6-digit verification code sent to ${normalizedEmail}.`
        : 'Choose a strong new password to secure your account.';

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: !loading }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        <View style={styles.glowContainer} pointerEvents="none">
          <LinearGradient
            colors={[
              'rgba(255, 69, 0, 0.4)',
              'rgba(235, 45, 0, 0.18)',
              'transparent',
            ]}
            style={styles.radialGlow}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.8 }}
          />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: statusBarPadding, paddingBottom: bottomPadding },
          ]}
        >
          <View style={styles.topHeader}>
            <TouchableOpacity
              style={styles.capsuleBackBtn}
              onPress={handleBack}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              activeOpacity={0.8}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={15} color="#FFFFFF" />
              <Text style={styles.capsuleBackText}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentBox}>
            <View style={styles.progressContainer} accessibilityLabel={`Step ${currentStep} of 3`}>
              {[1, 2, 3].map((item) => (
                <View
                  key={item}
                  style={[
                    styles.progressStep,
                    item <= currentStep && styles.progressStepActive,
                  ]}
                />
              ))}
            </View>

            <View style={styles.badgeWrapper}>
              <View style={styles.auraGlow} />
              <Image
                source={require('../../../assets/images/eta_glowing_card_badge.jpg')}
                style={styles.badgeImage}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.screenTitle}>{title}</Text>
            <Text style={styles.screenSubtitle}>{subtitle}</Text>

            {!!error && (
              <View style={styles.errorBanner} accessibilityRole="alert">
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            {!!message && (
              <View style={styles.successBanner} accessibilityRole="text">
                <Text style={styles.successText}>{message}</Text>
              </View>
            )}

            {step === 'email' && (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <HugeiconsIcon icon={Mail01Icon} size={18} color="#72727D" />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Email address"
                    placeholderTextColor="#6B6B76"
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      clearMessages();
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleSendCode}
                    accessibilityLabel="Email address"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleSendCode}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Send verification code</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {step === 'verification' && (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <HugeiconsIcon icon={Mail01Icon} size={18} color="#72727D" />
                  <TextInput
                    style={[styles.inputField, styles.codeInput]}
                    placeholder="6-digit code"
                    placeholderTextColor="#6B6B76"
                    value={verificationCode}
                    onChangeText={(value) => {
                      setVerificationCode(value.replace(/\D/g, '').slice(0, 6));
                      clearMessages();
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoComplete="one-time-code"
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleVerifyCode}
                    accessibilityLabel="Six-digit verification code"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleVerifyCode}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Verify code</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleResendCode}
                  disabled={loading}
                  activeOpacity={0.75}
                >
                  <Text style={styles.secondaryButtonText}>Didn’t receive the code? Resend</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.textButton}
                  onPress={() => {
                    if (loading) return;
                    clearMessages();
                    setStep('email');
                    setVerificationCode('');
                  }}
                  disabled={loading}
                >
                  <Text style={styles.mutedText}>Change email address</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 'password' && (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <HugeiconsIcon icon={LockIcon} size={18} color="#72727D" />
                  <TextInput
                    style={styles.inputField}
                    placeholder="New password"
                    placeholderTextColor="#6B6B76"
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      clearMessages();
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    editable={!loading}
                    returnKeyType="next"
                    accessibilityLabel="New password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((visible) => !visible)}
                    style={styles.eyeBtn}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <HugeiconsIcon
                      icon={showPassword ? EyeOffIcon : EyeIcon}
                      size={18}
                      color="#888894"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>Use at least 8 characters.</Text>
                <View style={styles.inputContainer}>
                  <HugeiconsIcon icon={LockIcon} size={18} color="#72727D" />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Confirm new password"
                    placeholderTextColor="#6B6B76"
                    value={confirmPassword}
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      clearMessages();
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                    accessibilityLabel="Confirm new password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword((visible) => !visible)}
                    style={styles.eyeBtn}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    <HugeiconsIcon
                      icon={showConfirmPassword ? EyeOffIcon : EyeIcon}
                      size={18}
                      color="#888894"
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Reset password</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <TouchableOpacity
              onPress={() => router.replace('/auth/login')}
              disabled={loading}
              accessibilityRole="button"
            >
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090C',
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
    overflow: 'hidden',
  },
  radialGlow: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  capsuleBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  capsuleBackText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  contentBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 26,
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#292930',
  },
  progressStepActive: {
    backgroundColor: '#FF5A1F',
  },
  badgeWrapper: {
    position: 'relative',
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  auraGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 85, 0, 0.25)',
    shadowColor: '#FF5500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 28,
    elevation: 18,
  },
  badgeImage: {
    width: 108,
    height: 108,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 120, 40, 0.4)',
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  screenSubtitle: {
    color: '#8A8A96',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131318',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 27,
    minHeight: 54,
    paddingHorizontal: 18,
    width: '100%',
    marginBottom: 16,
  },
  inputField: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    marginLeft: 10,
    minHeight: 52,
    paddingVertical: Platform.OS === 'ios' ? 14 : 8,
  },
  codeInput: {
    letterSpacing: 5,
    fontSize: 17,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
    marginLeft: 4,
  },
  helperText: {
    color: '#8A8A96',
    fontSize: 12,
    marginTop: -7,
    marginBottom: 16,
    marginLeft: 16,
  },
  primaryButton: {
    width: '100%',
    minHeight: 52,
    backgroundColor: '#2d94e7',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 4,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#FF7847',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  textButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  mutedText: {
    fontSize: 13,
    color: '#8A8A96',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.65)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    maxWidth: 360,
    width: '100%',
  },
  errorText: {
    color: '#FF7777',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    maxWidth: 360,
    width: '100%',
  },
  successText: {
    color: '#86EFAC',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 12,
  },
  footerText: {
    color: '#8A8A96',
    fontSize: 13,
  },
  footerLink: {
    color: '#FF7847',
    fontSize: 13,
    fontWeight: '700',
  },
});

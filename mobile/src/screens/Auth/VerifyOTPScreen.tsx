import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../../theme/theme';
import { authService } from '../../services/auth.service';
import Toast from 'react-native-toast-message';

export default function VerifyOTPScreen({ route, navigation }: any) {
  const { email, type, otpType } = route.params; // type: 'CUSTOMER', otpType: 'REGISTER' or 'FORGOT_PASSWORD'
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter a 6-digit OTP',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOTP({ otp });
      if (otpType === 'FORGOT_PASSWORD') {
        navigation.navigate('ResetPassword');
      } else {
        Toast.show({
          type: 'success',
          text1: 'Verified',
          text2: 'Account verified successfully',
        });
        navigation.navigate('Login');
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: err.response?.data?.message || 'Invalid OTP. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.sendOtp({ email, type, otpType });
      setTimer(60);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'A new OTP has been sent to your email',
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Failed to resend OTP',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {email}
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.button, (loading || otp.length !== 6) && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.text.inverse} />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResend} disabled={resending}>
                  {resending ? (
                    <ActivityIndicator size="small" color={theme.colors.primary.main} />
                  ) : (
                    <Text style={styles.resendLink}>Resend Now</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.lg,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: 8,
    backgroundColor: theme.colors.background.paper,
    color: theme.colors.text.primary,
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.text.inverse,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: theme.spacing.md,
  },
  resendText: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
  },
  timerText: {
    ...theme.typography.body2,
    color: theme.colors.text.tertiary,
    fontWeight: 'bold',
  },
  resendLink: {
    ...theme.typography.body2,
    color: theme.colors.primary.main,
    fontWeight: 'bold',
  },
});

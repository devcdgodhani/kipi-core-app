import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme, useAppTheme } from '../../theme/theme';
import { authService } from '../../services/auth.service';
import Toast from 'react-native-toast-message';
import { useMemo } from 'react';

export default function ForgotPasswordScreen({ navigation }: any) {
  const theme = useAppTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSendOTP = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your email',
      });
      return;
    }

    setLoading(true);
    try {
      await authService.sendOtp({
        email,
        type: 'CUSTOMER',
        otpType: 'FORGOT_PASSWORD',
      });
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Success! Please check your email for OTP.',
      });
      navigation.navigate('VerifyOTP', {
        email,
        type: 'CUSTOMER',
        otpType: 'FORGOT_PASSWORD',
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Failed to send OTP',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>← Back to Login</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a code to reset your password.
            </Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.text.inverse} />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Code</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: theme.spacing.xl,
  },
  backText: {
    ...theme.typography.body2,
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.lg,
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
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

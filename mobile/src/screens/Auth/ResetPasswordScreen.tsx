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

export default function ResetPasswordScreen({ navigation }: any) {
  const theme = useAppTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must be at least 6 characters',
      });
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ newPassword: password });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password reset successfully. Please login with your new password.',
      });
      navigation.navigate('Login');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Failed to reset password',
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below.
            </Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.text.inverse} />
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
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

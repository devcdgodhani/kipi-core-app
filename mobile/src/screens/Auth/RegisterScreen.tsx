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
import { theme } from '../../theme/theme';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.register({
        firstName,
        lastName,
        email,
        password,
        mobile,
        type: 'CUSTOMER',
      });
      // Send OTP first
      await authService.sendOtp({
        email,
        type: 'CUSTOMER',
        otpType: 'REGISTER'
      });
      // Navigate to OTP verification
      navigation.navigate('VerifyOTP', {
        email,
        type: 'CUSTOMER',
        otpType: 'REGISTER'
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="First Name *"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Last Name *"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Mobile (Optional)"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.text.inverse} />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
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
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: '#FEE2E2',
    borderRadius: theme.borderRadius.md,
  },
  form: {
    gap: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    backgroundColor: theme.colors.surface,
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
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  linkText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.base,
  },
  linkTextBold: {
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

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
import { useAppTheme, Theme } from '../../theme/theme';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Feather';
import { useMemo } from 'react';

export default function RegisterScreen({ navigation }: any) {
  const theme = useAppTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const styles = useMemo(() => createStyles(theme), [theme]);

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
            <View style={styles.inputContainer}>
              <Icon name="user" size={18} color={theme.colors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="First Name *"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="user" size={18} color={theme.colors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Last Name *"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="mail" size={18} color={theme.colors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email *"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="phone" size={18} color={theme.colors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mobile (Optional)"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={18} color={theme.colors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password *"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

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
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.error}15`,
    borderRadius: theme.borderRadius.md,
  },
  form: {
    gap: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
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

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Theme, useAppTheme } from '../../theme/theme';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';

const ChangePasswordScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'All fields are required',
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'New passwords do not match',
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Password must be at least 6 characters',
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 1500));
      
      Toast.show({
        type: 'success',
        text1: 'Password Updated',
        text2: 'Your password has been changed successfully',
      });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to update password. Please check your current password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={formData.currentPassword}
            onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
            placeholder="Enter current password"
            secureTextEntry
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={formData.newPassword}
            onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
            placeholder="Enter new password"
            secureTextEntry
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            placeholder="Confirm new password"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.text.inverse} />
          ) : (
            <Text style={styles.submitButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  content: {
    padding: theme.spacing.md,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.paper,
  },
  submitButton: {
    backgroundColor: theme.colors.primary.main,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
});

export default ChangePasswordScreen;

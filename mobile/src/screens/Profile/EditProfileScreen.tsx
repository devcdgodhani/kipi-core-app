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
import { theme } from '../../theme/theme';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const handleSubmit = async () => {
        if (!formData.name || !formData.email) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Name and Email are required',
            });
            return;
        }

        setLoading(true);
        try {
            // Simulate API call for now as auth context doesn't have updateMe yet
            await new Promise<void>(resolve => setTimeout(resolve, 1500));

            // In a real scenario, we'd call authService.updateMe(formData)
            // and then refresh the auth context user data

            Toast.show({
                type: 'success',
                text1: 'Profile Updated',
                text2: 'Your profile has been updated successfully',
            });
            navigation.goBack();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: 'Failed to update profile. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder="Enter your name"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={formData.email}
                        editable={false}
                        placeholder="Enter your email"
                    />
                    <Text style={styles.helperText}>Email cannot be changed</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        placeholder="Enter your phone number"
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.primary.contrastText} />
                    ) : (
                        <Text style={styles.submitButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
        borderColor: theme.colors.border.medium,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
        backgroundColor: theme.colors.background.paper,
    },
    disabledInput: {
        backgroundColor: theme.colors.background.default,
        color: theme.colors.text.tertiary,
    },
    helperText: {
        ...theme.typography.body2,
        fontSize: 12,
        color: theme.colors.text.tertiary,
        marginTop: 4,
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
        color: theme.colors.primary.contrastText,
    },
});

export default EditProfileScreen;

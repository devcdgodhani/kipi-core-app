import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useAddress } from '../../context/AddressContext';
import { theme } from '../../theme/theme';
import Toast from 'react-native-toast-message';

const AddAddressScreen = ({ navigation }: any) => {
  const { addAddress } = useAddress();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    type: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
    isDefault: false,
  });

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name || !formData.phone || !formData.pincode || !formData.addressLine1 || !formData.city || !formData.state) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all required fields',
      });
      return;
    }

    try {
      await addAddress(formData);
      navigation.goBack();
    } catch (error) {
      // Error handled in context
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name*</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="John Doe"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number*</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="9876543210"
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: theme.spacing.sm }]}>
            <Text style={styles.label}>Pincode*</Text>
            <TextInput
              style={styles.input}
              value={formData.pincode}
              onChangeText={(text) => setFormData({ ...formData, pincode: text })}
              placeholder="400001"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: theme.spacing.sm }]}>
            <Text style={styles.label}>City*</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="Mumbai"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>State*</Text>
          <TextInput
            style={styles.input}
            value={formData.state}
            onChangeText={(text) => setFormData({ ...formData, state: text })}
            placeholder="Maharashtra"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address Line 1*</Text>
          <TextInput
            style={styles.input}
            value={formData.addressLine1}
            onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
            placeholder="House No, Building Name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address Line 2 (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.addressLine2}
            onChangeText={(text) => setFormData({ ...formData, addressLine2: text })}
            placeholder="Street, Landmark"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address Type</Text>
          <View style={styles.typeContainer}>
            {(['HOME', 'WORK', 'OTHER'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  formData.type === type && styles.selectedTypeChip,
                ]}
                onPress={() => setFormData({ ...formData, type })}
              >
                <Text
                  style={[
                    styles.typeText,
                    formData.type === type && styles.selectedTypeText,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Set as Default Address</Text>
          <Switch
            value={formData.isDefault}
            onValueChange={(value) => setFormData({ ...formData, isDefault: value })}
            trackColor={{ false: theme.colors.border.medium, true: theme.colors.primary.main }}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Save Address</Text>
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
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
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
  typeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    backgroundColor: theme.colors.background.paper,
  },
  selectedTypeChip: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  typeText: {
    ...theme.typography.body2,
    color: theme.colors.text.primary,
  },
  selectedTypeText: {
    color: theme.colors.primary.contrastText,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  submitButton: {
    backgroundColor: theme.colors.primary.main,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary.contrastText,
  },
});

export default AddAddressScreen;

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { returnService } from '../../services/returnService';
import { useAppTheme, Theme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { format, isValid } from 'date-fns';

type ParamList = {
  ReturnDetail: { returnId: string };
};

const ReturnDetailScreen = () => {
    const route = useRoute<RouteProp<ParamList, 'ReturnDetail'>>();
    const navigation = useNavigation<any>();
    const { returnId } = route.params;
    const theme = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [returnDetail, setReturnDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReturnDetail();
    }, [returnId]);

    const loadReturnDetail = async () => {
        try {
            setLoading(true);
            const response = await returnService.getOne(returnId);
            setReturnDetail(response);
        } catch (error) {
            console.error('Failed to load return detail', error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load return details' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReturn = async () => {
        Alert.alert(
            'Cancel Return',
            'Are you sure you want to cancel this return request?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await returnService.cancel(returnId);
                            Toast.show({ type: 'success', text1: 'Success', text2: 'Return request cancelled' });
                            loadReturnDetail();
                        } catch (error) {
                            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to cancel return' });
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return theme.colors.success;
            case 'REJECTED': return theme.colors.error;
            case 'PICKED_UP': return theme.colors.primary.main;
            case 'REFUNDED': return theme.colors.primary.main;
            default: return theme.colors.warning;
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary.main} />
                </View>
            </SafeAreaView>
        );
    }

    if (!returnDetail) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Return details not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header Status */}
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.label}>Return ID</Text>
                            <Text style={styles.value}>#{returnDetail._id.slice(-8).toUpperCase()}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(returnDetail.status)}15` }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(returnDetail.status) }]}>{returnDetail.status}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.headerRow}>
                         <View>
                            <Text style={styles.label}>Order Number</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('OrderDetail', { orderId: returnDetail.orderId?._id || returnDetail.orderId })}>
                                <Text style={[styles.value, { color: theme.colors.primary.main, textDecorationLine: 'underline'}]}>
                                    #{returnDetail.orderId?.orderNumber || 'ORDER'}
                                </Text>
                            </TouchableOpacity>
                         </View>
                         <View>
                            <Text style={[styles.label, {textAlign: 'right'}]}>Date</Text>
                            <Text style={[styles.value, {textAlign: 'right'}]}>{format(new Date(returnDetail.createdAt), 'MMM dd, yyyy')}</Text>
                         </View>
                    </View>
                </View>

                {/* Product Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Product Details</Text>
                    <View style={styles.productRow}>
                        <Image 
                            source={{ uri: returnDetail.productId?.mainImage || 'https://via.placeholder.com/100' }}
                            style={styles.productImage}
                        />
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{returnDetail.productId?.name}</Text>
                            <Text style={styles.reasonText}>Reason: {returnDetail.reason}</Text>
                            <Text style={styles.descriptionText}>{returnDetail.description}</Text>
                        </View>
                    </View>
                </View>

                 {/* Tracking */}
                {returnDetail.awb && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Pickup Tracking</Text>
                        <View style={styles.trackingBox}>
                            <View>
                                <Text style={styles.label}>AWB Number</Text>
                                <Text style={styles.trackingValue}>{returnDetail.awb}</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.trackBtn}
                                onPress={() => Linking.openURL(`https://shiprocket.co/tracking/${returnDetail.awb}`)}
                            >
                                <Text style={styles.trackBtnText}>Track</Text>
                                <Icon name="external-link" size={14} color={theme.colors.primary.main} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Admin Notes */}
                {returnDetail.adminNotes && (
                    <View style={[styles.card, { backgroundColor: '#FFF8E1', borderColor: '#FFE082' }]}>
                        <View style={{flexDirection: 'row', gap: 8}}>
                             <Icon name="alert-circle" size={18} color="#FF8F00" />
                             <View style={{flex: 1}}>
                                <Text style={[styles.label, {color: '#FF8F00'}]}>Admin Note</Text>
                                <Text style={[styles.value, {color: '#5D4037', fontSize: 13, lineHeight: 18}]}>{returnDetail.adminNotes}</Text>
                             </View>
                        </View>
                    </View>
                )}
                
                {/* Actions */}
                {returnDetail.status === 'PENDING' && (
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancelReturn}>
                        <Icon name="x-circle" size={18} color={theme.colors.error} />
                        <Text style={styles.cancelText}>Cancel Return Request</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
      fontSize: 11,
      color: theme.colors.text.tertiary,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginBottom: 4,
  },
  value: {
      fontSize: 14,
      color: theme.colors.text.primary,
      fontWeight: 'bold',
  },
  statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
  },
  statusText: {
      fontSize: 11,
      fontWeight: '900',
      textTransform: 'uppercase',
  },
  divider: {
      height: 1,
      backgroundColor: theme.colors.border.light,
      marginVertical: 12,
  },
  sectionTitle: {
      fontSize: 12,
      fontWeight: '900',
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
  },
  productRow: {
      flexDirection: 'row',
  },
  productImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: theme.colors.background.default,
      marginRight: 16,
  },
  productInfo: {
      flex: 1,
  },
  productName: {
      fontSize: 15,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: 4,
  },
  reasonText: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginBottom: 4,
  },
  descriptionText: {
      fontSize: 12,
      color: theme.colors.text.tertiary,
      fontStyle: 'italic',
  },
  trackingBox: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  trackingValue: {
      fontSize: 16,
      fontWeight: 'black',
      color: theme.colors.primary.main,
  },
  trackBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: `${theme.colors.primary.main}10`,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
  },
  trackBtnText: {
      color: theme.colors.primary.main,
      fontWeight: 'bold',
      fontSize: 12,
  },
  cancelButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      padding: 16,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.background.paper,
  },
  cancelText: {
      color: theme.colors.error,
      fontWeight: 'bold',
      fontSize: 14,
  },
  errorText: {
      fontSize: 16,
      color: theme.colors.error,
      fontWeight: 'bold',
  },
});

export default ReturnDetailScreen;

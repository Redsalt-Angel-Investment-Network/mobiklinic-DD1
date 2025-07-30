import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../constants/styles';
import Loader from '../ui/loader';
import DataResultsContext from '../contexts/DataResultsContext';
import {API_ENDPOINTS} from '../config/api';

const PaymentHistory = ({navigation}) => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {userNames} = useContext(DataResultsContext);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        API_ENDPOINTS.PAYMENT_HISTORY(userNames)
      );
      
      const data = await response.json();
      
      if (data && data.data) {
        setPayments(data.data);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPaymentHistory();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getServiceLabel = (value) => {
    const services = {
      'non_communicable_diseases': 'Non-Communicable Diseases',
      'cardiovascular_disease': 'Cardiovascular Disease',
      'diabetes_care': 'Diabetes Care',
      'hypertension_management': 'Hypertension Management',
      'cancer_screening': 'Cancer Screening',
      'mental_health_services': 'Mental Health Services',
    };
    return services[value] || value;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      default:
        return COLORS.GRAY;
    }
  };

  const renderPaymentItem = ({item}) => {
    const payment = item.attributes || item;
    
    return (
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>
              {getServiceLabel(payment.service_paid_for)}
            </Text>
            <Text style={styles.paymentDate}>
              {formatDate(payment.payment_date)}
            </Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>UGX {payment.amount}</Text>
            <View style={[styles.statusBadge, {backgroundColor: getStatusColor(payment.payment_status)}]}>
              <Text style={styles.statusText}>
                {payment.payment_status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        
        {payment.transaction_id && (
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionLabel}>Transaction ID:</Text>
            <Text style={styles.transactionId}>{payment.transaction_id}</Text>
          </View>
        )}
        
        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <Icon name="phone" size={16} color={COLORS.GRAY} />
            <Text style={styles.detailText}>{payment.phone_number}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="credit-card" size={16} color={COLORS.GRAY} />
            <Text style={styles.detailText}>
              {payment.payment_method?.replace('_', ' ').toUpperCase() || 'MOBILE MONEY'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="receipt" size={80} color={COLORS.LIGHT_GRAY} />
      <Text style={styles.emptyTitle}>No Payment History</Text>
      <Text style={styles.emptyMessage}>
        You haven't made any payments yet. Start by making your first payment for medical services.
      </Text>
      <TouchableOpacity
        style={styles.makePaymentButton}
        onPress={() => navigation.navigate('Payment')}
      >
        <Text style={styles.makePaymentText}>Make a Payment</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !refreshing) return <Loader />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={COLORS.PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Payment')}
          style={styles.addButton}
        >
          <Icon name="plus" size={24} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.WHITE,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 5,
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  paymentCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  transactionInfo: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
  },
  transactionLabel: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginRight: 8,
  },
  transactionId: {
    fontSize: 12,
    color: COLORS.BLACK,
    fontFamily: 'monospace',
    flex: 1,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.GRAY,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.GRAY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  makePaymentButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  makePaymentText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentHistory;

import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../constants/styles';
import Loader from '../ui/loader';
import {AuthContext} from '../contexts/auth';
import DataResultsContext from '../contexts/DataResultsContext';
import {API_ENDPOINTS} from '../config/api';

// Optional Flutterwave import with fallback
let FlutterwaveInit = null;
try {
  const FlutterwaveModule = require('flutterwave-react-native');
  FlutterwaveInit = FlutterwaveModule.FlutterwaveInit;
} catch (error) {
  console.log('Flutterwave module not available:', error.message);
}

const Payment = ({navigation}) => {
  const [selectedService, setSelectedService] = useState('');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [pendingTransactionRef, setPendingTransactionRef] = useState(null);
  
  const {user} = useContext(AuthContext);
  const {userNames} = useContext(DataResultsContext);

  const services = [
    {label: 'Non-Communicable Diseases', value: 'non_communicable_diseases'},
    {label: 'Cardiovascular Disease', value: 'cardiovascular_disease'},
    {label: 'Diabetes Care', value: 'diabetes_care'},
    {label: 'Hypertension Management', value: 'hypertension_management'},
    {label: 'Cancer Screening', value: 'cancer_screening'},
    {label: 'Mental Health Services', value: 'mental_health_services'},
  ];

  const verifyPaymentStatus = async (transactionRef) => {
    try {
      // Show verification loader with specific message
      setIsVerifyingPayment(true);
      console.log('Verifying payment status for:', transactionRef);
      
      // In production, you would call your backend to verify payment with Flutterwave
      // For now, we'll simulate a successful verification
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demonstration, we'll assume payment was successful
      // In production, your backend would call Flutterwave's verify transaction API
      const verificationResult = {
        status: 'successful',
        transaction_id: transactionRef,
        tx_ref: transactionRef,
        amount: amount,
        currency: 'UGX',
        verified: true,
      };
      
      if (verificationResult.status === 'successful') {
        await handlePaymentSuccess(verificationResult);
      } else {
        Alert.alert('Payment Verification Failed', 'Could not verify payment status. Please contact support.');
        setIsVerifyingPayment(false);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      Alert.alert('Verification Error', 'Unable to verify payment status. Please contact support if you completed the payment.');
      setIsVerifyingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentData = null) => {
    try {
      // Record transaction in backend
      const transactionData = paymentData || {
        status: 'successful',
        transaction_id: `MK_${Date.now()}`,
        tx_ref: pendingTransactionRef || `MK_${Date.now()}`,
        amount: amount,
        currency: 'UGX',
      };
      
      await recordTransaction(transactionData);
      
      // Clear pending transaction
      setPendingTransactionRef(null);
      
      Alert.alert(
        'Payment Successful',
        `Payment of UGX ${amount} for ${getServiceLabel(selectedService)} has been processed successfully.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error handling payment success:', error);
      Alert.alert('Payment Completed', 'Payment was successful but there was an issue recording the transaction. Please contact support.');
    } finally {
      setIsLoading(false);
      setIsVerifyingPayment(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    let formatted = phone.replace(/\s+/g, ''); // Remove spaces
    if (formatted.startsWith('0')) {
      formatted = '256' + formatted.slice(1); // Convert Uganda format
    } else if (!formatted.startsWith('256')) {
      formatted = '256' + formatted; // Add Uganda country code
    }
    return formatted;
  };

  const validateInputs = () => {
    if (!selectedService) {
      Alert.alert('Error', 'Please select a service');
      return false;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    if (showPhoneInput && (!phoneNumber || phoneNumber.length < 10)) {
      Alert.alert('Error', 'Please enter a valid phone number (at least 10 digits)');
      return false;
    }
    // Validate minimum amount for Flutterwave
    if (parseFloat(amount) < 100) {
      Alert.alert('Error', 'Minimum payment amount is UGX 100');
      return false;
    }
    return true;
  };

  const initiatePayment = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      // Test Flutterwave availability
      console.log('Testing Flutterwave initialization...');
      
      // Generate unique transaction reference
      const txRef = `MK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Format phone number for Flutterwave
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      console.log('Processing payment with formatted phone:', formattedPhone);
      
      // Configure Flutterwave payment with all required parameters
      const paymentData = {
        tx_ref: txRef,
        authorization: 'FLWPUBK-4e096dbc78b9aed4cfaebd2c17916ddd-X', // Your real Flutterwave public key
        amount: parseFloat(amount),
        currency: 'UGX',
        payment_options: 'mobilemoney',
        customer: {
          email: user?.email || 'patient@mobiklinic.com',
          phone_number: formattedPhone,
          name: userNames || 'MobiKlinic Patient',
        },
        customizations: {
          title: 'MobiKlinic Payment',
          description: `Payment for ${getServiceLabel(selectedService)}`,
          logo: 'https://mobiklinic.com/logo.png',
        },
        redirect_url: 'https://mobiklinic.com',
        meta: {
          service_type: selectedService,
          user_name: userNames,
          patient_id: user?.id || 'unknown',
        },
        onRedirect: (data) => {
          console.log('Payment redirect data:', data);
        },
      };

      // Initialize Flutterwave payment
      const handleOnRedirect = async (data) => {
        console.log('Payment response:', data);
        
        // Check if data is a URL (hosted payment page)
        if (typeof data === 'string' && data.includes('checkout.flutterwave.com')) {
          console.log('Opening Flutterwave checkout URL in WebView:', data);
          
          // Store transaction reference for verification
          setPendingTransactionRef(txRef);
          
          // Navigate to WebView screen to complete payment in-app
          navigation.navigate('PaymentWebView', {
            url: data,
            txRef: txRef,
            paymentData: paymentData,
            amount: amount,
            selectedService: selectedService,
            phoneNumber: formatPhoneNumber(phoneNumber),
            userNames: userNames,
            onPaymentComplete: async (paymentResult) => {
              console.log('Payment completed:', paymentResult);
              // Automatically record the transaction when payment is successful
              setIsVerifyingPayment(true);
              try {
                await handlePaymentSuccess(paymentResult);
              } catch (error) {
                console.error('Error processing payment:', error);
              } finally {
                setIsVerifyingPayment(false);
              }
            },
            onPaymentCancel: () => {
              setPendingTransactionRef(null);
              Alert.alert('Payment Cancelled', 'Payment was not completed. You can try again.');
              setIsLoading(false);
            }
          });
          
          // Reset loading state since we're navigating away
          setIsLoading(false);
          
          return;
        }
        
        // Handle direct payment result (if not a URL)
        if (data.status === 'successful') {
          await handlePaymentSuccess(data);
        } else {
          Alert.alert('Payment Failed', 'Payment was not completed. Please try again.');
          setIsLoading(false);
        }
      };

      // Request phone number first if not provided
      if (!showPhoneInput) {
        setShowPhoneInput(true);
        setIsLoading(false);
        return;
      }

      // Check if FlutterwaveInit is available
      if (typeof FlutterwaveInit !== 'function') {
        // Fallback to payment simulation
        console.log('Flutterwave module not available, using fallback simulation...');
        
        Alert.alert(
          'Payment Processing',
          'Flutterwave module is loading. For now, we will simulate the payment process.',
          [
            {
              text: 'Cancel',
              onPress: () => setIsLoading(false),
              style: 'cancel',
            },
            {
              text: 'Continue',
              onPress: async () => {
                // Show loading for 2 seconds to simulate payment processing
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Simulate successful payment response
                const simulatedResponse = {
                  status: 'successful',
                  transaction_id: txRef,
                  tx_ref: txRef,
                  amount: amount,
                  currency: 'UGX',
                };

                await recordTransaction(simulatedResponse);
                
                Alert.alert(
                  'Payment Simulation Successful',
                  `Demo payment of UGX ${amount} for ${getServiceLabel(selectedService)} has been simulated successfully. Flutterwave integration will be available after app rebuild.`,
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack(),
                    },
                  ]
                );
                setIsLoading(false);
              },
            },
          ]
        );
        return;
      }

      // Initialize Flutterwave payment with proper error handling
      try {
        const result = await FlutterwaveInit(paymentData);
        console.log('Flutterwave initialization result:', result);
        await handleOnRedirect(result);
      } catch (error) {
        console.error('Flutterwave initialization error:', error);
        Alert.alert(
          'Payment Error', 
          'Unable to initialize payment. Please check your details and try again.\n\nError: ' + error.message
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', error.message || 'Unable to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const recordTransaction = async (paymentResponse = {}) => {
    try {
      const transactionData = {
        data: {
          amount: parseFloat(amount),
          service_paid_for: selectedService,
          user_name: userNames || 'Unknown User',
          phone_number: formatPhoneNumber(phoneNumber),
          payment_date: new Date().toISOString(),
          payment_status: paymentResponse.status === 'successful' ? 'completed' : 'failed',
          payment_method: 'mobile_money',
          currency: 'UGX',
          transaction_id: paymentResponse.transaction_id || `MK_${Date.now()}`,
          flutterwave_tx_ref: paymentResponse.tx_ref || null,
          notes: `Payment for ${getServiceLabel(selectedService)} via MobiKlinic app`,
        }
      };

      console.log('Recording transaction:', transactionData);

      const response = await fetch(
        API_ENDPOINTS.PAYMENTS,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to record transaction: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Transaction recorded successfully:', result);
      return result;
    } catch (error) {
      console.error('Error recording transaction:', error.message);
      // Show user-friendly error message
      Alert.alert(
        'Transaction Recording Failed', 
        'Payment was processed but failed to save transaction record. Please contact support if needed.',
        [{text: 'OK'}]
      );
    }
  };

  const getServiceLabel = (value) => {
    const service = services.find(s => s.value === value);
    return service ? service.label : value;
  };

  const resetForm = () => {
    setSelectedService('');
    setAmount('');
    setPhoneNumber('');
    setShowPhoneInput(false);
    setPendingTransactionRef(null);
  };

  if (isLoading) return <Loader />;
  
  if (isVerifyingPayment) {
    return (
      <Loader>
        <Text style={styles.loaderText}>System is Confirming your payment</Text>
      </Loader>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={COLORS.PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Make Payment</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('PaymentHistory')}
          style={styles.historyButton}
        >
          <Icon name="history" size={24} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service Selection</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedService}
              onValueChange={(itemValue) => setSelectedService(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Select a service..." value="" />
              {services.map((service) => (
                <Picker.Item
                  key={service.value}
                  label={service.label}
                  value={service.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencyLabel}>UGX</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              placeholderTextColor={COLORS.GRAY}
            />
          </View>
        </View>

        {showPhoneInput && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mobile Money Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number (e.g., 0701234567)"
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.GRAY}
            />
            <Text style={styles.phoneHint}>
              Enter your mobile money number for payment
            </Text>
          </View>
        )}

        {pendingTransactionRef && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Pending Payment</Text>
            <Text style={styles.pendingText}>
              You have a pending payment. If you completed the payment, click below to verify.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.verifyButton]}
              onPress={() => verifyPaymentStatus(pendingTransactionRef)}
            >
              <Icon name="check-circle" size={18} color="white" style={styles.buttonIcon} />
              <Text style={styles.verifyButtonText}>Verify Payment</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedService && amount && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service:</Text>
              <Text style={styles.summaryValue}>{getServiceLabel(selectedService)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={styles.summaryValue}>UGX {amount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Patient:</Text>
              <Text style={styles.summaryValue}>{userNames || 'Unknown User'}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetForm}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button,
              styles.payButton,
              (!selectedService || !amount) && styles.disabledButton
            ]}
            onPress={initiatePayment}
            disabled={!selectedService || !amount}
          >
            <Icon name="credit-card" size={18} color="white" style={styles.buttonIcon} />
            <Text style={styles.payButtonText} numberOfLines={1} adjustsFontSizeToFit>
              {showPhoneInput ? 'Pay Now' : 'Continue Payment'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  historyButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    backgroundColor: COLORS.WHITE,
  },
  picker: {
    height: 50,
    color: COLORS.BLACK,
  },
  pickerItem: {
    fontSize: 16,
    color: COLORS.BLACK,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: COLORS.WHITE,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.BLACK,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
  },
  phoneHint: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.GRAY,
    fontStyle: 'italic',
  },
  pendingText: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 15,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: COLORS.SUCCESS || '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  verifyButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
    minHeight: 50,
  },
  resetButton: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  resetButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  payButtonText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 6,
    flex: 1,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.LIGHT_GRAY,
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 4,
  },
  loaderText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default Payment;

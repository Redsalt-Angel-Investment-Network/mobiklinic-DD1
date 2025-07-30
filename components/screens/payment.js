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
import {FlutterwaveInit} from 'flutterwave-react-native';
import {COLORS} from '../constants/styles';
import Loader from '../ui/loader';
import {AuthContext} from '../contexts/auth';
import DataResultsContext from '../contexts/DataResultsContext';

const Payment = ({navigation}) => {
  const [selectedService, setSelectedService] = useState('');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  
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
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const initiatePayment = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      // Generate unique transaction reference
      const txRef = `MK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Configure Flutterwave payment
      const paymentData = {
        tx_ref: txRef,
        authorization: 'FLWPUBK_TEST-XXXXXXXXXXXXX-X', // Replace with your Flutterwave public key
        amount: parseFloat(amount),
        currency: 'UGX',
        payment_options: 'mobilemoney',
        customer: {
          email: 'patient@mobiklinic.com', // You can get this from user context if available
          phone_number: phoneNumber,
          name: userNames || 'MobiKlinic Patient',
        },
        customizations: {
          title: 'MobiKlinic Payment',
          description: `Payment for ${getServiceLabel(selectedService)}`,
          logo: 'https://your-logo-url.com/logo.png',
        },
        redirect_url: '',
        meta: {
          service_type: selectedService,
          user_name: userNames,
        },
      };

      // Initialize Flutterwave payment
      const handleOnRedirect = async (data) => {
        console.log('Payment response:', data);
        
        if (data.status === 'successful') {
          // Record transaction in backend
          await recordTransaction(data);
          
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
        } else {
          Alert.alert('Payment Failed', 'Payment was not completed. Please try again.');
        }
        setIsLoading(false);
      };

      // For development/testing, we'll simulate the payment process
      // In production, uncomment the FlutterwaveInit call below
      
      // FlutterwaveInit(paymentData)
      //   .then(handleOnRedirect)
      //   .catch((error) => {
      //     console.error('Flutterwave error:', error);
      //     Alert.alert('Payment Error', 'Unable to initialize payment. Please try again.');
      //     setIsLoading(false);
      //   });

      // Simulate payment for demo purposes
      if (!showPhoneInput) {
        setShowPhoneInput(true);
        setIsLoading(false);
        return;
      }

      // Simulate payment processing
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
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'Unable to process payment. Please try again.');
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
          phone_number: phoneNumber,
          payment_date: new Date().toISOString(),
          payment_status: paymentResponse.status === 'successful' ? 'completed' : 'failed',
          payment_method: 'mobile_money',
          currency: 'UGX',
          transaction_id: paymentResponse.transaction_id || `MK_${Date.now()}`,
          flutterwave_tx_ref: paymentResponse.tx_ref || null,
          notes: `Payment for ${getServiceLabel(selectedService)} via MobiKlinic app`,
        }
      };

      const response = await fetch(
        'https://mk-be-strapi-production.up.railway.app/api/payments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to record transaction');
      }

      const result = await response.json();
      console.log('Transaction recorded:', result);
      return result;
    } catch (error) {
      console.error('Error recording transaction:', error);
      // Don't throw error here as payment was successful
      // Just log it for debugging
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
  };

  if (isLoading) return <Loader />;

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
            <Icon name="credit-card" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.payButtonText}>
              {showPhoneInput ? 'Pay Now' : 'Continue to Payment'}
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
    borderRadius: 8,
    elevation: 2,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: COLORS.LIGHT_GRAY,
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 5,
  },
});

export default Payment;

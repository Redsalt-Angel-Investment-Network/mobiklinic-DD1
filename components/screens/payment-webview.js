import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {WebView} from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../constants/styles';

const PaymentWebView = ({route, navigation}) => {
  const {paymentData} = route.params;
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);

  // Generate Flutterwave payment URL
  const generatePaymentUrl = () => {
    const baseUrl = 'https://checkout.flutterwave.com/v3/hosted/pay';
    const params = new URLSearchParams({
      public_key: paymentData.authorization,
      tx_ref: paymentData.tx_ref,
      amount: paymentData.amount,
      currency: paymentData.currency,
      payment_options: paymentData.payment_options,
      customer_email: paymentData.customer.email,
      customer_phone_number: paymentData.customer.phone_number,
      customer_name: paymentData.customer.name,
      customizations_title: paymentData.customizations.title,
      customizations_description: paymentData.customizations.description,
      redirect_url: 'https://mobiklinic.com',
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  const handleNavigationStateChange = (navState) => {
    const {url} = navState;
    console.log('WebView URL:', url);

    // Check for payment completion
    if (url.includes('mobiklinic.com') || url.includes('flutterwave.com/pay/confirmation')) {
      // Extract transaction reference from URL if possible
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const txRef = urlParams.get('tx_ref') || paymentData.tx_ref;
      
      // Simulate successful payment response
      const simulatedResponse = {
        status: 'successful',
        transaction_id: txRef,
        tx_ref: txRef,
        amount: paymentData.amount,
        currency: paymentData.currency,
      };

      // Return success result
      navigation.goBack();
      route.params.onPaymentComplete?.(simulatedResponse);
    } else if (url.includes('cancelled') || url.includes('failed')) {
      // Handle payment failure
      Alert.alert('Payment Failed', 'Payment was cancelled or failed. Please try again.');
      navigation.goBack();
    }
  };

  const handleError = (syntheticEvent) => {
    const {nativeEvent} = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    Alert.alert('Error', 'Unable to load payment page. Please check your internet connection.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={styles.placeholder} />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading payment page...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{uri: generatePaymentUrl()}}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.PRIMARY,
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
    color: COLORS.WHITE,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 34, // Same width as back button for centering
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.GRAY,
  },
});

export default PaymentWebView;

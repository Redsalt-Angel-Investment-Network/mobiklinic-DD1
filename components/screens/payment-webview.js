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
  const {url, txRef, paymentData, amount, selectedService, phoneNumber, userNames, onPaymentComplete, onPaymentCancel} = route.params;
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const webViewRef = useRef(null);

  // Use provided URL or generate Flutterwave payment URL
  const getPaymentUrl = () => {
    if (url) {
      return url;
    }
    
    // Fallback: Generate URL from paymentData if available
    if (paymentData) {
      const baseUrl = 'https://checkout.flutterwave.com/v3/hosted/pay';
      
      // Manually construct query string to avoid URLSearchParams
      const params = [
        `public_key=${encodeURIComponent(paymentData.authorization)}`,
        `tx_ref=${encodeURIComponent(paymentData.tx_ref)}`,
        `amount=${encodeURIComponent(paymentData.amount)}`,
        `currency=${encodeURIComponent(paymentData.currency)}`,
        `payment_options=${encodeURIComponent(paymentData.payment_options)}`,
        `customer_email=${encodeURIComponent(paymentData.customer.email)}`,
        `customer_phone_number=${encodeURIComponent(paymentData.customer.phone_number)}`,
        `customer_name=${encodeURIComponent(paymentData.customer.name)}`,
        `customizations_title=${encodeURIComponent(paymentData.customizations.title)}`,
        `customizations_description=${encodeURIComponent(paymentData.customizations.description)}`,
        `redirect_url=${encodeURIComponent('https://mobiklinic.com/payment-complete')}`,
      ].join('&');
      
      return `${baseUrl}?${params}`;
    }
    
    return null;
  };

  // Helper function to parse URL parameters manually
  const parseUrlParams = (url) => {
    const params = {};
    const queryString = url.split('?')[1];
    
    if (queryString) {
      const pairs = queryString.split('&');
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      });
    }
    
    return params;
  };

  const handleNavigationStateChange = (navState) => {
    const {url: currentUrl} = navState;
    console.log('WebView URL:', currentUrl);

    // Prevent multiple processing
    if (isProcessing) {
      console.log('Already processing payment, skipping...');
      return;
    }

    // Check for payment completion
    if (
      currentUrl.includes('mobiklinic.com') || 
      currentUrl.includes('flutterwave.com/pay/confirmation') ||
      currentUrl.includes('status=successful') ||
      currentUrl.includes('payment-complete')
    ) {
      // Set processing flag to prevent duplicate calls
      setIsProcessing(true);
      
      // Extract transaction reference from URL manually
      const urlParams = parseUrlParams(currentUrl);
      const status = urlParams.status;
      const transactionId = urlParams.transaction_id || txRef;
      
      console.log('Payment completed with status:', status);
      console.log('Transaction ID:', transactionId);
      
      // Build payment response with all necessary data
      const paymentResponse = {
        status: status || 'successful',
        transaction_id: transactionId,
        tx_ref: txRef,
        amount: amount || paymentData?.amount,
        currency: paymentData?.currency || 'UGX',
      };

      // Show processing indicator
      setLoading(true);

      // Call the payment completion handler immediately
      setTimeout(() => {
        navigation.goBack();
        if (onPaymentComplete) {
          onPaymentComplete(paymentResponse);
        }
      }, 300);
    } else if (
      currentUrl.includes('cancelled') || 
      currentUrl.includes('failed') ||
      currentUrl.includes('status=cancelled')
    ) {
      // Handle payment failure/cancellation
      Alert.alert(
        'Payment Cancelled', 
        'Payment was cancelled or failed. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
              if (onPaymentCancel) {
                onPaymentCancel();
              }
            }
          }
        ]
      );
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
          <Text style={styles.loadingText}>
            {isProcessing ? 'Processing payment...' : 'Loading payment page...'}
          </Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{uri: getPaymentUrl()}}
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
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
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

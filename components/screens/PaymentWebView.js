import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {WebView} from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../constants/styles';

const PaymentWebView = ({route, navigation}) => {
  const {url, txRef, onPaymentComplete, onPaymentCancel} = route.params;
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [webViewRef, setWebViewRef] = useState(null);

  const handleNavigationStateChange = (navState) => {
    const {url: currentUrl} = navState;
    setCanGoBack(navState.canGoBack);
    
    // Check if payment was completed based on URL patterns
    if (currentUrl.includes('payment-success') || 
        currentUrl.includes('successful') || 
        currentUrl.includes('completed')) {
      
      Alert.alert(
        'Payment Status',
        'It appears your payment was successful. Please confirm:',
        [
          {
            text: 'Yes, Payment Completed',
            onPress: () => {
              if (onPaymentComplete) onPaymentComplete();
              navigation.goBack();
            },
          },
          {
            text: 'No, Payment Failed',
            onPress: () => {
              if (onPaymentCancel) onPaymentCancel();
              navigation.goBack();
            },
            style: 'cancel',
          },
        ]
      );
    } else if (currentUrl.includes('cancel') || 
               currentUrl.includes('failed') || 
               currentUrl.includes('error')) {
      
      Alert.alert(
        'Payment Cancelled',
        'It appears your payment was cancelled or failed.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onPaymentCancel) onPaymentCancel();
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Close Payment',
      'Are you sure you want to close the payment page? Your payment may not be completed.',
      [
        {
          text: 'Continue Payment',
          style: 'cancel',
        },
        {
          text: 'Payment Completed',
          onPress: () => {
            if (onPaymentComplete) onPaymentComplete();
            navigation.goBack();
          },
        },
        {
          text: 'Close',
          onPress: () => {
            if (onPaymentCancel) onPaymentCancel();
            navigation.goBack();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleGoBack = () => {
    if (webViewRef && canGoBack) {
      webViewRef.goBack();
    } else {
      handleClose();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon 
            name={canGoBack ? "arrow-left" : "close"} 
            size={24} 
            color={COLORS.WHITE} 
          />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Complete Payment</Text>
        
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading payment page...</Text>
          </View>
        )}
        
        <WebView
          ref={setWebViewRef}
          source={{uri: url}}
          style={styles.webView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onError={(syntheticEvent) => {
            const {nativeEvent} = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            Alert.alert(
              'Error Loading Payment Page',
              'There was an error loading the payment page. Please try again.',
              [
                {text: 'Retry', onPress: () => webViewRef && webViewRef.reload()},
                {text: 'Close', onPress: handleClose, style: 'cancel'}
              ]
            );
          }}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Complete your payment securely on this page
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.PRIMARY,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  webView: {
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
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.PRIMARY,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.WHITE,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default PaymentWebView;

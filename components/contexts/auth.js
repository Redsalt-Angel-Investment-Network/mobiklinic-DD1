import React, {createContext, useState, useEffect, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState, Alert} from 'react-native';

export const AuthContext = createContext();

const SESSION_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export function AuthProvider({children}) {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loginTime, setLoginTime] = useState(null);
  const sessionCheckInterval = useRef(null);
  const appState = useRef(AppState.currentState);

  // Function to handle logout
  const handleAutoLogout = async () => {
    console.log('Session expired - logging out user');
    
    // Clear all session data
    try {
      await AsyncStorage.clear();
      setUser(null);
      setTokens(null);
      setLoginTime(null);
      
      Alert.alert(
        'Session Expired',
        'Your session has expired after 6 hours. Please login again.',
        [{text: 'OK'}]
      );
    } catch (error) {
      console.error('Error during auto logout:', error);
    }
  };

  // Check if session has expired
  const checkSessionExpiry = async () => {
    if (!loginTime) return;

    const currentTime = Date.now();
    const elapsedTime = currentTime - loginTime;

    console.log(`Session check - Elapsed time: ${Math.floor(elapsedTime / 1000 / 60)} minutes`);

    if (elapsedTime >= SESSION_DURATION) {
      await handleAutoLogout();
    }
  };

  // Start session monitoring when user logs in
  useEffect(() => {
    if (user && loginTime) {
      // Check session immediately
      checkSessionExpiry();

      // Set up interval to check every minute
      sessionCheckInterval.current = setInterval(() => {
        checkSessionExpiry();
      }, 60000); // Check every 1 minute

      // Save login time to AsyncStorage
      AsyncStorage.setItem('loginTime', loginTime.toString());

      console.log('Session monitoring started - will expire after 6 hours');
    } else {
      // Clear interval when user logs out
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = null;
      }
    }

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, [user, loginTime]);

  // Restore login time on app restart
  useEffect(() => {
    const restoreLoginTime = async () => {
      try {
        const savedLoginTime = await AsyncStorage.getItem('loginTime');
        if (savedLoginTime && user) {
          const savedTime = parseInt(savedLoginTime, 10);
          setLoginTime(savedTime);
          
          // Check if session expired while app was closed
          const elapsedTime = Date.now() - savedTime;
          if (elapsedTime >= SESSION_DURATION) {
            await handleAutoLogout();
          }
        }
      } catch (error) {
        console.error('Error restoring login time:', error);
      }
    };

    restoreLoginTime();
  }, [user]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground - check session expiry
        console.log('App came to foreground - checking session');
        checkSessionExpiry();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [loginTime]);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        setIsLoading,
        user,
        setUser,
        tokens,
        setTokens,
        loginTime,
        setLoginTime,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

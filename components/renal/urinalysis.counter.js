import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import {COLORS} from '../constants/styles';

const UrinalysisCounter = ({ navigation }) => {
  const [showTimerModal, setShowTimerModal] = useState(true);
  const [timer, setTimer] = useState(120);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer === 0) {
          clearInterval(interval);
          setShowTimerModal(false);
          return prevTimer;
        } else {
          return prevTimer - 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Modal
      visible={showTimerModal}
      transparent={true}
      animationType="fade"
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          <Text style={{ fontSize: 20, marginBottom: 10, color:COLORS.BLACK}}>
            Urinalysis Timer: {formatTime(timer)}
          </Text>
          <TouchableOpacity onPress={() => setShowTimerModal(false)}>
            <Text style={{ color: COLORS.PRIMARY, fontSize:18 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UrinalysisCounter;

import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Modal, Alert} from 'react-native';
import {COLORS} from '../constants/styles';

const UrinalysisCounter = ({navigation}) => {
  const [showTimerModal, setShowTimerModal] = useState(true);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer === 30) {
      setShowTimerModal(false);
      Alert.alert('Reminder', 'Fill in the results for 30 seconds');
    } else if (timer === 45) {
      Alert.alert('Reminder', 'Fill in the results for 45 seconds');
    } else if (timer === 60) {
      Alert.alert('Reminder', 'Fill in the results for 60 seconds');
    }
  }, [timer]);

  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      <View style={{alignItems: 'center', marginTop: 20, }}>
        <Text style={{fontSize: 18,color:'red'}}>Elapsed time: {formatTime(timer)}</Text>
      </View>
      <Modal visible={showTimerModal} transparent={true} animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <View
            style={{backgroundColor: 'white', padding: 20, borderRadius: 10}}>
            <Text style={{fontSize: 18, marginBottom: 10, color: COLORS.BLACK, fontWeight:'bold'}}>
              Urinalysis Timer: {formatTime(timer)}
            </Text>
            <TouchableOpacity onPress={() => setShowTimerModal(false)}>
              <Text style={{color: COLORS.PRIMARY, fontSize: 18,}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default UrinalysisCounter;

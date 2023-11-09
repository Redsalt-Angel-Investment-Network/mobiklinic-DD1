import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, DIMENS } from '../constants/styles';

const SideNavbar = ({ navigation }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [animatedValue] = useState(new Animated.Value(1));

  const handleOpen = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setIsOpen(true);
  };

  const handleClose = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
      navigation.navigate('Dashboard');
    });
  };

  const animatedDrawerStyle = {
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-250, 0],
        }),
      },
    ],
  };

  const menuItems = [
    { screen: 'Profile', title: 'Profile' },
    { screen: 'About', title: 'About' },
    { screen: 'Chats', title: 'Moby Chat' },
    { screen: 'Appointments', title: 'Appointments' },
    { screen: 'PatientLists', title: 'Search Patient' },
  ];

  return (
    <View style={[styles.container, isOpen && styles.openContainer]}>
      <View style={styles.hamburgerContainer}>
        <TouchableOpacity onPress={handleOpen}>
          <Icon name="menu" size={25} color={COLORS.BLACK} />
        </TouchableOpacity>
      </View>
      <Animated.View style={[styles.drawer, animatedDrawerStyle]}>
        <TouchableOpacity onPress={handleClose} style={[styles.closeButton, {fontSize:30}]}>
          <Text style={styles.drawerHeaderText}>X</Text>
        </TouchableOpacity>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}>
            <Text style={styles.drawerHeaderText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  openContainer: {
    backgroundColor: COLORS.PRIMARY,
  },
  hamburgerContainer: {
    padding: 20,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 400,
    height: '100%',
    padding: 20,
    backgroundColor: COLORS.PRIMARY,
  },
  drawerHeaderText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 20,
    paddingVertical: 13,
  },
  card: {

    borderBottomWidth: 1,
    borderBottomColor: COLORS.WHITE,
    marginVertical: 20,
    textAlign:'center', 
    marginTop:30

  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    marginBottom:20,
    fontSize:30
  },
});

export default SideNavbar;

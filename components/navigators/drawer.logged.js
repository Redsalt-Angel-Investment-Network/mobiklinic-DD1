import React, {useState} from 'react';
import {View, TouchableOpacity, Animated, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {COLORS} from '../constants/styles';

const SideNavbar = ({navigation}) => {
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
    {screen: 'Profile', title: 'Profile'},
    {screen: 'About', title: 'About'},
    {screen: 'Chats', title: 'Moby Chat'},
    {screen: 'Appointments', title: 'Appointments'},
    {screen: 'PatientLists', title: 'Search Patient'},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.hamburgerContainer}>
        <TouchableOpacity onPress={handleOpen}>
          <Icon name="menu" size={25} color={COLORS.BLACK} />
        </TouchableOpacity>
      </View>
      <Animated.View style={[styles.drawer, animatedDrawerStyle]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}>
            <Text style={styles.menuItemText}>{item.title}</Text>
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
    backgroundColor: COLORS.PRIMARY,
  },
  hamburgerContainer: {
    padding: 20,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 250,
    height: '100%',
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: COLORS.PRIMARY_DARK,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 10,
    padding: 10,
  },
  closeButtonText: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WHITE,
    marginVertical: 10,
    paddingVertical: 10,
  },
  menuItemText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SideNavbar;

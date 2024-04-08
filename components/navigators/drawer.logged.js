import React, {useState} from 'react';
import {View, TouchableOpacity, Animated, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {COLORS} from '../constants/styles';
import FoIcon from 'react-native-vector-icons/Fontisto';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {signOut} from '../helpers/functions';
import {AuthContext} from '../contexts/auth';

const SideNavbar = ({navigation}) => {
  const [animatedValue] = useState(new Animated.Value(1));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {setTokens, setUser} = React.useContext(AuthContext);

  const handleOpen = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: animationDuration,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(true);
  };

  const handleClose = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: animationDuration,
      useNativeDriver: true,
    }).start(() => {
      setIsMenuOpen(false);
      navigation.navigate('Dashboard');
    });
  };

  const drawerAnimationStyle = {
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-drawerWidth, 0],
        }),
      },
    ],
  };

  const handleLogout = () => {
    // Logic for handling logout
  };

  const menuItems = [
    {screen: 'Profile', title: 'Profile', icon: 'user'},
    {screen: 'PatientLists', title: 'Search Patient', icon: 'search'},
    {screen: 'Chats', title: 'Moby Chat', icon: 'message-square'},
    {screen: 'Appointments', title: 'Appointments', icon: 'calendar'},
    {screen: 'About', title: 'About', icon: 'info'},
    {screen: 'Doctors', title: 'Ask The Doctor', icon: 'user'},
  ];

  return (
    <View style={styles.container}>
      {/* {!isMenuOpen && (
        <TouchableOpacity
          style={styles.hamburgerContainer}
          onPress={handleOpen}>
          <Icon name="menu" size={25} color={COLORS.BLACK} />
        </TouchableOpacity>
      )} */}
      <Animated.View style={[styles.drawer, drawerAnimationStyle]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>{closeButtonText}</Text>
        </TouchableOpacity>
        <View style={styles.menuItemsContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}>
              <Icon
                name={item.icon}
                size={20}
                color={COLORS.WHITE}
                style={styles.menuItemIcon}
              />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.logoutButton}>
          <TouchableOpacity
            onPress={() => {
              setTokens(null);
              signOut(setUser);
            }}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const animationDuration = 250;
const drawerWidth = 250;
const closeButtonText = 'X';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
  },
  hamburgerContainer: {
    paddingHorizontal: 20,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: drawerWidth,
    height: '100%',
    paddingHorizontal: 10,
    backgroundColor: COLORS.PRIMARY_DARK,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 0,
    padding: 15,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  closeButtonText: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuItemsContainer: {
    marginTop: 50,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.WHITE,
  },
  menuItemIcon: {
    marginRight: 10,
  },
  menuItemText: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 'auto',
    paddingVertical: 20,
    // borderTopWidth: 1,
    // borderTopColor: COLORS.WHITE,
  },
  logoutButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    // textAlign: 'center',
  },
});

export default SideNavbar;

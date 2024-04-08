import React, {useEffect, useState} from 'react';
import {
  View,
  Linking,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {ListItem} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../ui/custom-header';
import Loader from '../ui/loader';
import {COLORS} from '../constants/styles';
import CopyRight from '../copyright';

const Hospital = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [login, setLogin] = useState(false);

  useEffect(() => {
    getDoctors();
  }, []);

  const getDoctors = async () => {
    // Simulate API call or data fetching
    const dummyData = [
      {
        _id: '1',
        name: 'Kawoolo Hospital',
        hospital: 'Kampala-Jinja Road',
        status: 1,
        phone: '+256 772680727',
        location: 'Lugazi, Uganda',
      },

      {
        _id: '3',
        name: 'Tongolo Health Centre II',
        hospital: 'Tongolo Trading Centre, Nyenga Sub County',
        status: 1,
        location: 'Buikwe North/C/O P.O. Box 4629, Buikwe, Uganda',
        phone: '+256 772971109',
      },
      {
        _id: '4',
        name: 'Makonge Community Health Centre',
        hospital: 'Kiyindi',
        status: 1,
        location: 'Buikwe, Uganda',
        phone: '+256 707367315',
      },
      {
        _id: '5',
        name: 'Bubiro Health Centre II',
        hospital: 'Bubiro Trading Centre, Ngogwe Sub County',
        status: 1,
        location: 'Buikwe, Uganda',
        phone: '+256 704131863',
      },
      {
        _id: '6',
        name: 'Kabizzi Community Health Centre',
        hospital: 'Nyenga',
        status: 1,
        location: 'Buikwe, Uganda',
        phone: '+256 704131863',
      },
      {
        _id: '7',
        name: 'Herona Hospital',
        hospital: 'Mukono',
        status: 1,
        location: ' Uganda',
        phone: '+256 701145932',
      },
      {
        _id: '8',
        name: 'Mukono General Hospital',
        hospital: 'A109',
        status: 1,
        location: 'Mukono, Uganda',
        phone: '0800 100066',
      },
    ];

    setDoctors(dummyData);
    setIsLoading(false);
  };

  const keyExtractor = item => item._id;

  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)}>
      <ListItem bottomDivider>
        <Icon
          name="circle"
          size={25}
          color={
            item.status === 1
              ? 'green'
              : item.status === 2
              ? COLORS.PRIMARY
              : '#f00'
          }
        />
        <ListItem.Content>
          <ListItem.Title style={styles.listTitle}>{item.name}</ListItem.Title>
          <ListItem.Subtitle style={styles.subtitle}>
            <View style={styles.wrapper}>
              <View style={styles.subtitle}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={{color: COLORS.BLACK}}>{item.phone}</Text>
              </View>
              <View style={[styles.subtitle, {color: COLORS.BLACK}]}>
                <Text style={{color: COLORS.BLACK}}>{item.hospital}</Text>
              </View>
              <View style={[styles.subtitle, {color: COLORS.BLACK}]}>
                <Text style={{color: COLORS.BLACK}}>{item.location}</Text>
              </View>
            </View>
          </ListItem.Subtitle>
        </ListItem.Content>
        <Icon name="phone" size={25} color="rgba(0,0,0,.3)" />
      </ListItem>
    </TouchableOpacity>
  );

  if (login) return <Login />;
  if (isLoading) return <Loader />;
  if (!doctors || doctors.length === 0) {
    return (
      <View style={styles.container}>
        <CustomHeader navigation={navigation} title={'Doctors'} />
        <View>
          <StatusBar />
          <Text style={styles.textColor}>No Doctors available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar />
      <View>
        <Text style={styles.header}>HOSPITALS NEAR ME</Text>
      </View>
      <FlatList
        data={doctors}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
      <CopyRight />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.SECONDARY,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.SECONDARY,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    flexDirection: 'row',
    fontSize: 15,
    opacity: 0.5,
    color: COLORS.BLACK,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
    color: COLORS.BLACK,
  },
  textColor: {
    color: COLORS.BLACK,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    // marginBottom: 20,
    textAlign: 'center',
    paddingVertical: 20,
    textDecorationLine: 'underline',
    backgroundColor: COLORS.WHITE,
  },
});

export default Hospital;

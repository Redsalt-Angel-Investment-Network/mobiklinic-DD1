import React, { useEffect, useState } from 'react';
import {
  View,
  Linking,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import haversine from 'haversine-distance';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather';
import Loader from '../ui/loader';
import { COLORS } from '../constants/styles';
import CopyRight from '../copyright';

const Hospital = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchHospitals();
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation && hospitals.length > 0) {
      filterHospitalsByDistance();
    }
  }, [currentLocation, hospitals]);

  const requestLocationPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await request(permission);

    if (result === RESULTS.GRANTED) {
      getCurrentLocation();
    } else {
      console.error('Location permission denied');
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
      },
      error => {
        console.error('Error fetching location:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchHospitals = async () => {
    try {
      const response = await fetch(
        'https://mk-be-strapi-production.up.railway.app/api/facility-locations',
      );
      const data = await response.json();
      setHospitals(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setIsLoading(false);
    }
  };

  const filterHospitalsByDistance = () => {
    const nearbyHospitals = hospitals.filter(hospital => {
      const hospitalLocation = {
        latitude: hospital.attributes.location.coordinates.lat,
        longitude: hospital.attributes.location.coordinates.lng,
      };
      const distance = haversine(currentLocation, hospitalLocation) / 1000; // Convert to kilometers
      return distance <= 20; // 20km radius
    });
    setFilteredHospitals(nearbyHospitals);
  };

  const getDirections = (latitude, longitude) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  if (isLoading || !currentLocation) return <Loader />;

  return (
    <View style={styles.wrapper}>
      <StatusBar />
      <View>
        <Text style={styles.header}>HOSPITALS NEAR ME</Text>
      </View>

      {/* MapView to display hospital locations */}
      <MapView
        style={styles.map}
        region={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}>
        {filteredHospitals.map(hospital => (
          <Marker
            key={hospital.id}
            coordinate={{
              latitude: hospital.attributes.location.coordinates.lat,
              longitude: hospital.attributes.location.coordinates.lng,
            }}>
            <Icon name="map-pin" size={30} color="red" />
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.hospitalName}>
                  {hospital.attributes.facility_name || 'No name available'}
                </Text>
                <Text style={styles.calloutText}>
                  {hospital.attributes.location.address || 'No address available'}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Scrollable ListView for hospitals */}
      <ScrollView style={styles.container}>
        {filteredHospitals.map(hospital => (
          <View key={hospital.id} style={styles.hospitalItem}>
            <ListItem bottomDivider>
              <Icon name="circle" size={25} color="green" />
              <ListItem.Content>
                <ListItem.Title style={styles.listTitle}>
                  {hospital.attributes.facility_name}
                </ListItem.Title>
                <View style={styles.subtitle}>
                  <Text style={styles.addressText}>
                    {hospital.attributes.location.address}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`tel:${hospital.attributes.facility_phone}`)
                    }>
                    <Text style={styles.phoneNumber}>
                      {hospital.attributes.facility_phone}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ListItem.Content>
              <TouchableOpacity
                onPress={() =>
                  getDirections(
                    hospital.attributes.location.coordinates.lat,
                    hospital.attributes.location.coordinates.lng,
                  )
                }>
                <View style={styles.directionsButton}>
                  <Text style={styles.buttonText}>Directions</Text>
                </View>
              </TouchableOpacity>
            </ListItem>
          </View>
        ))}
      </ScrollView>

      <CopyRight />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.SECONDARY,
  },
  map: {
    width: '100%',
    height: '50%',
  },
  container: {
    flex: 1,
    paddingTop: 10,
    marginHorizontal: 10,
    marginBottom: -60,
  },
  hospitalItem: {
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 5,
  },
  addressText: {
    fontSize: 15,
    color: 'black',
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    textAlign: 'center',
    paddingVertical: 20,
  },
  directionsButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  phoneNumber: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  calloutContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    width: 200,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    textAlign: 'center',
  },
  calloutText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
  },
});

export default Hospital;

import React, {useEffect, useState} from 'react';
import {
  View,
  Linking,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MapView, {Marker, Callout} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Loader from '../ui/loader';
import {COLORS} from '../constants/styles';
import CopyRight from '../copyright';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Hospital = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchHospitals();
    }
  }, [currentLocation]);

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
        const {latitude, longitude} = position.coords;
        setCurrentLocation({latitude, longitude});
      },
      error => {
        console.error('Error fetching location:', error);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const fetchHospitals = async () => {
    try {
      const API_KEY = 'AIzaSyDCvUkojTus7OjaK5iOvCHGs90RkvseNDs';
      const radius = 10000; // 10km radius
      const type = 'hospital'; // Search for hospitals
      const keyword =
        'general Hospital Clinic Healthcare NATIONAL Referral Health center ';

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${currentLocation.latitude},${currentLocation.longitude}&radius=${radius}&type=${type}&keyword=${keyword}&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        const filteredResults = data.results.filter(place =>
          ['hospital', 'clinic', 'health center', 'healthcare'].some(keyword =>
            place.name.toLowerCase().includes(keyword),
          ),
        );

        const formattedHospitals = await Promise.all(
          filteredResults.map(async place => {
            const details = await fetchPlaceDetails(place.place_id, API_KEY);
            return {
              id: place.place_id,
              name: place.name,
              address: place.vicinity,
              phone: details?.formatted_phone_number || 'No contact available',
              location: {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              },
            };
          }),
        );

        setHospitals(formattedHospitals);
      } else {
        console.error('Error fetching places:', data.error_message);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching hospitals from Google Places:', error);
      setIsLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId, apiKey) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  };

  const getDirections = (latitude, longitude) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const dialPhoneNumber = phoneNumber => {
    if (phoneNumber !== 'No contact available') {
      const url = `tel:${phoneNumber}`;
      Linking.openURL(url);
    }
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
        {hospitals.map(hospital => (
          <Marker
            key={hospital.id}
            coordinate={{
              latitude: hospital.location.latitude,
              longitude: hospital.location.longitude,
            }}>
            <MaterialCommunityIcons
              name="hospital-building"
              size={30}
              color="red"
            />

            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.hospitalName}>
                  {hospital.name || 'No name available'}
                </Text>
                <Text style={styles.calloutText}>
                  {hospital.address || 'No address available'}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Scrollable ListView for hospitals */}
      <ScrollView style={styles.container}>
        {hospitals.map((hospital, index) => (
          <View key={hospital.id}>
            <View style={styles.hospitalItem}>
              <View style={styles.hospitalInfo}>
                {/* Hospital Name and Description */}
                <View style={styles.hospitalDetails}>
                  <Text style={styles.listTitle}>{hospital.name}</Text>
                  <Text style={styles.addressText}>{hospital.address}</Text>
                  <TouchableOpacity
                    onPress={() => dialPhoneNumber(hospital.phone)}>
                    <Text style={styles.phoneText}>{hospital.phone}</Text>
                  </TouchableOpacity>
                </View>

                {/* Directions Button */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      getDirections(
                        hospital.location.latitude,
                        hospital.location.longitude,
                      )
                    }>
                    <View style={styles.directionsButton}>
                      <Text style={styles.buttonText}>Directions</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Grey Divider */}
            {index < hospitals.length - 1 && <View style={styles.divider} />}
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
    fontSize: 13,
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
  hospitalItem: {
    marginBottom: 19,
  },
  hospitalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  addressText: {
    fontSize: 15,
    color: 'black',
    flexWrap: 'wrap',
  },
  phoneText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    marginTop: 5,
    fontWeight: 'bold',
  },
  hospitalDetails: {
    flex: 3,
  },
  buttonContainer: {
    flex: 1, // Ensures the button aligns to the right
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc', // Grey color for the divider
    marginVertical: 10, // Space above and below the divider
  },
});

export default Hospital;

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

const Ambulance = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [ambulances, setAmbulances] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchAmbulances();
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

  const fetchAmbulances = async () => {
    try {
      const API_KEY = 'AIzaSyCg-e2L5EiacXeQ-lwWD6Cqna-ote0mQxg';
      const radius = 10000; // 10km radius
      const type = 'ambulances';
      const keyword = 'Ambulance';
  
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${currentLocation.latitude},${currentLocation.longitude}&radius=${radius}&type=${type}&keyword=${keyword}&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      const backendAmbulances = await fetchBackendAmbulances();
  
      if (data.results) {
        const filteredResults = data.results.filter(place =>
          ['ambulance'].some(keyword =>
            place.name.toLowerCase().includes(keyword),
          ),
        );
  
        const formattedAmbulances = await Promise.all(
          filteredResults.map(async place => {
            const details = await fetchPlaceDetails(place.place_id, API_KEY);
            return {
              id: place.place_id,
              name: place.name,
              address: place.vicinity,
              phone: details?.formatted_phone_number || 'No contact available',
              transport_mode: 'ambulance', // Explicitly set to 'ambulance'
              location: {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              },
            };
          }),
        );
  
        setAmbulances([...formattedAmbulances, ...backendAmbulances]);
      } else {
        console.error('Error fetching places:', data.error_message);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching ambulances from Google Places:', error);
      setIsLoading(false);
    }
  };
  

  const fetchBackendAmbulances = async () => {
    try {
      const response = await fetch(
        'https://mk-be-strapi-production.up.railway.app/api/ambulance-locations',
      );
      const data = await response.json();

      if (data && data.data) {
        const formattedData = data.data.map(item => ({
          id: item.id,
          name: item.attributes.name,
          phone: item.attributes.phone || 'No contact available',
          address: item.attributes.location.address,
          location: {
            latitude: item.attributes.location.coordinates.lat,
            longitude: item.attributes.location.coordinates.lng,
          },
          transport_mode: item.attributes.transport_mode,
        }));

        return formattedData;
      } else {
        console.error('Error fetching backend ambulances:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching backend ambulances:', error);
      return [];
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

  const getIconName = transportMode => {
    switch (transportMode) {
      case 'boda-boda':
        return 'motorbike';
      case 'special-hire':
        return 'car';
      case 'ambulance':
      default:
        return 'ambulance';
    }
  };

  if (isLoading || !currentLocation) return <Loader />;

  return (
    <View style={styles.wrapper}>
      <StatusBar />
      <View>
        <Text style={styles.header}>AMBULANCES NEAR ME</Text>
      </View>
      {/* MapView to display ambulance locations */}
      <MapView
        style={styles.map}
        region={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}>
       {ambulances.map(ambulance => (
  <Marker
    key={ambulance.id}
    coordinate={{
      latitude: ambulance.location.latitude,
      longitude: ambulance.location.longitude,
    }}>
    <MaterialCommunityIcons
      name={getIconName(ambulance.transport_mode)}
      size={
        ambulance.transport_mode === 'boda-boda' ? 45 : 35 
      }
      color={
        ambulance.transport_mode === 'ambulance'
          ? 'red' // Ambulances will be red
          : ambulance.transport_mode === 'boda-boda'
          ? 'green' // Motorbikes will be green
          : 'blue' // Special hires will be blue
      }
    />
    <Callout>
      <View style={styles.calloutContainer}>
        <Text style={styles.ambulanceName}>
          {ambulance.name || 'No name available'}
        </Text>
        <Text style={styles.calloutText}>
          {ambulance.address || 'No address available'}
        </Text>
        <TouchableOpacity
          onPress={() => dialPhoneNumber(ambulance.phone)}>
          <Text style={styles.calloutText}>
            Call: {ambulance.phone}
          </Text>
        </TouchableOpacity>
      </View>
    </Callout>
  </Marker>
))}

      </MapView>
      {/* Scrollable ListView for ambulances */}
      <ScrollView style={styles.container}>
        {ambulances.map((ambulance, index) => (
          <View key={ambulance.id}>
            <View style={styles.ambulanceItem}>
              <View style={styles.ambulanceInfo}>
                {/* Ambulance Name and Description */}
                <View style={styles.ambulanceDetails}>
                  <Text style={styles.listTitle}>{ambulance.name}</Text>
                  <Text style={styles.addressText}>{ambulance.address}</Text>
                  <TouchableOpacity
                    onPress={() => dialPhoneNumber(ambulance.phone)}>
                    <Text style={styles.phoneText}>{ambulance.phone}</Text>
                  </TouchableOpacity>
                </View>

                {/* Directions Button */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      getDirections(
                        ambulance.location.latitude,
                        ambulance.location.longitude,
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
            {index < ambulance.length - 1 && <View style={styles.divider} />}
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
  ambulanceItem: {
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
  ambulanceName: {
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
  ambulanceItem: {
    marginBottom: 19,
  },
  ambulanceInfo: {
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
  ambulanceDetails: {
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

export default Ambulance;

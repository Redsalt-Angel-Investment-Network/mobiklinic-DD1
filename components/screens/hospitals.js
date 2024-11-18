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
import MapView, { Marker } from 'react-native-maps';
import { ListItem, Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather';
import Loader from '../ui/loader';
import { COLORS } from '../constants/styles';
import CopyRight from '../copyright';

const Hospital = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await fetch(
        'https://mk-be-strapi-production.up.railway.app/api/facility-locations'
      );
      const data = await response.json();
      setHospitals(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setIsLoading(false);
    }
  };

  const getDirections = (latitude, longitude) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  if (isLoading) return <Loader />;

  return (
    <View style={styles.wrapper}>
      <StatusBar />
      <View>
        <Text style={styles.header}>HOSPITALS NEAR ME</Text>
      </View>

      {/* MapView to display hospital locations */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 0.265, // Default center latitude
          longitude: 33.143, // Default center longitude
          latitudeDelta: 1, // Zoom level
          longitudeDelta: 1,
        }}
      >
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            coordinate={{
              latitude: hospital.attributes.location.coordinates.lat,
              longitude: hospital.attributes.location.coordinates.lng,
            }}
            title={hospital.attributes.facility_name}
            description={hospital.attributes.location.address}
            onCalloutPress={() =>
              Linking.openURL(`tel:${hospital.attributes.facility_phone}`)
            }
          >
            <Icon name="map-pin" size={25} color="red" />
          </Marker>
        ))}
      </MapView>

      {/* Scrollable ListView for hospitals */}
      <ScrollView style={styles.container}>
        {hospitals.map((hospital) => (
          <View key={hospital.id} style={styles.hospitalItem}>
            <ListItem bottomDivider>
              <Icon name="circle" size={25} color="green" />
              <ListItem.Content>
                <ListItem.Title style={styles.listTitle}>
                  {hospital.attributes.facility_name}
                </ListItem.Title>
                <ListItem.Subtitle style={styles.subtitle}>
                  <Text style={styles.address}>
                    {hospital.attributes.location.address}
                  </Text>
                  {'\n\n'}
                  <Text>{hospital.attributes.facility_phone}</Text>
                </ListItem.Subtitle>
              </ListItem.Content>
              <TouchableOpacity
                onPress={() =>
                  getDirections(
                    hospital.attributes.location.coordinates.lat,
                    hospital.attributes.location.coordinates.lng
                  )
                }
              >
                <Button
                  title="Directions"
                  buttonStyle={styles.directionsButton}
                  titleStyle={styles.buttonText}
                />
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
    height: '50%', // Adjust height based on preference
  },
  container: {
    flex: 1,
    paddingTop: 10,
    marginHorizontal: 10,
  },
  hospitalItem: {
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
  },
  address: {
    marginBottom: 8, // Space between address and phone number
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
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 14,
  },
});

export default Hospital;

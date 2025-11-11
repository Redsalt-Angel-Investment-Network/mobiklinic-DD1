import React, {useEffect, useState} from 'react';
import {
  View,
  Linking,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import LeafletMap from '../ui/LeafletMap';
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
      // Use OpenStreetMap Overpass API to find nearby hospitals
      const radius = 10000; // 10km radius
      
      // Query Overpass API for hospitals
      const overpassUrl = `https://overpass-api.de/api/interpreter`;
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:${radius},${currentLocation.latitude},${currentLocation.longitude});
          node["amenity"="clinic"](around:${radius},${currentLocation.latitude},${currentLocation.longitude});
          way["amenity"="hospital"](around:${radius},${currentLocation.latitude},${currentLocation.longitude});
          way["amenity"="clinic"](around:${radius},${currentLocation.latitude},${currentLocation.longitude});
        );
        out center;
      `;

      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: query,
      });
      const data = await response.json();

      if (data.elements) {
        const formattedHospitals = data.elements.map(place => {
          const lat = place.lat || place.center?.lat;
          const lon = place.lon || place.center?.lon;
          
          return {
            id: place.id,
            name: place.tags?.name || 'Healthcare Facility',
            address: place.tags?.['addr:full'] || 
                     place.tags?.['addr:street'] || 
                     'Address not available',
            phone: place.tags?.phone || 
                   place.tags?.['contact:phone'] || 
                   'No contact available',
            location: {
              latitude: lat,
              longitude: lon,
            },
          };
        }).filter(h => h.location.latitude && h.location.longitude);

        setHospitals(formattedHospitals);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching hospitals from OpenStreetMap:', error);
      setIsLoading(false);
    }
  };

  const getDirections = (latitude, longitude) => {
    const url = `https://www.openstreetmap.org/directions?from=${currentLocation.latitude},${currentLocation.longitude}&to=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const dialPhoneNumber = phoneNumber => {
    if (phoneNumber !== 'No contact available') {
      const url = `tel:${phoneNumber}`;
      Linking.openURL(url);
    }
  };

  if (isLoading || !currentLocation) return <Loader />;

  // Create markers for Leaflet
  const mapMarkers = hospitals.map(hospital => ({
    position: {
      lat: hospital.location.latitude,
      lng: hospital.location.longitude,
    },
    icon: `
      <div style="text-align: center;">
        <svg width="35" height="35" viewBox="0 0 24 24">
          <path fill="red" d="M2,22V10A1,1 0 0,1 3,9H7V3A1,1 0 0,1 8,2H16A1,1 0 0,1 17,3V21H22V22H2M9,4V22H15V4H9M11,6H13V8H11V6M11,10H13V12H11V10M11,14H13V16H11V14M11,18H13V20H11V18Z" />
        </svg>
      </div>
    `,
    size: [35, 35],
    title: hospital.name,
    popup: `
      <div style="padding: 10px; min-width: 200px;">
        <h3 style="color: ${COLORS.PRIMARY}; margin: 0 0 10px 0; font-size: 16px;">${
      hospital.name || 'No name available'
    }</h3>
        <p style="margin: 5px 0; font-size: 14px;">${
      hospital.address || 'No address available'
    }</p>
        <p style="color: ${COLORS.PRIMARY}; margin: 5px 0; font-size: 14px; font-weight: bold;">
          <a href="tel:${hospital.phone}" style="color: ${
      COLORS.PRIMARY
    }; text-decoration: none;">${hospital.phone}</a>
        </p>
      </div>
    `,
  }));

  return (
    <View style={styles.wrapper}>
      <StatusBar />
      <View>
        <Text style={styles.header}>HOSPITALS NEAR ME</Text>
      </View>

      {/* Leaflet MapView to display hospital locations */}
      <LeafletMap
        style={styles.map}
        mapCenterPosition={{
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
        }}
        zoom={17}
        mapMarkers={mapMarkers}
      />

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

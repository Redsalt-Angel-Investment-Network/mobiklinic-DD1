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

const Ambulance = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [ambulances, setAmbulances] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ambulance');

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
      const radius = 50000; // 50km radius in meters
      
      // Fetch from backend
      const backendAmbulances = await fetchBackendAmbulances();
      
      // Fetch emergency services from OpenStreetMap
      const osmAmbulances = await fetchOSMAmbulances(radius);
      
      // Combine both sources
      setAmbulances([...backendAmbulances, ...osmAmbulances]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching ambulances:', error);
      setIsLoading(false);
    }
  };

  const fetchOSMAmbulances = async (radius) => {
    try {
      console.log('Fetching from OSM with location:', currentLocation);
      
      // Query Overpass API for emergency services
      const overpassUrl = `https://overpass-api.de/api/interpreter`;
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="ambulance_station"](around:${radius},${currentLocation.latitude},${currentLocation.longitude});
          node["emergency"="ambulance_station"](around:${radius},${currentLocation.latitude},${currentLocation.longitude});
          node["amenity"="fire_station"](around:${radius},${currentLocation.latitude},${currentLocation.longitude});
          node["emergency"="yes"](around:${radius},${currentLocation.latitude},${currentLocation.longitude});
          way["amenity"="ambulance_station"](around:${radius},${currentLocation.latitude},${currentLocation.longitude});
          way["emergency"="ambulance_station"](around:${radius},${currentLocation.latitude},${currentLocation.longitude});
          way["amenity"="fire_station"](around:${radius},${currentLocation.latitude},${currentLocation.longitude});
          way["emergency"="yes"](around:${radius},${currentLocation.latitude},${currentLocation.longitude});
        );
        out center;
      `;

      console.log('Sending Overpass query...');
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      
      const data = await response.json();
      console.log('OSM response:', data);
      console.log('OSM elements found:', data.elements?.length || 0);

      if (data.elements && data.elements.length > 0) {
        const osmData = data.elements.map(place => {
          const lat = place.lat || place.center?.lat;
          const lon = place.lon || place.center?.lon;
          
          // Determine the type of service
          const isFireStation = place.tags?.amenity === 'fire_station';
          const isAmbulanceStation = place.tags?.amenity === 'ambulance_station' || 
                                      place.tags?.emergency === 'ambulance_station';
          
          let serviceName = place.tags?.name;
          if (!serviceName) {
            serviceName = isAmbulanceStation ? 'Ambulance Station' : 
                         isFireStation ? 'Fire Station (Emergency Services)' : 
                         'Emergency Service';
          }
          
          return {
            id: `osm-${place.id}`,
            name: serviceName,
            phone: place.tags?.phone || 
                   place.tags?.['contact:phone'] || 
                   place.tags?.['emergency:phone'] ||
                   'No contact available',
            address: place.tags?.['addr:full'] || 
                     place.tags?.['addr:street'] || 
                     place.tags?.['addr:city'] ||
                     'Address not available',
            location: {
              latitude: lat,
              longitude: lon,
            },
            transport_mode: 'ambulance', // Map all emergency services as ambulance for now
          };
        }).filter(item => item.location.latitude && item.location.longitude);
        
        console.log('Processed OSM data:', osmData.length, 'items');
        return osmData;
      }
      console.log('No OSM elements found');
      return [];
    } catch (error) {
      console.error('Error fetching OSM ambulances:', error);
      return [];
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const toRad = deg => (deg * Math.PI) / 180;
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };
  
  

  const fetchBackendAmbulances = async () => {
    try {
      const response = await fetch(
        'https://mk-be-strapi-production.up.railway.app/api/ambulance-locations'
      );
      const data = await response.json();
  
      if (data && data.data) {
        const filteredData = data.data
          .map(item => ({
            id: item.id,
            name: item.attributes.name,
            phone: item.attributes.phone || 'No contact available',
            address: item.attributes.location.address,
            location: {
              latitude: item.attributes.location.coordinates.lat,
              longitude: item.attributes.location.coordinates.lng,
            },
            transport_mode: item.attributes.transport_mode,
          }))
          .filter(item => {
            const distance = calculateDistance(
              currentLocation.latitude,
              currentLocation.longitude,
              item.location.latitude,
              item.location.longitude
            );
            return distance <= 10; // Filter ambulances within 10km radius
          });
  
        return filteredData;
      } else {
        console.error('Error fetching backend ambulances:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching backend ambulances:', error);
      return [];
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

  const getIconColor = transportMode => {
    switch (transportMode) {
      case 'ambulance':
        return 'red';
      case 'boda-boda':
        return 'green';
      case 'special-hire':
        return 'blue';
      default:
        return 'red';
    }
  };

  if (isLoading || !currentLocation) return <Loader />;

  const filteredAmbulances = ambulances.filter(
    ambulance => ambulance.transport_mode === selectedCategory
  );

  // Create markers for Leaflet
  const mapMarkers = filteredAmbulances.map(ambulance => ({
    position: {
      lat: ambulance.location.latitude,
      lng: ambulance.location.longitude,
    },
    icon: `
      <div style="text-align: center;">
        <svg width="40" height="40" viewBox="0 0 24 24">
          <path fill="${getIconColor(ambulance.transport_mode)}" d="${
      ambulance.transport_mode === 'boda-boda'
        ? 'M5,11H7V13H5V11M13,11H15V13H13V11M9,13H11V15H9V13M11,9H13V11H11V9M5,7H7V9H5V7M11,7H13V9H11V7M13,15V21L15,19V15H13M9,15V19L11,21V15H9M7,15V21H9L7,15M15,15V19L17,21V15H15M19,15V19L21,21V15H19Z'
        : ambulance.transport_mode === 'special-hire'
        ? 'M5,11L6.5,6.5H17.5L19,11M17.5,16A1.5,1.5 0 0,1 16,14.5A1.5,1.5 0 0,1 17.5,13A1.5,1.5 0 0,1 19,14.5A1.5,1.5 0 0,1 17.5,16M6.5,16A1.5,1.5 0 0,1 5,14.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 8,14.5A1.5,1.5 0 0,1 6.5,16M18.92,6C18.72,5.42 18.16,5 17.5,5H6.5C5.84,5 5.28,5.42 5.08,6L3,12V20A1,1 0 0,0 4,21H5A1,1 0 0,0 6,20V19H18V20A1,1 0 0,0 19,21H20A1,1 0 0,0 21,20V12L18.92,6Z'
        : 'M18,18.5A1.5,1.5 0 0,1 16.5,20A1.5,1.5 0 0,1 15,18.5A1.5,1.5 0 0,1 16.5,17A1.5,1.5 0 0,1 18,18.5M19.5,9.5L21.46,12H17V9.5M6,18.5A1.5,1.5 0 0,1 4.5,20A1.5,1.5 0 0,1 3,18.5A1.5,1.5 0 0,1 4.5,17A1.5,1.5 0 0,1 6,18.5M20,8H17V4H3C1.89,4 1,4.89 1,6V17H3A3,3 0 0,0 6,20A3,3 0 0,0 9,17H15A3,3 0 0,0 18,20A3,3 0 0,0 21,17H23V12L20,8Z'
    }" />
        </svg>
      </div>
    `,
    size: [40, 40],
    title: ambulance.name,
    popup: `
      <div style="padding: 10px; min-width: 200px;">
        <h3 style="color: ${COLORS.PRIMARY}; margin: 0 0 10px 0; font-size: 16px;">${
      ambulance.name || 'No name available'
    }</h3>
        <p style="margin: 5px 0; font-size: 14px;">${
      ambulance.address || 'No address available'
    }</p>
        <p style="color: ${COLORS.PRIMARY}; margin: 5px 0; font-size: 14px; font-weight: bold;">
          <a href="tel:${ambulance.phone}" style="color: ${
      COLORS.PRIMARY
    }; text-decoration: none;">Call: ${ambulance.phone}</a>
        </p>
      </div>
    `,
  }));

  return (
    <View style={styles.wrapper}>
      <StatusBar />
      <View>
        <Text style={styles.header}>AMBULANCES NEAR ME</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setSelectedCategory('ambulance')}
            style={styles.tab}>
            <Text style={styles.tabText}>Ambulances</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedCategory('boda-boda')}
            style={styles.tab}>
            <Text style={styles.tabText}>Boda Boda</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedCategory('special-hire')}
            style={styles.tab}>
            <Text style={styles.tabText}>Special Hire</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Leaflet MapView to display ambulance locations */}
      <LeafletMap
        style={styles.map}
        mapCenterPosition={{
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
        }}
        zoom={15}
        mapMarkers={mapMarkers}
      />
      {/* Scrollable ListView for ambulances */}
      <ScrollView style={styles.container}>
        {filteredAmbulances.map((ambulance, index) => (
          <View key={ambulance.id}>
            <View style={styles.ambulanceItem}>
              <View style={styles.ambulanceInfo}>
                {/* Ambulance Name and Description */}
                <View style={styles.ambulanceDetails}>
                  <Text style={styles.listTitle}>{ambulance.name}</Text>
                  <Text style={styles.addressText}>{ambulance.address}</Text>
                  <TouchableOpacity
                    onPress={() => dialPhoneNumber(ambulance.phone)}>
                    <Text style={styles.phoneText}>Call: {ambulance.phone}</Text>
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
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tab: {
    padding: 10,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 5,
  },
  tabText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Ambulance;

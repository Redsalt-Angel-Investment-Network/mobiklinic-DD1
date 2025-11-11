import React from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

const LeafletMap = ({mapMarkers, mapCenterPosition, zoom = 13, style}) => {
  // Generate markers HTML
  const markersHTML = mapMarkers
    .map(
      (marker, index) => `
    L.marker([${marker.position.lat}, ${marker.position.lng}], {
      icon: L.divIcon({
        html: \`${marker.icon}\`,
        className: 'custom-marker',
        iconSize: [${marker.size[0]}, ${marker.size[1]}],
        iconAnchor: [${marker.size[0] / 2}, ${marker.size[1]}]
      })
    })
    .addTo(map)
    .bindPopup(\`${marker.popup}\`);
  `,
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
        }
        .custom-marker {
          background: none;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${mapCenterPosition.lat}, ${mapCenterPosition.lng}], ${zoom});
        
        // Use OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);
        
        // Add markers
        ${markersHTML}
        
        // Add user location marker
        L.circleMarker([${mapCenterPosition.lat}, ${mapCenterPosition.lng}], {
          color: '#4A90E2',
          fillColor: '#4A90E2',
          fillOpacity: 0.8,
          radius: 8
        }).addTo(map).bindPopup('Your Location');
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{html: htmlContent}}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default LeafletMap;

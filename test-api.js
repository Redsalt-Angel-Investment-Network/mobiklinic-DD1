// Test script to verify local API connectivity
const testLocalAPI = async () => {
  const baseUrl = 'http://192.168.100.9:1337';
  
  try {
    console.log('Testing API connectivity...');
    
    // Test basic API endpoint
    const response = await fetch(`${baseUrl}/api/doctors`);
    console.log('API Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response data:', JSON.stringify(data, null, 2));
    } else {
      console.log('API returned error status:', response.status);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('Failed to connect to API:', error.message);
  }
};

// Run the test
testLocalAPI();

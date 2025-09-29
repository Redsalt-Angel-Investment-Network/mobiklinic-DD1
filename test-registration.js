const axios = require('axios');

// Test data for registration
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  username: '256700123456', // Phone number format
  email: 'testuser@example.com',
  password: 'testpassword123',
  country: 'Uganda'
};

// Test function
async function testRegistration() {
  try {
    console.log('Testing registration API...');
    console.log('Test data:', testUser);
    
    const response = await axios.post(
      'http://localhost:1337/api/auth/local/register',
      testUser,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.user) {
      console.log('\n📋 User details:');
      console.log('- ID:', response.data.user.id);
      console.log('- Username:', response.data.user.username);
      console.log('- Email:', response.data.user.email);
      console.log('- First Name:', response.data.user.firstName);
      console.log('- Last Name:', response.data.user.lastName);
      console.log('- Country:', response.data.user.country);
      console.log('- Confirmed:', response.data.user.confirmed);
    }
    
    if (response.data.jwt) {
      console.log('\n🔑 JWT Token received');
    }
    
  } catch (error) {
    console.error('❌ Registration failed!');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.data.error) {
        console.error('Error message:', error.response.data.error.message);
        if (error.response.data.error.details) {
          console.error('Error details:', error.response.data.error.details);
        }
      }
    } else if (error.request) {
      console.error('No response received. Is the backend server running?');
      console.error('Make sure Strapi is running on http://localhost:1337');
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

// Run the test
testRegistration();
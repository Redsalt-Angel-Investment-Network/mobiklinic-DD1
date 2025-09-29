const axios = require('axios');

// Test registration with existing phone number to see improved error handling
const testExistingUser = {
  firstName: 'Test',
  lastName: 'User',
  username: '256700123456', // Use a phone number we know exists
  email: 'test@example.com',
  password: 'testpassword123',
  country: 'Uganda'
};

async function testExistingPhoneError() {
  try {
    console.log('🧪 Testing registration with existing phone number...');
    console.log('Phone number:', testExistingUser.username);
    
    const response = await axios.post(
      'http://localhost:1337/api/auth/local/register',
      testExistingUser,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Unexpected success:', response.status);
    
  } catch (error) {
    if (error.response) {
      console.log('✅ Expected error caught!');
      console.log('Status:', error.response.status);
      console.log('Error data:', JSON.stringify(error.response.data, null, 2));
      
      // Simulate the frontend error handling logic
      const backendMessage = error.response.data?.error?.message;
      
      if (backendMessage && backendMessage.includes('Email or Username are already taken')) {
        console.log('\n📱 Frontend would show:');
        console.log('Title: "Phone Number Already Exists"');
        console.log(`Message: "This phone number (${testExistingUser.username}) is already registered.

Please try:
• Logging in if you have an account
• Using "Forgot Password" to reset your password
• Contact support at +256784528444"`);
      }
    } else {
      console.error('Network error:', error.message);
    }
  }
}

testExistingPhoneError();
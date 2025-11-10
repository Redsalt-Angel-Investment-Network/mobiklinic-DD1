// API Configuration
// Change this IP address to your computer's IP address when testing on physical device
// Use 'localhost' when testing on emulator/simulator

const API_CONFIG = {
  // For physical device (replace with your computer's IP)
  // BASE_URL: 'http://192.168.100.9:1337',
  
  // For emulator/simulator
  BASE_URL: 'http://localhost:1337',
  
  // For production
  // BASE_URL: 'https://mk-be-strapi-production.up.railway.app',
};

export const API_ENDPOINTS = {
  PAYMENTS: `${API_CONFIG.BASE_URL}/api/payments`,
  PAYMENT_HISTORY: (userName) => 
    `${API_CONFIG.BASE_URL}/api/payments?filters[user_name][$eq]=${encodeURIComponent(userName)}&sort=payment_date:desc`,
};

export default API_CONFIG;

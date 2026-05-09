const axios = require('axios');

const adminUrl = 'http://localhost:5000/api/v1/x-secure/admin-access/authenticate';
const adminKey = 'agriculnet-admin-secret-2025';

async function testAdminLogin() {
  try {
    const response = await axios.post(adminUrl, {
      identifier: 'mbengespoir@gmail.com',
      password: 'Admin@AgriculNet2025!'
    }, {
      headers: {
        'x-admin-key': adminKey
      }
    });

    console.log('Login successful:', response.data);
  } catch (error) {
    console.error('Login failed:', error.response?.status, error.response?.data);
  }
}

testAdminLogin();

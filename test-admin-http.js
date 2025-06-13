// Test script to check if the admin API works with actual HTTP requests
const fetch = require('node-fetch');

async function testAdminAPIHTTP() {
  try {
    console.log('Testing admin API via HTTP...');
    
    // Try to call the admin API endpoint
    const response = await fetch('http://localhost:3001/api/admin/chats');
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    if (response.status === 401) {
      console.log('Expected 401 - API requires authentication');
      const data = await response.json();
      console.log('Response body:', data);
    } else {
      const data = await response.json();
      console.log('Response body:', data);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAdminAPIHTTP();

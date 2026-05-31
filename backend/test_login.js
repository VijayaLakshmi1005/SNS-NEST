import axios from 'axios';

const runTest = async () => {
  const email = `test${Date.now()}@example.com`;
  const password = 'Password123';

  try {
    console.log('Registering...');
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      fullName: 'Test User',
      email,
      password,
      mobile: '9999999999',
      location: 'Test City',
      role: 'client'
    });
    console.log('Register Response:', regRes.data);

    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    console.log('Login Response:', loginRes.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

runTest();

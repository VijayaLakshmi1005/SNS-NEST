import axios from 'axios';

const runTest = async () => {
  const email = `frontend_test_${Date.now()}@example.com`;
  
  try {
    console.log('Testing exact payload sent by Register.jsx:');
    const payload = { 
      fullName: 'John Doe', 
      email, 
      mobile: '9876543210', 
      password: 'Password123!', 
      location: 'New York', 
      role: 'client' 
    };
    
    const regRes = await axios.post('http://localhost:5000/api/auth/register', payload);
    console.log('Registration Success:', regRes.status, regRes.data);
    
    console.log('Attempting Login:');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password: 'Password123!'
    });
    console.log('Login Success:', loginRes.status, loginRes.data);
    
  } catch (err) {
    console.error('ERROR RESPONSE:');
    console.error(err.response?.status, err.response?.data);
  }
};

runTest();

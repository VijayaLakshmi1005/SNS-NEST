import axios from 'axios';

async function test() {
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'vj@123.com',
    password: 'vj1234'
  });
  console.log("Login response data:", JSON.stringify(loginRes.data, null, 2));
}

test().catch(console.error);

import axios from 'axios';

async function testApi() {
  console.log("--- Testing Backend Estimator API Endpoints ---");
  
  // 1. Log in to get JWT Token
  console.log("Logging in as vj@123.com...");
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'vj@123.com',
    password: 'vj1234'
  });
  
  const token = loginRes.data.data.accessToken;
  console.log("Login successful! Token acquired.");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // 2. Test GET /api/estimator/packages
  console.log("Testing GET /api/estimator/packages...");
  const pkgsRes = await axios.get('http://localhost:5000/api/estimator/packages', authHeaders);
  console.log("Packages fetched successfully. Count:", pkgsRes.data.data.length);

  // 3. Test GET /api/estimator/materials
  console.log("Testing GET /api/estimator/materials...");
  const matsRes = await axios.get('http://localhost:5000/api/estimator/materials', authHeaders);
  console.log("Materials fetched successfully. Count:", matsRes.data.data.length);

  // 4. Test POST /api/estimator/calculate
  console.log("Testing POST /api/estimator/calculate...");
  const calcRes = await axios.post('http://localhost:5000/api/estimator/calculate', {
    propertyType: 'Apartment',
    bhkType: '2 BHK',
    squareFeet: 1200,
    city: 'Bangalore',
    rooms: ['Living Room', 'Bedroom', 'Modular Kitchen'],
    packageType: 'Premium',
    materialQuality: 'Standard',
    emiDetails: {
      downPayment: 150000,
      tenureMonths: 12,
      interestRate: 10.5
    }
  }, authHeaders);
  console.log("Calculation completed successfully! Grand Total:", calcRes.data.data.totalAmount);

  // 5. Test POST /api/estimator/calculate with saveEstimate: true
  console.log("Testing POST /api/estimator/calculate with saveEstimate: true...");
  const saveRes = await axios.post('http://localhost:5000/api/estimator/calculate', {
    propertyType: 'Apartment',
    bhkType: '2 BHK',
    squareFeet: 1200,
    city: 'Bangalore',
    rooms: ['Living Room', 'Bedroom', 'Modular Kitchen'],
    packageType: 'Premium',
    materialQuality: 'Standard',
    saveEstimate: true,
    emiDetails: {
      downPayment: 150000,
      tenureMonths: 12,
      interestRate: 10.5
    }
  }, authHeaders);
  const savedId = saveRes.data.data._id;
  console.log("Estimate saved successfully! ID:", savedId);

  // 6. Test GET /api/estimator/history
  console.log("Testing GET /api/estimator/history...");
  const histRes = await axios.get('http://localhost:5000/api/estimator/history', authHeaders);
  console.log("History retrieved successfully. Count:", histRes.data.data.length);

  // 7. Test POST /api/estimator/download-pdf
  console.log("Testing POST /api/estimator/download-pdf for saved ID...");
  const pdfRes = await axios.post('http://localhost:5000/api/estimator/download-pdf', {
    estimateId: savedId
  }, {
    ...authHeaders,
    responseType: 'arraybuffer'
  });
  console.log("PDF downloaded successfully! Size in bytes:", pdfRes.data.byteLength);

  console.log("--- All API Integration tests passed successfully! ---");
}

testApi().catch((err) => {
  console.error("API test crashed!");
  if (err.response) {
    console.error("Status:", err.response.status);
    console.error("Data:", err.response.data);
  } else {
    console.error(err.message);
  }
});

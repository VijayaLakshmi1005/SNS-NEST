import axios from 'axios';

async function testTracking() {
  console.log("--- Testing Project Tracking Endpoints ---");
  
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

  // 2. Test GET /api/projects/current
  console.log("Testing GET /api/projects/current...");
  const currentRes = await axios.get('http://localhost:5000/api/projects/current', authHeaders);
  const data = currentRes.data.data;
  console.log("Current tracking dashboard loaded successfully!");
  console.log("Project Title:", data.project.title);
  console.log("Overall Progress:", data.overallProgress + "%");
  console.log("Milestones count:", data.milestones.length);
  console.log("Site updates count:", data.siteUpdates.length);
  console.log("Procurement count:", data.procurement.length);

  const projectId = data.project._id;

  // 3. Test GET /api/projects/:id/activities
  console.log(`Testing GET /api/projects/${projectId}/activities...`);
  const activitiesRes = await axios.get(`http://localhost:5000/api/projects/${projectId}/activities`, authHeaders);
  console.log("Activities fetched. Count:", activitiesRes.data.data.length);

  // 4. Test POST /api/projects/:id/activities
  console.log(`Testing POST /api/projects/${projectId}/activities...`);
  const newActivityRes = await axios.post(`http://localhost:5000/api/projects/${projectId}/activities`, {
    type: 'milestone',
    message: 'Furniture installation milestone initialized at local assembly site.'
  }, authHeaders);
  console.log("New activity created successfully! Message:", newActivityRes.data.data.message);

  // 5. Test POST /api/projects/:id/site-updates
  console.log(`Testing POST /api/projects/${projectId}/site-updates...`);
  const newSitePhotoRes = await axios.post(`http://localhost:5000/api/projects/${projectId}/site-updates`, {
    caption: 'Ambient dimmable spot lights cabling inspection completed by leads.',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800']
  }, authHeaders);
  console.log("New site photo progress update uploaded! Caption:", newSitePhotoRes.data.data.siteUpdate.caption);

  console.log("--- All Project Tracking API tests passed successfully! ---");
}

testTracking().catch((err) => {
  console.error("API test crashed!");
  if (err.response) {
    console.error("Status:", err.response.status);
    console.error("Data:", err.response.data);
  } else {
    console.error(err.message);
  }
});

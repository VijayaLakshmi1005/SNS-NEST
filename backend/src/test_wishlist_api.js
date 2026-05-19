import axios from 'axios';

async function testWishlist() {
  console.log("--- Testing Wishlist & Inspiration Vault Endpoints ---");
  
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

  // 2. Fetch Wishlist Items (triggers seeder)
  console.log("Testing GET /api/wishlist...");
  const listRes = await axios.get('http://localhost:5000/api/wishlist', authHeaders);
  const data = listRes.data.data;
  console.log("Wishlist items fetched successfully! Count:", data.length);

  // 3. Create Custom Collection
  console.log("Testing POST /api/wishlist/collections...");
  const colRes = await axios.post('http://localhost:5000/api/wishlist/collections', {
    title: 'Dream Villa Balcony ideas',
    description: 'Minimalistic plant arrangements and wood tiled floor patterns',
    coverImage: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800'
  }, authHeaders);
  const collection = colRes.data.data;
  console.log("Collection created successfully! Title:", collection.title);

  // 4. Save Custom / AI Design Inspiration
  console.log("Testing POST /api/wishlist/save...");
  const saveRes = await axios.post('http://localhost:5000/api/wishlist/save', {
    collectionId: collection._id,
    roomType: 'Bathroom',
    style: 'Scandinavian',
    images: ['https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800'],
    tags: ['terrazzo', 'brass fixtures', 'oak vanity'],
    notes: 'Incorporate circular backlight mirror design'
  }, authHeaders);
  const savedItem = saveRes.data.data;
  console.log("Custom inspiration saved! Notes:", savedItem.notes);

  // 5. Update Notes
  console.log(`Testing PATCH /api/wishlist/${savedItem._id}/notes...`);
  const noteRes = await axios.patch(`http://localhost:5000/api/wishlist/${savedItem._id}/notes`, {
    notes: 'Updated: Incorporate circular backlight mirror design + bronze detailing'
  }, authHeaders);
  console.log("Notes updated successfully! New Notes:", noteRes.data.data.notes);

  // 6. Delete Saved Design Item
  console.log(`Testing DELETE /api/wishlist/${savedItem._id}...`);
  await axios.delete(`http://localhost:5000/api/wishlist/${savedItem._id}`, authHeaders);
  console.log("Saved item removed successfully from Wishlist!");

  console.log("--- All Wishlist API Integration tests passed successfully! ---");
}

testWishlist().catch((err) => {
  console.error("API test crashed!");
  if (err.response) {
    console.error("Status:", err.response.status);
    console.error("Data:", err.response.data);
  } else {
    console.error(err.message);
  }
});

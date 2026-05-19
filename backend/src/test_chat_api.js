import axios from 'axios';

async function testChat() {
  console.log("--- Testing Chat & Messaging Endpoints ---");
  
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

  // 2. Test GET /api/chat/conversations
  console.log("Testing GET /api/chat/conversations...");
  const convRes = await axios.get('http://localhost:5000/api/chat/conversations', authHeaders);
  const data = convRes.data.data;
  console.log("Conversations fetched successfully! Count:", data.length);
  
  const activeConversationId = data[0]._id;
  console.log("Active Conversation ID:", activeConversationId);

  // 3. Test GET /api/chat/:conversationId/messages
  console.log(`Testing GET /api/chat/${activeConversationId}/messages...`);
  const messagesRes = await axios.get(`http://localhost:5000/api/chat/${activeConversationId}/messages`, authHeaders);
  console.log("Message history retrieved successfully. Count:", messagesRes.data.data.length);
  
  // 4. Test POST /api/chat/send
  console.log("Testing POST /api/chat/send...");
  const sendRes = await axios.post('http://localhost:5000/api/chat/send', {
    conversationId: activeConversationId,
    text: "Testing real-time collaboration message inside the modular chat suite!"
  }, authHeaders);
  const newMessage = sendRes.data.data;
  console.log("Message sent successfully! Text:", newMessage.text);

  // 5. Test PATCH /api/chat/message/:id/edit
  console.log(`Testing PATCH /api/chat/message/${newMessage._id}/edit...`);
  const editRes = await axios.patch(`http://localhost:5000/api/chat/message/${newMessage._id}/edit`, {
    text: "Edited: Testing real-time collaboration message!"
  }, authHeaders);
  console.log("Message edited successfully! New Text:", editRes.data.data.text);

  // 6. Test POST /api/chat/message/:id/react
  console.log(`Testing POST /api/chat/message/${newMessage._id}/react...`);
  const reactRes = await axios.post(`http://localhost:5000/api/chat/message/${newMessage._id}/react`, {
    emoji: '🔥'
  }, authHeaders);
  console.log("Reaction added successfully! Reaction emoji:", reactRes.data.data.reactions[0].emoji);

  // 7. Test DELETE /api/chat/message/:id/delete-for-everyone
  console.log(`Testing DELETE /api/chat/message/${newMessage._id}/delete-for-everyone...`);
  const delRes = await axios.delete(`http://localhost:5000/api/chat/message/${newMessage._id}/delete-for-everyone`, authHeaders);
  console.log("Message deleted for everyone! Final Text:", delRes.data.data.text);

  console.log("--- All Chat API Integration tests passed successfully! ---");
}

testChat().catch((err) => {
  console.error("API test crashed!");
  if (err.response) {
    console.error("Status:", err.response.status);
    console.error("Data:", err.response.data);
  } else {
    console.error(err.message);
  }
});

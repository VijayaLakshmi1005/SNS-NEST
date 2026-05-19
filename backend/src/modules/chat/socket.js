/**
 * Chat Socket Module Events Registry
 * These events map to the core configuration in backend/src/config/socket.js
 */
export const CHAT_SOCKET_EVENTS = {
  // Input Events
  SEND_MESSAGE: 'send-message',
  JOIN_ROOM: 'join:room',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  
  // Output Broadcast Events
  RECEIVE_MESSAGE: 'receive-message',
  MESSAGE_SEEN: 'message-seen',
  MESSAGE_EDIT: 'message-edit',
  MESSAGE_DELETE: 'message-delete',
  REACTION_ADDED: 'reaction-added',
  ONLINE_STATUS: 'online-status'
};

import { getIO } from '../../config/socket.js';

export const emitAnalyticsUpdate = () => {
  try {
    const io = getIO();
    if (io) {
      io.emit('analytics:update');
    }
  } catch (error) {
    console.error('Socket emit error for analytics:', error);
  }
};

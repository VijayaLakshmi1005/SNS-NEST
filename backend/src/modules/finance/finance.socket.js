import { getIO } from '../../config/socket.js';

export const emitFinanceUpdate = () => {
  try {
    const io = getIO();
    if (io) {
      io.emit('financeUpdated');
    }
  } catch (error) {
    console.error('Socket emit error:', error);
  }
};

export const emitPaymentSuccess = (paymentData) => {
  try {
    const io = getIO();
    if (io) {
      io.emit('payment:success', paymentData);
      io.emit('financeUpdated');
    }
  } catch (error) {
    console.error('Socket emit error:', error);
  }
};

export const emitActivityLog = (logData) => {
  try {
    const io = getIO();
    if (io) {
      io.emit('activity:new', logData);
    }
  } catch (error) {
    console.error('Socket emit error:', error);
  }
};

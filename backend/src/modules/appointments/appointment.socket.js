import { getIO } from '../../config/socket.js';

export class AppointmentSocketGateway {
  static emitEvent(eventName, payload) {
    try {
      const io = getIO();
      if (io) {
        io.emit(eventName, payload);
      }
    } catch (err) {
      console.warn(`[Socket Error] Failed to emit ${eventName}:`, err.message);
    }
  }

  static emitCreated(appointment) {
    this.emitEvent('appointmentCreated', appointment);
  }

  static emitUpdated(appointment) {
    this.emitEvent('appointmentUpdated', appointment);
  }

  static emitDeleted(appointmentId) {
    this.emitEvent('appointmentDeleted', { id: appointmentId });
  }

  static emitAvailabilityUpdated(designerId) {
    this.emitEvent('availabilityUpdated', { designerId });
  }
}

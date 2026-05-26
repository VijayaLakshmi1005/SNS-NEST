import { Appointment } from './appointment.model.js';

export class AvailabilityService {
  static async getBusyDates(designerId, startDate, endDate) {
    const query = {
      status: { $in: ['Confirmed', 'Pending Approval', 'Rescheduled'] }
    };

    if (designerId) query.designer = designerId;
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(query).select('date timeSlot status type');
    
    // Group by date to calculate load
    const loadByDate = {};
    appointments.forEach(appt => {
      if (!loadByDate[appt.date]) loadByDate[appt.date] = 0;
      loadByDate[appt.date] += 1;
    });

    const busyDates = Object.entries(loadByDate).map(([date, count]) => {
      let level = 'free';
      if (count > 0 && count <= 2) level = 'busy';
      if (count > 2) level = 'high-traffic';
      return { date, count, level };
    });

    return busyDates;
  }
}

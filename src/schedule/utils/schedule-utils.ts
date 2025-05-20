import { DeepPartial } from 'typeorm';
import { Schedule } from '../entities/schedule.entity';

// Verify duplicate schedules in the request
export const hasDuplicateSchedules = (
  schedules: DeepPartial<Schedule>[],
): boolean => {
  if (schedules.length <= 1) {
    return false;
  }

  const seenSchedules = new Set();
  for (const schedule of schedules) {
    const scheduleKey = `${schedule.checkIn}-${
      schedule.checkOut
    }-${JSON.stringify(schedule.days)}`;
    if (seenSchedules.has(scheduleKey)) {
      return true;
    }
    seenSchedules.add(scheduleKey);
  }
  return false;
};

// Verify duplicate schedules in the database
export const isDuplicateSchedule = (
  newSchedules: DeepPartial<Schedule>[],
  existingSchedules: Schedule[],
): boolean => {
  if (hasDuplicateSchedules(newSchedules)) {
    return true;
  }

  return newSchedules.some((newSchedule) =>
    existingSchedules.some(
      (existingSchedule) =>
        existingSchedule.checkIn === newSchedule.checkIn &&
        existingSchedule.checkOut === newSchedule.checkOut &&
        JSON.stringify(existingSchedule.days) ===
          JSON.stringify(newSchedule.days),
    ),
  );
};

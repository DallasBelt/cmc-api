import { DeepPartial } from 'typeorm';
import { Schedule } from '../entities/schedule.entity';

// Validate duplicate shifts in the body
export const hasDuplicateShifts = (
  shifts: DeepPartial<Schedule>[],
): boolean => {
  if (shifts.length <= 1) {
    return false;
  }

  const seenShifts = new Set();

  for (const shift of shifts) {
    const sortedDays = (shift.days || []).slice().sort();
    const scheduleKey = `${shift.checkIn}-${shift.checkOut}-${JSON.stringify(
      sortedDays,
    )}`;

    if (seenShifts.has(scheduleKey)) {
      return true;
    }
    seenShifts.add(scheduleKey);
  }
  return false;
};

// Validate duplicate shifts in the database
export const isDuplicateShift = (
  newSchedules: DeepPartial<Schedule>[],
  existingSchedules: Schedule[],
): boolean => {
  if (hasDuplicateShifts(newSchedules)) {
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

const parseTime = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Validate overlapping shifts
export const hasOverlappingShifts = (
  schedules: DeepPartial<Schedule>[],
): boolean => {
  for (let i = 0; i < schedules.length; i++) {
    const a = schedules[i];
    const aStart = parseTime(a.checkIn!);
    const aEnd = parseTime(a.checkOut!);

    for (let j = i + 1; j < schedules.length; j++) {
      const b = schedules[j];
      const bStart = parseTime(b.checkIn!);
      const bEnd = parseTime(b.checkOut!);

      // Verify for a common day
      const commonDays = a.days?.filter((day) => b.days?.includes(day));
      if (!commonDays || commonDays.length === 0) continue;

      // Verify overlap
      const overlaps = aStart < bEnd && bStart < aEnd;
      if (overlaps) return true;
    }
  }
  return false;
};

export const isOverlappingShift = (
  newShifts: DeepPartial<Schedule>[],
  existingShifts: Schedule[],
): boolean => {
  for (const newShift of newShifts) {
    const newStart = parseTime(newShift.checkIn!);
    const newEnd = parseTime(newShift.checkOut!);
    const newDays = newShift.days || [];

    for (const existing of existingShifts) {
      const existingStart = parseTime(existing.checkIn);
      const existingEnd = parseTime(existing.checkOut);
      const existingDays = existing.days || [];

      // Search for common days
      const sharedDays = newDays.filter((d) => existingDays.includes(d));
      if (sharedDays.length === 0) continue;

      // Shifts overlap?
      const overlap = newStart < existingEnd && existingStart < newEnd;
      if (overlap) return true;
    }
  }

  return false;
};

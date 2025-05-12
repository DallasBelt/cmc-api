import { CreateScheduleDto } from '../dto/create-schedule.dto';

type PartialScheduleWithId = {
  id: string;
  checkIn?: string;
  checkOut?: string;
  days?: string[];
};

export function isDuplicateSchedule(
  scheduleToEdit: PartialScheduleWithId,
  existingSchedules: PartialScheduleWithId[],
  scheduleId: string,
): boolean {
  if (
    !scheduleToEdit.checkIn ||
    !scheduleToEdit.checkOut ||
    !scheduleToEdit.days
  ) {
    return false; // Can't compare if data is missing
  }

  return existingSchedules.some((s) => {
    if (s.id === scheduleId) return false;

    return (
      s.checkIn === scheduleToEdit.checkIn &&
      s.checkOut === scheduleToEdit.checkOut &&
      Array.isArray(s.days) &&
      s.days.length === scheduleToEdit.days.length &&
      s.days.every((day) => scheduleToEdit.days!.includes(day))
    );
  });
}

export function isOverlappingSchedule(
  scheduleToEdit: PartialScheduleWithId,
  existingSchedules: PartialScheduleWithId[],
  scheduleId: string,
): boolean {
  if (
    !scheduleToEdit.checkIn ||
    !scheduleToEdit.checkOut ||
    !scheduleToEdit.days
  ) {
    return false; // No data to validate overlapping
  }

  return existingSchedules.some((s) => {
    if (s.id === scheduleId || !s.checkIn || !s.checkOut || !s.days)
      return false;

    const sharesDay = scheduleToEdit.days!.some((day) => s.days!.includes(day));
    const timeOverlap =
      scheduleToEdit.checkIn! < s.checkOut &&
      s.checkIn < scheduleToEdit.checkOut!;

    return sharesDay && timeOverlap;
  });
}

export function hasOverlappingSchedules(
  schedules: CreateScheduleDto[],
): boolean {
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const a = schedules[i];
      const b = schedules[j];

      const sameDay = a.days.some((day) => b.days.includes(day));
      const timeOverlap = a.checkIn < b.checkOut && b.checkIn < a.checkOut;

      if (sameDay && timeOverlap) {
        return true;
      }
    }
  }
  return false;
}

export function hasDuplicateSchedules(schedules: CreateScheduleDto[]): boolean {
  const seen = new Set();

  for (const schedule of schedules) {
    // Create a unique signature based on checkIn, checkout and ordered days
    const signature = `${schedule.checkIn}|${schedule.checkOut}|${schedule.days
      .sort()
      .join(',')}`;

    if (seen.has(signature)) {
      return true;
    }
    seen.add(signature);
  }

  return false;
}

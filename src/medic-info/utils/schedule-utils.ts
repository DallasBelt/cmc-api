import { CreateMedicScheduleDto } from '../dto/create-medic-schedule.dto';

export function hasOverlappingSchedules(
  schedules: CreateMedicScheduleDto[],
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

export function hasDuplicateSchedules(
  schedules: CreateMedicScheduleDto[],
): boolean {
  const seen = new Set();

  for (const schedule of schedules) {
    // Creamos una "firma" única basada en checkIn, checkOut y días ordenados
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

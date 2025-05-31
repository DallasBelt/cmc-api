import { ShiftDto } from '../dto/shift.dto';

export const hasDuplicateShifts = (shifts: any[]): boolean => {
  const seen = new Set();

  for (const shift of shifts) {
    const days = [...(shift.days || [])].sort();
    const key = `${shift.checkIn}|${shift.checkOut}|${days.join(',')}`;
    if (seen.has(key)) return true;
    seen.add(key);
  }

  return false;
};

const parseTime = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const hasOverlappingShifts = (shifts: any[]): boolean => {
  for (let i = 0; i < shifts.length; i++) {
    const a = shifts[i];
    const aStart = parseTime(a.checkIn);
    const aEnd = parseTime(a.checkOut);

    for (let j = i + 1; j < shifts.length; j++) {
      const b = shifts[j];
      const bStart = parseTime(b.checkIn);
      const bEnd = parseTime(b.checkOut);

      const commonDays = a.days?.filter((day: string) => b.days?.includes(day));

      if (commonDays?.length && aStart < bEnd && bStart < aEnd) {
        return true;
      }
    }
  }

  return false;
};

export const areShiftsEqual = (a: ShiftDto[], b: ShiftDto[]): boolean => {
  if (a.length !== b.length) return false;

  const normalize = (shift: ShiftDto) =>
    JSON.stringify({
      checkIn: shift.checkIn,
      checkOut: shift.checkOut,
      days: [...shift.days].sort(),
    });

  const normalizedA = a.map(normalize).sort();
  const normalizedB = b.map(normalize).sort();

  return JSON.stringify(normalizedA) === JSON.stringify(normalizedB);
};

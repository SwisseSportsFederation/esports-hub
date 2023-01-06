export const getAgeFromBirthdate = (birthDate: Date | undefined): number | undefined => {
  if (!birthDate) {
    return undefined;
  }

  const diff_ms = Date.now() - birthDate.getTime();
  const age_dt = new Date(diff_ms);

  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

export const dateToFormattedString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const isToday = (day: Date): boolean => {
  const today = new Date();

  return today.toDateString() === day.toDateString();
};

export const dateInRange = (date: Date, min?: Date, max?: Date): boolean => {
  return !((max && date > max) || (min && date < min)) ?? true;
};

export const getAgeFromBirthdate = (birthDate: Date | undefined): number | undefined => {
  if(!birthDate) {
    return undefined;
  }

  const diff_ms = Date.now() - birthDate.getTime();
  const age_dt = new Date(diff_ms);

  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

export const dateToFormattedString = (date: Date | null): string => {
  if(!date) {
    return '';
  }
  let day = String(date.getDate());
  const month = date.getMonth();
  let monthString = String(month + 1);

  if(day.length == 1) {
    day = `0${day}`;
  }

  if(monthString.length == 1) {
    monthString = `0${monthString}`;
  }
  return `${day}.${monthString}.${date.getFullYear()}`;
};

export const toISODateString = (date: Date | null): string => { 
  if(!date) {
    return '';
  }
  try {
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - (offset * 60 * 1000));
    return date.toISOString().split('T')[0];
  } catch {
    console.log('Date format wrong with date:', date);
    return '';
  }
}

export const isToday = (day: Date): boolean => {
  const today = new Date();

  return today.toDateString() === day.toDateString();
};

export const dateInRange = (date: Date, min?: Date, max?: Date): boolean => {
  return !((max && date > max) || (min && date < min));
};

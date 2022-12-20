export interface IMonth {
  name: string;
  shortName: string;
  monthNumber: number;
}

export const months: IMonth[] = [
  {
    name: "January",
    shortName: "Jan",
    monthNumber: 1
  },
  {
    name: "February",
    shortName: "Feb",
    monthNumber: 2
  },
  {
    name: "March",
    shortName: "Mar",
    monthNumber: 3
  },
  {
    name: "April",
    shortName: "Apr",
    monthNumber: 4
  },
  {
    name: "May",
    shortName: "May",
    monthNumber: 5
  },
  {
    name: "June",
    shortName: "Jun",
    monthNumber: 6
  },
  {
    name: "July",
    shortName: "Jul",
    monthNumber: 7
  },
  {
    name: "August",
    shortName: "Ago",
    monthNumber: 8
  },
  {
    name: "September",
    shortName: "Sep",
    monthNumber: 9
  },
  {
    name: "October",
    shortName: "Oct",
    monthNumber: 10
  },
  {
    name: "November",
    shortName: "Nov",
    monthNumber: 11
  },
  {
    name: "December",
    shortName: "Dec",
    monthNumber: 12
  }
];

export interface calendarDay {
  name: string;
  shortName: string;
  weekday: number;
}

export const calendarDays: calendarDay[] = [
  {
    name: "Monday",
    shortName: "Mon",
    weekday: 0
  },
  {
    name: "Tuesday",
    shortName: "Tue",
    weekday: 1
  },
  {
    name: "Wednesday",
    shortName: "Wed",
    weekday: 2
  },
  {
    name: "Thursday",
    shortName: "Thu",
    weekday: 3
  },
  {
    name: "Friday",
    shortName: "Fri",
    weekday: 4
  },
  {
    name: "Saturday",
    shortName: "Sat",
    weekday: 5
  },
  {
    name: "Sunday",
    shortName: "Sun",
    weekday: 6
  },
];

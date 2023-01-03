import { Reducer } from "react";
import { calendarDays } from "../components/Forms/DateInput";

export interface IDatePickerReducerState {
  isOpen: boolean;
  date: Date;
  month: number;
  year: number;
  daysInMonthArr: number[];
  blankDaysArr: number[];
}

export type DatePickerReducerAction =
  | { type: "UPDATE_STATE"; date: Date }
  | { type: "SET_OPEN"; isOpen: boolean }
  | { type: "SET_MONTH_DAY"; dayNumber: number }
  | { type: "ADD_MONTH" }
  | { type: "SUBTRACT_MONTH" };

export const DatePickerReducer: Reducer<
  IDatePickerReducerState,
  DatePickerReducerAction
  > = (state: IDatePickerReducerState, action: DatePickerReducerAction) => {
  switch (action.type) {
    case "UPDATE_STATE": {
      const date = action.date;
      const month = date.getMonth();
      const year = date.getFullYear();

      const blankDaysArr = getBlankWeekdays(year, month);
      const daysInMonthArr = getDaysInMonth(year, month + 1);

      return {
        ...state,
        date,
        month,
        year,
        daysInMonthArr,
        blankDaysArr
      };
    }

    case "SET_OPEN": {
      return {
        ...state,
        isOpen: action.isOpen
      };
    }

    case "SET_MONTH_DAY": {
      const date = new Date(state.year, state.month, action.dayNumber + 1);

      return {
        ...state,
        date,
        isOpen: false
      };
    }

    case "ADD_MONTH": {
      let newYear: number;
      let newMonth: number;
      if (state.month === 11) {
        newMonth = 0;
        newYear = state.year + 1;
      } else {
        newMonth = state.month + 1;
        newYear = state.year;
      }

      const blankDaysArr = getBlankWeekdays(newYear, newMonth);
      const daysInMonthArr = getDaysInMonth(newYear, newMonth + 1);

      return {
        ...state,
        month: newMonth,
        year: newYear,
        daysInMonthArr,
        blankDaysArr
      };
    }

    case "SUBTRACT_MONTH": {
      let newYear: number;
      let newMonth: number;
      if (state.month === 0) {
        newMonth = 11;
        newYear = state.year - 1;
      } else {
        newMonth = state.month - 1;
        newYear = state.year;
      }

      const blankDaysArr = getBlankWeekdays(newYear, newMonth);
      const daysInMonthArr = getDaysInMonth(newYear, newMonth + 1);

      return {
        ...state,
        year: newYear,
        month: newMonth,
        daysInMonthArr,
        blankDaysArr
      };
    }

    default: {
      return {
        ...state
      };
    }
  }
};

const getBlankWeekdays = (year: number, month: number): Array<number> => {
  const monthFirstWeekdayNumber = new Date(year, month, 0).getDay();
  const weekdayNumber = calendarDays[monthFirstWeekdayNumber].weekday;

  const blankDaysArr = [];
  for (let i = 1; i <= weekdayNumber; i++) {
    blankDaysArr.push(i);
  }

  return blankDaysArr;
};

const getDaysInMonth = (year: number, month: number): Array<number> => {
  const daysInMonth = new Date(year, month, 0).getDate();

  const daysInMonthArr = [];
  for (let i = 1; i <= daysInMonth; i++) {
    daysInMonthArr.push(i);
  }

  return daysInMonthArr;
};

export default DatePickerReducer;

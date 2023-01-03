import { ChangeEvent, createRef, Reducer, useEffect, useReducer, useState } from "react";
import classNames from "classnames";
import DatePickerReducer, { DatePickerReducerAction, IDatePickerReducerState } from "../../reducers/DatePickerReducer";
import { dateInRange, isToday } from "../../utils/dateHelper";
import IconButton from "../Button/IconButton";
import Icons from "../Icons";

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

interface IDateInputProps {
  label: string;
  value: string;
  min?: Date;
  max?: Date;
  required?: boolean;
}

const initPickerState: IDatePickerReducerState = {
  isOpen: false,
  date: new Date(),
  month: 0,
  year: 0,
  daysInMonthArr: [],
  blankDaysArr: []
};

const DateInput = ({ label, value, min, max, required = false }: IDateInputProps) => {
  const [state, dispatch] = useReducer<
    Reducer<IDatePickerReducerState, DatePickerReducerAction>
    >(DatePickerReducer, initPickerState);
  const displayDateRef = createRef<HTMLInputElement>();
  const daysDivRef = createRef<HTMLDivElement>();
  const [check, setCheck] = useState(false);
  const [inRange, setInRange] = useState(true);

  const updateState = (date: Date) => dispatch({ type: "UPDATE_STATE", date: date });
  const addMonth = () => dispatch({ type: "ADD_MONTH" });
  const subtractMonth = () => dispatch({ type: "SUBTRACT_MONTH" });
  const setMonthDay = (dayNumber: number) => {
    dispatch({ type: "SET_MONTH_DAY", dayNumber });
    toggleDisplayDateFocus();
  };
  const handleOpen = (isOpen: boolean) => {
    if(isOpen) {
      setCheck(false);
    } else {
      setCheck(value.length > 0);
    }
    dispatch({ type: "SET_OPEN", isOpen: isOpen });
    toggleDisplayDateFocus();
  };

  useEffect(() => {
    updateState(new Date(value));
  }, []);

  const isInRange = (date: Date) => {
    return dateInRange(date, min, max);
  };

  const isSelected = (dayNumber: number) => {
    const day = new Date(state.year, state.month, dayNumber);

    return new Date(value).toDateString() === day.toDateString();
  };

  const handleDatePickerKeydown = (event: React.KeyboardEvent) => {
    if (event.code === "0") {
      handleOpen(false);
    }
  };

  const toggleDisplayDateFocus = (): void => {
    /**
     * This functions triggers when the user clicks:
     * 1. The input element
     * 2. The input element goes out of focus
     * 3. A day in the calendar
     *
     * When the calendar input contains shadow-outline class it means it's focus,
     * so we remove that class and trigger blur programmatically.
     * On the other hand if the input doesn't have the class, it means it's not focused,
     * so we trigger the focus and add the class.
     */
    const displayDate = displayDateRef.current;
    if (displayDate?.classList.contains("shadow-outline")) {
      displayDate.classList.remove("shadow-outline");
      displayDate.blur();
    } else {
      displayDate?.classList.add("shadow-outline");
      displayDate?.focus();
    }

    const daysDiv = daysDivRef.current;
    daysDiv?.focus();
  };

  const clearDate = () => {
    updateState(new Date())
  };

  const onValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setInRange(isInRange(date));
    if(!isNaN(date.getTime()) && isInRange(date)) {
      updateState(date);
    }
  };

  const inputInvalid = classNames({
    'invalid': !inRange
  });

  const labelInvalid = classNames({
    'is-dirty': check
  });

  const popupClasses = classNames({
    "visible opacity-100": state.isOpen,
    "invisible opacity-0": !state.isOpen
  });

  return (
      <div className="w-full max-w-sm lg:max-w-full">
        <div className="relative mt-3">
          <label>
            <input type="date"
                   value={value}
                   ref={displayDateRef}
                   required={required}
                   onClick={(e: React.MouseEvent) => {
                     e.preventDefault();
                     handleOpen(!state.isOpen);
                   }}
                   onKeyDown={(event: React.KeyboardEvent) => handleDatePickerKeydown(event)}
                   onBlur={() => handleOpen(false)}
                   onChange={onValueChange}
                   className={`w-full pl-4 pr-10 py-3 appearance-none leading-none rounded-xl text-black
                      font-medium bg-white outline-none focus:outline-none focus:shadow-outline border border-gray-6 dark:border-white ${inputInvalid}`}
                   placeholder="Select date"
            />
            <span
              className={`absolute top-2 left-4 opacity-0 transition-all text-black dark:text-white ${labelInvalid}`}>
              {label}
            </span>
          </label>
          {!required && <IconButton icon="remove" size="small" type="button" action={clearDate}
                       className="absolute top-1/2 transform -translate-y-1/2 right-10 bg-red-500 p-1"/>}
          <div className="absolute top-1/2 transform -translate-y-1/2 right-3 text-black"
               onClick={() => handleOpen(!state.isOpen)}>
              <Icons iconName='date' className={`h-6 w-6`}/>
          </div>

          <div
            className={`focus:outline-none duration-200 mt-12 bg-white rounded-lg shadow p-4 absolute top-0 left-0 w-[17rem] z-[100] ${popupClasses}`}
            ref={daysDivRef}
            tabIndex={-1}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-lg font-bold text-gray-800">
                  {months[state.month].name}
                </span>
                <span className="ml-1 text-lg text-gray-600 font-normal">
                  {state.year}
                </span>
              </div>
              <div>
                <button
                  type="button"
                  className={`transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 rounded-full focus:shadow-outline focus:outline-none mr-1`}
                  onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
                  onClick={subtractMonth}
                >
                  <Icons iconName='arrowDown' className={`h-6 w-6 text-gray-500 inline-flex transform rotate-90`}/>
                </button>
                <button
                  type="button"
                  onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
                  className={`transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 rounded-full focus:shadow-outline focus:outline-none`}
                  onClick={addMonth}
                >
                  <Icons iconName='arrowDown' className={`h-6 w-6 text-gray-500 inline-flex transform -rotate-90`}/>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap mb-3 -mx-1">
              {calendarDays.map((day: calendarDay, index: number) => (
                <div
                  key={index}
                  className="px-1 w-[14.26%]"
                >
                  <div className="text-gray-800 font-medium text-center text-xs">
                    {day.shortName}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap -mx-1">
              {state.blankDaysArr.map((day: number) => (
                <div
                  key={day}
                  className="text-center border p-1 border-transparent text-sm w-[14.28%]"
                />
              ))}
              {state.daysInMonthArr.map((dayNumber: number, index: number) => {
                const calendarItemClasses = classNames({
                  "bg-gray-200 text-black": isToday(new Date(state.year, state.month, dayNumber)) && !isSelected(dayNumber),
                  "text-gray-700 hover:bg-red-200": !isToday(new Date(state.year, state.month, dayNumber)) && !isSelected(dayNumber),
                  "bg-red-1 text-white": isSelected(dayNumber)
                });
                return (
                <div
                  key={index}
                  className="px-1 mb-1 w-[14.28%]"
                >
                  <div
                    onClick={() => setMonthDay(dayNumber)}
                    onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
                    className={`cursor-pointer text-center text-sm leading-none rounded-full leading-loose transition ease-in-out duration-100
                     ${calendarItemClasses}`}
                  >
                    {dayNumber}
                  </div>
                </div>
              );})}
            </div>
          </div>
        </div>
      </div>
  );
};

export default DateInput;

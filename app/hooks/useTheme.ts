import { useState, useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

export default function useTheme() {
  const [theme, setTheme] = useLocalStorage("theme", "");
  
  useEffect(() => {
    setStoredValue(theme);
  }, [theme])

  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    try {
      if(theme === "") {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        return theme;
      }
    } catch (error) {
      console.log(error);
      return "";
    }
  });
  const setValue = (value: any) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      setTheme(valueToStore)
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };
  return [storedValue, setValue];
}

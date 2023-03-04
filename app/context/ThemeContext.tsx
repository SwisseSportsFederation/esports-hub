import { createContext, useReducer } from 'react';
import useLocalStorage from '~/hooks/useLocalStorage';

export const ThemeContext = createContext("light");
export const ThemeDispatchContext: any = createContext(null);

export function ThemeProvider({children}: any) {
	const [localTheme, setTheme] = useLocalStorage("theme", "");
	const [theme, dispatch] = useReducer(themeReducer, initialTheme(localTheme));

	return (
		<ThemeContext.Provider value={theme}>
			<ThemeDispatchContext.Provider value={dispatch}>
				<div className={"" + theme}>
					{children}
				</div>
			</ThemeDispatchContext.Provider>
		</ThemeContext.Provider>
	);
}

function themeReducer(theme: string, action: any) {
	window.localStorage.setItem('theme', JSON.stringify(action.value));
	return action.value;
}

const initialTheme = (localStorage: string) => {
	if (typeof window === "undefined") {
	  return "";
	}
	try {
	  if(localStorage === "") {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	  } else {
		return localStorage;
	  }
	} catch (error) {
	  console.log(error);
	  return "";
	}
  }

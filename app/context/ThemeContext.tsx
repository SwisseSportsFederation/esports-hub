import { createContext, useReducer } from 'react';
import useLocalStorage from '~/hooks/useLocalStorage';

export const ThemeContext = createContext("light");
export const ThemeDispatchContext: any = createContext(null);

export function ThemeProvider({children}: any) {
	const [localTheme, setTheme] = useLocalStorage("theme", "");
	const [theme, dispatch] = useReducer(themeReducer, () => {
		if (typeof window === "undefined") {
		  return "";
		}
		try {
			// TODO fixme
		  if(localTheme === "") {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		  } else {
			return localTheme;
		  }
		} catch (error) {
		  console.log(error);
		  return "";
		}
	  });

	return (
		<ThemeContext.Provider value={theme}>
			<ThemeDispatchContext.Provider value={dispatch}>
				{children}
			</ThemeDispatchContext.Provider>
		</ThemeContext.Provider>
	);
}

function themeReducer(theme: string, action: any) {
	window.localStorage.setItem('theme', JSON.stringify(action.value));
	return action.value;
}

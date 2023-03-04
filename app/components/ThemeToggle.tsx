import Icon from "./Icons";
import { useContext } from "react";
import { ThemeContext, ThemeDispatchContext } from "~/context/ThemeContext";

export default function() {
  const theme: string = useContext(ThemeContext);
  const dispatch: Function = useContext(ThemeDispatchContext);
  const isDark = theme === 'dark';

  return <label className="flex items-center cursor-pointer">
    <div className="relative">
      <input data-testid="theme-toggle" type="checkbox" className="hidden" defaultChecked={isDark} onChange={() => {
        dispatch({value: isDark ? 'light' : 'dark'});
      }}/>
      <div className="toggle__line w-10 h-4 bg-gray-400 rounded-full shadow-inner"/>
      <div className="toggle__dot absolute w-6 h-6 duration-[0.3s] ease-in-out  top-[-.25rem] left-[-.25rem]
                      rounded-full shadow inset-y-0 flex justify-center items-center
                      bg-black dark:bg-white dark:transform dark:translate-x-[100%]">
                        <Icon iconName={`${isDark ? 'moon' : 'sun'}`} className='text-white dark:text-black p-0 m-0 absolute h-[50%] w-[60%]'/>
      </div>
    </div>
  </label>;
};

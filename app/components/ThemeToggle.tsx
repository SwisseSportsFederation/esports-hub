import Icon from "./Icons";
import { Theme, Themed, useTheme } from "~/context/theme-provider";

export default function() {
  const [theme, setTheme] = useTheme();
  const isDark = theme === Theme.DARK;
  return <label className="flex items-center cursor-pointer">
    <div className="relative">
      <input data-testid="theme-toggle" type="checkbox" className="hidden" defaultChecked={isDark} onChange={() => {
        setTheme(isDark ? Theme.LIGHT : Theme.DARK);
      }}/>
      <div className="w-10 h-4 bg-gray-400 rounded-full shadow-inner"/>
      <div className="absolute w-6 h-6 duration-[0.3s] ease-in-out  top-[-.25rem] left-[-.25rem]
                      rounded-full shadow inset-y-0 flex justify-center items-center
                      dark:bg-black bg-white dark:transform dark:translate-x-[100%]">
        <Themed
          dark={<Icon iconName='moon' className='dark:text-white text-black p-0 m-0 absolute h-[50%] w-[60%]'/>}
          light={<Icon iconName='sun' className='dark:text-white text-black p-0 m-0 absolute h-[50%] w-[60%]'/>}
        />

      </div>
    </div>
  </label>;
};

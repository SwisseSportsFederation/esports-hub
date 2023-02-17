import Icon from "./Icons";
import useTheme from "~/hooks/useTheme";

export default function() {
  const [theme, setTheme] = useTheme();

  const isDark = theme === 'dark';
  return <label className="flex items-center cursor-pointer">
    <div className="relative">
      <input data-testid="theme-toggle" type="checkbox" className="hidden" defaultChecked={isDark} onChange={() => {
        setTheme(isDark ? 'light' : 'dark');
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

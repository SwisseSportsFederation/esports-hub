import classNames from "classnames";
import { useEffect, useState } from "react";

const Toast = ({ text }: { text: string }) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsShown(true);
    }, 100);
    setTimeout(() => {
      setIsShown(false);
    }, 5000);
  }, []);

  const shownClasses = classNames({
    'lg:-translate-y-20 -translate-y-24': isShown,
    'opacity-100': isShown,
    'opacity-0': !isShown
  });

  return <div className="z-50 fixed bottom-0 left-0 flex justify-center w-full" role="alert">
    <div
      className={`transition-all duration-300 ease-in-out transform fixed rounded-xl px-4 py-3 bg-red-1 text-white ${shownClasses}`}>
      {text}
    </div>
  </div>;
};

export default Toast;

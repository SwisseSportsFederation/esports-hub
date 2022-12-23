import type { PropsWithChildren } from "react";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";


const H2 = ({ children, className }: PropsWithChildren<PropsWithClassName<Record<never, never>>>) => {
  return <h2 className={`font-bold text-lg mb-5 ${className}`}>
    {children}
  </h2>;
};

export default H2;

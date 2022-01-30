import { PropsWithClassName } from "~/utils/PropsWithClassName";

interface IIconProps {
  path: string,
  selector?: string
}

const Icon = ({ path, selector = 'img', className = '' }: PropsWithClassName<IIconProps>) => {
  return <svg className={className} preserveAspectRatio="xMaxYMax meet">
    <use href={`${path}#${selector}`} className="w-full h-full"/>
  </svg>;
};

export default Icon;

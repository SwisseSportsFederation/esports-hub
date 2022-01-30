import Link from "next/link";

interface ILinkButton {
  path: string,
  title: string
}

const LinkButton = ({ path, title }: ILinkButton) => {
  return <Link href={path}>
    <a
      className='w-full max-w-xxs flex items-center justify-center rounded-full bg-red-1 text-white py-2 whitespace-nowrap'>
      {title}
    </a>
  </Link>;
};

export default LinkButton;

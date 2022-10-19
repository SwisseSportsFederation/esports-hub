import { Form } from "@remix-run/react";

interface ILinkButton {
  path: string,
  title: string
}

const PostFormButton = ({ path, title }: ILinkButton) => {
  return <Form action={path} method="post" className='w-full'>
    <button className="w-full flex items-center justify-center rounded-full bg-red-1 text-white py-2
    whitespace-nowrap" type="submit">
      {title}
    </button>
  </Form>;
};

export default PostFormButton;

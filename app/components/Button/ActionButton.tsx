import { PropsWithClassName } from "~/utils/PropsWithClassName";

type IActionButtonProps = {
  content: string,
} & ({
  action: (() => void),
  type?: never
} | {
  action?: never,
  type: 'button' | 'submit'
})

const ActionButton = (props: PropsWithClassName<IActionButtonProps>) => {
  const { action, content, type = 'button', className = '' } = props;
  return <button
    onClick={action} type={type}
    className={`w-full max-w-xxs flex items-center justify-center rounded-full
        bg-red-1 text-white py-2 ${className}`}>
    {content}
  </button>;
};

export default ActionButton;

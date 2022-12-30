import type { PropsWithClassName } from "~/utils/PropsWithClassName";

type IActionButtonProps = {
  content: string,
  disabled?: boolean
} & ({
  action: (() => void),
  type?: never
} | {
  action?: never,
  type: 'button' | 'submit'
})

const ActionButton = (props: PropsWithClassName<IActionButtonProps>) => {
  const { action, content, type = 'button', className = '', disabled = false } = props;
  return <button disabled={disabled}
    onClick={action} type={type}
    className={`w-full max-w-xxs flex items-center justify-center rounded-full
        bg-red-1 text-white py-2 disabled:bg-gray-400 ${className}`}>
    {content}
  </button>;
};

export default ActionButton;

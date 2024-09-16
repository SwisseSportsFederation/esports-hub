import type { PropsWithClassName } from "~/utils/PropsWithClassName";

type IActionButtonProps = {
  content: string,
  disabled?: boolean,
  buttonTextColor?: string
} & ({
  action: (() => void),
  type?: never,
  name?: never,
  value?: never
} | {
  action?: never,
  type: 'button',
  name?: never,
  value?: never

} | {
  action?: never,
  type: 'submit',
  name?: string,
  value?: string
});

const ActionButton = (props: PropsWithClassName<IActionButtonProps>) => {
  const { action, content, type = 'button', className = '', buttonTextColor = 'text-white', disabled = false, name = '', value = '' } = props;
  return <button disabled={disabled}
    onClick={action} type={type} name={name} value={value}
    className={`w-full max-w-xs flex items-center justify-center rounded-xl
        bg-red-1 py-2 disabled:bg-gray-400 hover:bg-red-600 transition-colors ${className} ${buttonTextColor}`}>
    {content}
  </button>;
};

export default ActionButton;

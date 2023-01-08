import ActionButton from "~/components/Button/ActionButton";

type ModalButton = {
  text: string,
  onClick?: () => void
}

type AskModalBodyPropTypes = {
  message: string,
  primaryButton: ModalButton,
  secondaryButton?: ModalButton
}

export default function({ message, primaryButton, secondaryButton }: AskModalBodyPropTypes) {
  return <>
    <div className="flex justify-center text-center text-2xl mb-8 text-white">
      {message}
    </div>
    <div className='flex justify-between gap-2'>
      <ActionButton content={primaryButton.text} action={() => primaryButton.onClick?.()}/>
      {secondaryButton &&
        <ActionButton className='bg-gray-3' content={secondaryButton.text} action={() => secondaryButton.onClick?.()}/>
      }
    </div>
  </>
}

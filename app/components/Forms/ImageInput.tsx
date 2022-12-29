import { ChangeEvent, useState } from "react";
import classNames from "classnames";
import Icons from "~/components/Icons";
import Modal from "~/components/Notifications/Modal";

interface IImageInputProps {
  id: string,
  // value: string
  onChange: ((file: File) => void),
  onRemove: () => void,
  errorText?: string,
  required?: boolean,
}

const ImageInput = (props: IImageInputProps) => {
  const {
    id,
    // value,
    required = false,
    onChange,
    onRemove,
    errorText
  } = props;
  const [uploadOpen, setUploadOpen] = useState(false);

  // const imagePath = value ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/${value}` : "/assets/user-solid.svg";

  // const imagePadding = classNames({
  //   '!p-1 bg-gray-6 dark:bg-gray-3 rounded-full': imagePath === "/assets/user-solid.svg",
  // });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if(files && files[0]) {
      onChange(files[0]);
    }
  };

  const hasError = !!errorText;
  const errorClasses = classNames({
    'border border-red-1 border-4 rounded-full': hasError
  });

  return <>
    <div className="relative flex items-center w-full max-w-lg bg-white dark:bg-gray-2 rounded-3xl p-5">
      <div className={`relative mr-5 group h-16 w-16 rounded-full ${errorClasses} overflow-hidden`}>
        {false && <img src='#' alt="User profile" className={`absolute`}/>}
        {true && <Icons iconName='user' className='absolute m-1'/>}
      </div>
      <div className="flex flex-col">
        <div className="flex flex-col space-y-5 sm:flex-row sm:space-x-5 sm:space-y-0 ">
          <button className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-white hover:bg-red-2`}
                  onClick={() => setUploadOpen(true)}
                  aria-label="Replace Image">{"" !== "" ? "New Image" : "Add Image"}</button>
          {/*{value &&*/}
          {/*  <IconButton icon="remove" size="medium" action={onRemove} type='button'/>*/}
          {/*}*/}
        </div>
        {hasError &&
          <span className="text-red-1 mt-2">{errorText}</span>
        }
      </div>
    </div>
    <Modal isOpen={uploadOpen} handleClose={() => setUploadOpen(false)}>
      <input id={id} type="file" name={id} required={required} accept="image/*"
             onChange={handleChange}
             className="hidden"/>
    </Modal>
  </>;
};

export default ImageInput;

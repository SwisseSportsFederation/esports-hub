import type { ChangeEvent, SyntheticEvent } from 'react';
import { useState } from 'react';
import Icons from '~/components/Icons';
import Modal from '~/components/Notifications/Modal';
import H1 from '~/components/Titles/H1';
import type { Crop } from 'react-image-crop';
import reactImageCropPkg from 'react-image-crop';
import ActionButton from '~/components/Button/ActionButton';

// @ts-ignore
const {default: ReactCrop, centerCrop, makeAspectCrop} = reactImageCropPkg;

const ImageCropBlock = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);

  const resetModal = () => {
    setImgSrc(undefined);
    setCrop(undefined);
  };

  function onSelectFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    const {width, height} = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({
        unit: '%',
        height,
        width,
      }, 1, width, height),
      width,
      height,
    );
    setCrop(crop);
  }

  return <>
    <input type="hidden" defaultValue={JSON.stringify(crop)} name="crop"/>
    <input id="image-upload" type="file" name="file" accept="image/*"
           onChange={onSelectFile}
           className="hidden"/>
    <div className="relative flex items-center w-full max-w-lg bg-white dark:bg-gray-2 rounded-3xl p-5">
      <div className={`relative mr-5 group h-16 w-16 rounded-full overflow-hidden`}>
        {imgSrc && <img src={imgSrc} alt="User profile"
                         className={`absolute`}/>}
        {!imgSrc && <Icons iconName="user" className="absolute m-1"/>}
      </div>
      <div className="flex flex-col">
        <div className="flex flex-col space-y-5 sm:flex-row sm:space-x-5 sm:space-y-0">
          <button className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-color hover:bg-red-2`}
                  type='button'
                  onClick={() => setUploadOpen(true)}
                  aria-label="Replace Image">{'New Image'}</button>
        </div>
      </div>
    </div>
    <Modal isOpen={uploadOpen} handleClose={() => setUploadOpen(false)}>
      <div className="flex flex-col gap-4 w-full">
        <H1 className="text-color">Upload Profile Image</H1>
        <div className="flex flex-col gap-4 justify-between items-start">
          <div className="w-full aspect-square flex mb-4 items-center">
            {!!imgSrc && <div className="w-full">
                <ReactCrop onChange={(_: unknown, crop: Crop) => setCrop(crop)} crop={crop} circularCrop={true}
                           aspect={1}
                           keepSelection={true} className="w-full">
                    <img src={imgSrc} onLoad={onImageLoad} alt="new profile" className="w-full"/>
                </ReactCrop>
            </div>}
            {!imgSrc && <label htmlFor="image-upload"
                               className="hover:bg-gray-3/80 hover:text-gray-7 cursor-pointer h-full w-full bg-gray-3 text-color flex flex-col items-center justify-center">
                <Icons iconName="upload" className="w-1/3 aspect-square"/>
                <H1>Upload your new profile image</H1>
            </label>}
          </div>
          <div className="flex justify-between w-full gap-4">
            <ActionButton content="Cancel" action={() => {
              setUploadOpen(false);
              setTimeout(() => {
                resetModal();
              }, 100);
            }}/>
            <ActionButton content="Okay" action={() => {
              setUploadOpen(false);
            }} disabled={!imgSrc}/>
          </div>
        </div>
      </div>
    </Modal>
  </>;
};

export default ImageCropBlock;

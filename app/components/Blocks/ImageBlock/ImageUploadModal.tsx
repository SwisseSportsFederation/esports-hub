import Modal from '~/components/Notifications/Modal';
import H1 from '~/components/Titles/H1';
import type { Crop } from 'react-image-crop';
import Icons from '~/components/Icons';
import ActionButton from '~/components/Button/ActionButton';
import type { SyntheticEvent , ChangeEvent} from 'react';
import { useMemo, useState } from 'react';
import reactImageCropPkg from 'react-image-crop';
import imageCompression from 'browser-image-compression';
import type { Setter } from '~/models/general.model';

// @ts-ignore
const {default: ReactCrop, centerCrop, makeAspectCrop} = reactImageCropPkg;

export const ImageUploadModal = (
  {crop, setCrop, uploadOpen, setUploadOpen, setImgSrc, setReadyForUpload}:
    {
      crop?: Crop,
      setCrop: Setter<Crop | undefined>,
      uploadOpen: boolean,
      setUploadOpen: Setter<boolean>,
      setImgSrc: Setter<string | undefined>,
      setReadyForUpload: Setter<boolean>
    }) => {
  const [previewImg, setPreviewImg] = useState<File | undefined>();

  const previewUrl = useMemo(() => {
    if (previewImg) {
      return URL.createObjectURL(previewImg);
    }
    return undefined;
  }, [previewImg]);

  const resetModal = () => {
    setPreviewImg(undefined);
    setCrop(undefined);
  };

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

  async function onSelectFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      setPreviewImg(e.target.files[0]);
    }
  }

  return <>
    <Modal isOpen={uploadOpen} handleClose={() => setUploadOpen(false)}>
      <input id="image-upload" type="file" name="file" accept="image/*"
             onChange={onSelectFile}
             className="hidden"/>
      <div className="flex flex-col gap-4 w-full">
        <H1 className="text-color">Upload Profile Image</H1>
        <div className="flex flex-col gap-4 justify-between items-start">
          <div className="w-full aspect-square flex mb-4 items-center">
            {!!previewUrl && <div className="w-full">
                <ReactCrop onChange={(_: unknown, crop: Crop) => setCrop(crop)} crop={crop} circularCrop={true}
                           aspect={1}
                           keepSelection={true} className="w-full">
                    <img src={previewUrl} onLoad={onImageLoad} alt="new profile" className="w-full"/>
                </ReactCrop>
            </div>}
            {!previewImg && <label htmlFor="image-upload"
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
            <ActionButton content="Okay" action={async () => {
              setUploadOpen(false);
              if (previewImg) {
                setReadyForUpload(false);
                await new Promise<void>((resolve) => {
                  const reader = new FileReader();
                  reader.addEventListener('load', () => {
                    setImgSrc(reader.result?.toString() || '');
                    resolve();
                  });
                  reader.addEventListener('error', () => {
                    resolve();
                  });
                  reader.readAsDataURL(previewImg);
                });

                const compressedFile = await imageCompression(previewImg, {
                  maxSizeMB: 1,
                  maxWidthOrHeight: 1920,
                  useWebWorker: true,
                });
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                  setImgSrc(reader.result?.toString() || '');
                  setReadyForUpload(true);
                });
                reader.readAsDataURL(compressedFile);
                setTimeout(() => {
                  setPreviewImg(undefined);
                }, 100);
              }
            }} disabled={!previewImg}/>
          </div>
        </div>
      </div>
    </Modal>
  </>;
};

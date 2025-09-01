import { useState } from 'react';
import Icons from '~/components/Icons';
import type { Crop } from 'react-image-crop';
import { ImageUploadModal } from '~/components/Blocks/ImageBlock/ImageUploadModal';
import type { Setter } from '~/models/general.model';


const ImageBasicUploadBlock = ({ imageReady, setImageReady, defaultImage }: { imageReady: boolean, setImageReady: Setter<boolean>, defaultImage?: string }) => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState<string | undefined>(defaultImage);
  return <>
    <input type="hidden" defaultValue={JSON.stringify(crop)} name="crop" />
    <input type="hidden" value={imgSrc} name="image" />
    <div className="relative flex items-center w-full max-w-xl bg-white dark:bg-gray-2 rounded-3xl p-5 my-4">
      <div className={`relative mr-5 group w-auto max-w-64 max-h-full`}>
        {imgSrc && <img src={imgSrc} alt="uploaded image" />}
        {!imgSrc && <Icons iconName="user" className="absolute m-1" />}
      </div>
      <div className="flex flex-col space-y-5 justify-around">
        <button
          className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-color hover:bg-red-2  disabled:bg-gray-400 disabled:cursor-auto`}
          type="button"
          onClick={() => setUploadOpen(true)}
          aria-label="Replace Image" disabled={!imageReady}>{imgSrc ? 'Change Image' : 'New Image'}</button>
        {imgSrc && <button
          className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-color hover:bg-red-2 disabled:bg-gray-400 disabled:cursor-auto`}
          onClick={() => setImgSrc(undefined)}
          aria-label="Delete Image" disabled={!imageReady}>Delete
          Image</button>}
      </div>
    </div>
    <ImageUploadModal crop={crop} setCrop={setCrop} uploadOpen={uploadOpen} setUploadOpen={setUploadOpen}
      setImgSrc={setImgSrc} setReadyForUpload={setImageReady} />
  </>;
};

export default ImageBasicUploadBlock;

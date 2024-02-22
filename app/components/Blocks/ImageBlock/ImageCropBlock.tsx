import { useState } from 'react';
import Icons from '~/components/Icons';
import type { Crop } from 'react-image-crop';
import { ImageUploadModal } from '~/components/Blocks/ImageBlock/ImageUploadModal';
import type { Setter } from '~/models/general.model';


const ImageCropBlock = ({profilePicReady, setProfilePicReady}: { profilePicReady: boolean, setProfilePicReady: Setter<boolean> }) => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  return <>
    <input type="hidden" defaultValue={JSON.stringify(crop)} name="crop"/>
    <input type="hidden" value={imgSrc} name="image"/>
    <div className="relative flex items-center w-full max-w-lg bg-white dark:bg-gray-2 rounded-3xl p-5">
      <div className={`relative mr-5 group h-16 w-16 rounded-full overflow-hidden`}>
        {imgSrc && <img src={imgSrc} alt="User profile"
                        className={`absolute`} style={{transform: `translate(-${crop?.x}%, -${crop?.y}%)`}}/>}
        {!imgSrc && <Icons iconName="user" className="absolute m-1"/>}
      </div>
      <div className="flex flex-col">
        <div className="flex flex-col space-y-5 sm:flex-row sm:space-x-5 sm:space-y-0">
          <button
            className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-color hover:bg-red-2  disabled:bg-gray-400 disabled:cursor-auto`}
            type="button"
            onClick={() => setUploadOpen(true)}
            aria-label="Replace Image" disabled={!profilePicReady}>{imgSrc ? 'Change Image' : 'New Image'}</button>
          {imgSrc && <button
              className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-color hover:bg-red-2 disabled:bg-gray-400 disabled:cursor-auto`}
              onClick={() => setImgSrc(undefined)}
              aria-label="Delete Image" disabled={!profilePicReady}>Delete
              Image</button>}

        </div>
      </div>
    </div>
    <ImageUploadModal crop={crop} setCrop={setCrop} uploadOpen={uploadOpen} setUploadOpen={setUploadOpen}
                      setImgSrc={setImgSrc} setReadyForUpload={setProfilePicReady}/>
  </>;
};

export default ImageCropBlock;

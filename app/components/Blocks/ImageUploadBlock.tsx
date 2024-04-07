import type { ChangeEvent, SyntheticEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import Icons from '~/components/Icons';
import Modal from '~/components/Notifications/Modal';
import H1 from '~/components/Titles/H1';
import type { Crop } from 'react-image-crop';
import ReactCrop, {centerCrop, makeAspectCrop} from 'react-image-crop';
import { useFetcher } from '@remix-run/react';
import ActionButton from '~/components/Button/ActionButton';
import type { EntityType } from '@prisma/client';
import type { StringOrNull } from '~/db/queries.server';
import { CDN_URL } from '~/constants';

type ImageUploadBlockPropTypes = {
  entity: EntityType,
  entityId: number,
  imageId: StringOrNull
}

const ImageUploadBlock = ({entity, entityId, imageId}: ImageUploadBlockPropTypes) => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteImageOpen, setDeleteImageOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const fetcher = useFetcher();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data != null) {
      resetModal();
    }
  }, [fetcher.state]);

  const resetModal = () => {
    setImgSrc(undefined);
    setCrop(undefined);
    ref.current?.reset();
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
    <div className="relative flex items-center w-full max-w-lg bg-white dark:bg-gray-2 rounded-3xl p-5">
      <div className={`relative mr-5 group h-16 w-16 rounded-full overflow-hidden`}>
        {imageId && <img src={`${CDN_URL}/${imageId}/public`} alt="User profile"
                         className={`absolute`}/>}
        {!imageId && <Icons iconName="user" className="absolute m-1"/>}
      </div>
      <div className="flex flex-col">
        <div className="flex flex-col space-y-5 sm:flex-row sm:space-x-5 sm:space-y-0">
          <button className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-color hover:bg-red-2`}
                  onClick={() => setUploadOpen(true)}
                  aria-label="Replace Image">{!imageId ? 'New Image' : 'Change Image'}</button>
          {imageId && <button className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-color hover:bg-red-2`}
                              onClick={() => setDeleteImageOpen(true)}
                              aria-label="Delete Image">Delete Image</button>}
        </div>
      </div>
    </div>
    <Modal isOpen={deleteImageOpen} handleClose={() => setDeleteImageOpen(false)}>
      <div className="flex justify-center text-center text-2xl mb-8 text-color">
        Do you want to delete your profile picture?
      </div>
      <fetcher.Form action={'/admin/api/image'} encType="multipart/form-data" method="delete"
                    className="flex justify-between gap-2" onSubmit={() => setDeleteImageOpen(false)}>
        <input type="hidden" name="entityId" value={entityId}/>
        <input type="hidden" name="entity" value={entity}/>
        <input type="hidden" name="imageId" value={imageId ?? undefined}/>
        <ActionButton content="Yes" type="submit" value="Delete"/>
        <ActionButton className="bg-gray-3" content="No" action={() => setDeleteImageOpen(false)}/>
      </fetcher.Form>
    </Modal>
    <Modal isOpen={uploadOpen} handleClose={() => setUploadOpen(false)}>
      <div className="flex flex-col gap-4 w-full">
        <H1 className="text-color">Upload Profile Image</H1>
        <fetcher.Form action={'/admin/api/image'} method="put" onSubmit={() => {
          setUploadOpen(false);
        }} encType="multipart/form-data" ref={ref} className="flex flex-col gap-4 justify-between items-start">
          {/*<label htmlFor='image-upload'*/}
          {/*       className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-white hover:bg-red-2`}*/}
          {/*       aria-label="Replace Image">Upload</label>*/}
          <input id="image-upload" type="file" name="file" required accept="image/*"
                 onChange={onSelectFile}
                 className="hidden"/>
          <input type="hidden" defaultValue={JSON.stringify(crop)} name="crop"/>
          <input type="hidden" defaultValue={entity} name="entity"/>
          <input type="hidden" defaultValue={entityId} name="entityId"/>
          <div className="w-full aspect-square flex mb-4 items-center">
            {!!imgSrc && <div className="w-full">
                <ReactCrop onChange={(crop: Crop) => setCrop(crop)} crop={crop} circularCrop={true} aspect={1}
                           keepSelection={true} className='w-full'>
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
            <ActionButton content="Submit" type="submit" disabled={!imgSrc}/>
          </div>
        </fetcher.Form>
      </div>
    </Modal>
  </>;
};

export default ImageUploadBlock;

import { useFetcher } from '@remix-run/react';
import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import ActionButton from '~/components/Button/ActionButton';
import Icons from '~/components/Icons';
import Modal from '~/components/Notifications/Modal';
import H1 from '~/components/Titles/H1';
import { useImage } from '~/context/image-provider';
import type { StringOrNull } from '~/db/queries.server';

type ImageUploadBlockPropTypes = {
  path: StringOrNull,
  imageId: StringOrNull,
}

const ImageUploadBlock = ({ path, imageId }: ImageUploadBlockPropTypes) => {
  const imageRoot = useImage();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteImageOpen, setDeleteImageOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [currentImageId, setCurrentImageId] = useState(imageId);  // Store locally
  const fetcher = useFetcher();
  const ref = useRef<HTMLFormElement>(null);
  const imagePath = path ? path : 'images/';

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data != null) {
      // Get the imageId from the response
      const newImageId = fetcher.data?.id;
      if (newImageId) {
        setCurrentImageId(newImageId);  // Update local state
      }

      resetModal();
    }
  }, [fetcher.state, fetcher.data]);

  const resetModal = () => {
    setImgSrc(undefined);
    ref.current?.reset();
  };

  function onSelectFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  return <>
    <div className="relative flex items-center w-full max-w-lg bg-white dark:bg-gray-2 rounded-3xl p-5">
      <div className={`relative mr-5 group h-16 w-16 rounded-full overflow-hidden`}>
        {currentImageId && <img src={imageRoot + currentImageId} alt="Image"
          className={`absolute`} />}
        {!currentImageId && <Icons iconName="user" className="absolute m-1" />}
        <input type="hidden" name="imageId" value={currentImageId ?? undefined} />
      </div>
      <div className="flex flex-col">
        <div className="flex flex-col space-y-5 sm:flex-row sm:space-x-5 sm:space-y-0">
          <button className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-white hover:bg-red-600 transition-colors`}
            onClick={() => setUploadOpen(true)}
            type="button"
            aria-label="Replace Image">{!currentImageId ? 'New Image' : 'Change Image'}</button>
          {currentImageId && <button className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-white hover:bg-red-600 transition-colors`}
            onClick={() => setDeleteImageOpen(true)}
            type="button"
            aria-label="Delete Image">Delete Image</button>}
        </div>
      </div>
    </div>
    <Modal isOpen={deleteImageOpen} handleClose={() => setDeleteImageOpen(false)}>
      <div className="flex justify-center text-center text-2xl mb-8 text-color">
        Do you want to delete this image?
      </div>
      <fetcher.Form action={'/admin/api/image'} encType="multipart/form-data" method="delete"
        className="flex justify-between gap-2" onSubmit={() => setDeleteImageOpen(false)}>
        <input type="hidden" name="imageId" value={currentImageId ?? undefined} />
        <ActionButton content="Yes" type="submit" value="Delete" />
        <ActionButton className="bg-gray-3" content="No" action={() => setDeleteImageOpen(false)} />
      </fetcher.Form>
    </Modal>
    <Modal isOpen={uploadOpen} handleClose={() => setUploadOpen(false)}>
      <div className="flex flex-col gap-4 w-full">
        <H1 className="text-color">Upload Image</H1>
        <fetcher.Form action={'/admin/api/image'} method="put" onSubmit={() => {
          setUploadOpen(false);
        }} encType="multipart/form-data" ref={ref} className="flex flex-col gap-4 justify-between items-start">
          {/* <label htmlFor='image-upload'*/}
          {/*       className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-white hover:bg-red-2`}*/}
          {/*       aria-label="Replace Image">Upload</label> */}
          <input id="image-upload" type="file" name="file" required accept="image/*"
            onChange={onSelectFile}
            className="hidden" />
          <input type="hidden" defaultValue={imagePath} name="path" />
          <div className="w-full aspect-square flex mb-4 items-center">
            {!imgSrc && <label htmlFor="image-upload"
              className="hover:bg-gray-3/80 hover:text-gray-7 cursor-pointer h-full w-full bg-gray-3 text-color flex flex-col items-center justify-center">
              <Icons iconName="upload" className="w-1/3 aspect-square" />
              <H1>Upload new image</H1>
            </label>}
            {!!imgSrc && <div className="w-full">
              <img src={imgSrc} alt="new image" className="w-full" />
            </div>}
          </div>
          <div className="flex justify-between w-full gap-4">
            <ActionButton content="Cancel" action={() => {
              setUploadOpen(false);
              setTimeout(() => {
                resetModal();
              }, 100);
            }} />
            <ActionButton content="Submit" type="submit" disabled={!imgSrc} />
          </div>
        </fetcher.Form>
      </div>
    </Modal>
  </>;
};

export default ImageUploadBlock;

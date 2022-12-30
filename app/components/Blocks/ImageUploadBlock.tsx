import { ChangeEvent, SyntheticEvent, useEffect, useRef, useState } from "react";
import Icons from "~/components/Icons";
import Modal from "~/components/Notifications/Modal";
import H1 from "~/components/Titles/H1";
import ReactCrop, { centerCrop, Crop, makeAspectCrop } from "react-image-crop";
import { useFetcher } from "@remix-run/react";
import ActionButton from "~/components/Button/ActionButton";
import { EntityType } from "~/helpers/entityType";
import { StringOrNull } from "~/db/queries.server";
import { CDN_URL } from "~/constants";

type ImageUploadBlockPropTypes = {
  entity: EntityType,
  entityId: number,
  imageId: StringOrNull
}

const ImageUploadBlock = ({ entity, entityId, imageId }: ImageUploadBlockPropTypes) => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined)
  const fetcher = useFetcher();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if(fetcher.type === 'done') {
      resetModal();
    }
  }, [fetcher.type])

  const resetModal = () => {
    setImgSrc(undefined);
    setCrop(undefined);
    ref.current?.reset();
  }

  function onSelectFile(e: ChangeEvent<HTMLInputElement>) {
    if(e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({
        unit: "%",
        height,
        width
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
        {!imageId && <Icons iconName='user' className='absolute m-1'/>}
      </div>
      <div className="flex flex-col">
        <div className="flex flex-col space-y-5 sm:flex-row sm:space-x-5 sm:space-y-0">
          <button className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-white hover:bg-red-2`}
                  onClick={() => setUploadOpen(true)}
                  aria-label="Replace Image">{"" !== "" ? "New Image" : "Add Image"}</button>
          {/*{value &&*/}
          {/*  <IconButton icon="remove" size="medium" action={onRemove} type='button'/>*/}
          {/*}*/}
        </div>
      </div>
    </div>
    <Modal isOpen={uploadOpen} handleClose={() => setUploadOpen(false)}>
      <div className='flex flex-col gap-4'>
        <H1 className='text-white'>Upload Profile Image</H1>
        <fetcher.Form action={'/admin/api/image'} method='put' onSubmit={() => {
          setUploadOpen(false);
        }} encType='multipart/form-data' ref={ref} className='flex flex-col gap-4 justify-between items-start'>
          {/*<label htmlFor='image-upload'*/}
          {/*       className={`px-4 py-2 cursor-pointer rounded-md bg-red-1 text-white hover:bg-red-2`}*/}
          {/*       aria-label="Replace Image">Upload</label>*/}
          <input id='image-upload' type="file" name='file' required accept="image/*"
                 onChange={onSelectFile}
                 className="hidden"/>
          <input type='hidden' defaultValue={JSON.stringify(crop)} name='crop'/>
          <input type='hidden' defaultValue={entity} name='entity'/>
          <input type='hidden' defaultValue={entityId} name='entityId'/>
          <div className='w-full aspect-square flex mb-4 items-center'>
            {imgSrc && <div className='w-full'>
              <ReactCrop onChange={(_, crop) => setCrop(crop)} crop={crop} circularCrop={true} aspect={1}
                         keepSelection={true} className='w-full'>
                <img src={imgSrc} onLoad={onImageLoad} alt='new profile' className='w-full'/>
              </ReactCrop>
            </div>}
            {!imgSrc && <label htmlFor='image-upload'
                               className='hover:bg-gray-3/80 hover:text-gray-7 cursor-pointer h-full w-full bg-gray-3 text-white flex flex-col items-center justify-center'>
              <Icons iconName='upload' className='w-1/3 aspect-square'/>
              <H1>Upload your new profile image</H1>
            </label>}
          </div>
          <div className='flex justify-between w-full gap-4'>
            <ActionButton content='Cancel' action={() => {
              setUploadOpen(false);
              setTimeout(() => {
                resetModal();
              }, 100);
            }}/>
            <ActionButton content='Submit' type='submit' disabled={!imgSrc}/>
          </div>
        </fetcher.Form>

      </div>
    </Modal>
  </>;
};

export default ImageUploadBlock;

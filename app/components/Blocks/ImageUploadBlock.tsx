import ImageInput from "../Forms/ImageInput";
import { useState } from "react";


const ImageUploadBlock = () => {
  // const [image, setImage] = useState<string>(props.image);
  const [imageErrorText, setImageErrorText] = useState<string>("");

  // const uploadFile = async (file: File) => {
  //   if(file.size > 2000000) {
  //     setImageErrorText("Error uploading image: Image too big");
  //     return;
  //   }
  //
  //   const formData = new FormData();
  //   formData.append("image", file);
  //
  //   const token = await getAccessTokenSilently();
  //   const [res, error] = await authenticatedFetch(props.imageEditEndpoint, {
  //     method: "POST",
  //     body: formData
  //   }, token);
  //   if(error) {
  //     setImageErrorText("Error uploading image");
  //     console.error(error);
  //     return;
  //   }
  //   const { id } = await res?.json();
  //   setImage(id);
  // };

  // const removeImage = async () => {
  //   const token = await getAccessTokenSilently();
  //   const [, error] = await authenticatedFetch(props.imageEditEndpoint, {
  //     method: "DELETE",
  //   }, token);
  //   if(error) {
  //     setImageErrorText("Error deleting image");
  //     console.error(error);
  //     return;
  //   }
  //   setImage("");
  // };

  return <ImageInput id="image-input" onChange={() => void 0} onRemove={() => void 0}
                     errorText={imageErrorText}/>;
};

export default ImageUploadBlock;

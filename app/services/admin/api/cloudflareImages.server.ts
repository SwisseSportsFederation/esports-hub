import sharp from "sharp";
import type { Crop } from "react-image-crop";
import sizeOf from 'buffer-image-size';

export const resize = async (file: File, cropData: Crop): Promise<File> => {
  const original = Buffer.from(await file.arrayBuffer());
  const { width, height } = sizeOf(original);
  const region = {
    top: Math.round(height / 100 * cropData.y),
    left: Math.round(width / 100 * cropData.x),
    height: Math.round(height / 100 * cropData.height),
    width: Math.round(width / 100 * cropData.width)
  };
  const buffer = await sharp(original)
    .extract(region)
    .resize({
      height: 150,
      width: 150
    })
    .webp()
    .toBuffer();
  return new File([buffer], file.name)
};

export const upload = async (croppedImage: File): Promise<{ result: { id: string } }> => {
  const formData = new FormData();
  formData.set("file", croppedImage);
  return fetch('https://api.cloudflare.com/client/v4/accounts/9f0e209fa6f3129765424f4a5e1e7415/images/v1', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer kLYavG4xbl22RCc8Gw1BZ8FUo0-jzLyRdmODC4E1'
    },
    body: formData
  }).then(res => res.json());
};

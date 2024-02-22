import sharp from "sharp";
import type { Crop } from "react-image-crop";
import sizeOf from 'buffer-image-size';
import type { StringOrNull } from "~/db/queries.server";

export const resize = async (original: Buffer, cropData: Crop): Promise<File> => {
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
  return new File([buffer], 'image')
};

export const deleteImage = async (imageId: StringOrNull) => {
  if(!imageId) return { success: true };
  return fetch(`https://api.cloudflare.com/client/v4/accounts/9f0e209fa6f3129765424f4a5e1e7415/images/v1/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${process.env.CLOUDFLARE_BEARER}`
    }
  });
};

export const upload = async (croppedImage: File): Promise<{ result: { id: string } }> => {
  const formData = new FormData();
  formData.set("file", croppedImage);
  return fetch('https://api.cloudflare.com/client/v4/accounts/9f0e209fa6f3129765424f4a5e1e7415/images/v1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLOUDFLARE_BEARER}`
    },
    body: formData
  }).then(res => res.json());
};

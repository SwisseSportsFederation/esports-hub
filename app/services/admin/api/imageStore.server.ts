import sharp from "sharp";
import type { Crop } from "react-image-crop";
import sizeOf from 'buffer-image-size';
import type { StringOrNull } from "~/db/queries.server";
import * as Minio from 'minio';
import { UploadedObjectInfo } from 'minio';

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
      height: 500,
      width: 500
    })
    .webp()
    .toBuffer();
  return new File([buffer], 'image', { type: 'image/webp' })
};

const getMinioClient = () => {
  if (process.env.MINIO_ACCESS_KEY && process.env.MINIO_SECRET_KEY) {
    return new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: Number(process.env.MINIO_PORT),
      useSSL: true,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
  } else {
    throw Error('Minio Client not initialized.')
  }
}

export const deleteImage = async (imageId: StringOrNull) => {
  if (!imageId) return { success: true };
  const minioClient = getMinioClient();

  if (!process.env.MINIO_BUCKET_NAME) {
    throw Error('Minio Bucket Name not known')
  }
  return minioClient.removeObject(process.env.MINIO_BUCKET_NAME, imageId)
};

export const upload = async (croppedImage: File, fileName: string): Promise<{ result: { id: string } }> => {
  const metaData = {
    'Content-Type': croppedImage.type,
  };
  const minioClient = getMinioClient();
  const fileBuffer = Buffer.from(await croppedImage.arrayBuffer());
  return new Promise((resolve, reject) => {
    if (!process.env.MINIO_BUCKET_NAME) {
      throw Error('Minio Bucket Name not known')
    }
    minioClient.putObject(process.env.MINIO_BUCKET_NAME, fileName, fileBuffer, fileBuffer.byteLength, metaData, function (err: any, objInfo: UploadedObjectInfo) {
      if (err) {
        console.error('Error uploading object to Minio:', err);
        reject(err);
      } else {
        console.log('Success:', fileName, objInfo.etag, objInfo.versionId);
        resolve({ result: { id: fileName } });
      }
    })
  })
};

export const getImageRoot = (): string => {
  if (process.env.MINIO_ENDPOINT && process.env.MINIO_BUCKET_NAME) {
    return `https://${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET_NAME}/`
  }
  return ""
}

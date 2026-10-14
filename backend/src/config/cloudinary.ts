import { v2 as cloudinary } from 'cloudinary';
import { config } from './index';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadImage = async (file: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, crop: 'limit' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || '');
      }
    );
    uploadStream.end(file);
  });
};

export const deleteImage = async (url: string): Promise<void> => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1].split('.')[0];
  const folder = parts[parts.length - 2];
  await cloudinary.uploader.destroy(`${folder}/${filename}`);
};

export const optimizeImage = (url: string, options?: { width?: number; height?: number; quality?: number }) => {
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  const transformations = [];
  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  transformations.push(`q_${options?.quality || 'auto'}`);
  transformations.push('f_auto');
  return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
};

export default cloudinary;

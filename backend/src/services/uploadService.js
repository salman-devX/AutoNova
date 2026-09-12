import { getCloudinary } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

/** Uploads a Buffer (from multer memoryStorage) to Cloudinary via an upload_stream. */
function uploadBuffer(buffer, folder) {
  const cloudinary = getCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `autohubx/${folder}`, resource_type: 'image' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

async function uploadImage(file, folder) {
  if (!file) throw ApiError.badRequest('No file provided.', 'NO_FILE');
  const result = await uploadBuffer(file.buffer, folder);
  return { url: result.secure_url, publicId: result.public_id };
}

async function uploadImages(files, folder) {
  return Promise.all((files || []).map((f) => uploadImage(f, folder)));
}

async function deleteImage(publicId) {
  if (!publicId) return { result: 'skipped' };
  const cloudinary = getCloudinary();
  return cloudinary.uploader.destroy(publicId);
}

export const uploadService = { uploadImage, uploadImages, deleteImage };

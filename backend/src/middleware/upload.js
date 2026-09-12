import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage(); // buffer passed straight through to Cloudinary, never written to disk

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPEG, PNG, or WEBP images are allowed.', 'INVALID_FILE_TYPE'));
  }
  cb(null, true);
}

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 6 },
});

export const uploadSingleImage = uploader.single('image');
export const uploadMultipleImages = uploader.array('photos', 6);

/** Normalizes Multer errors into the standard ApiError/response shape. */
export function handleUploadErrors(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 5MB size limit.' : err.message;
    return next(ApiError.badRequest(message, 'UPLOAD_ERROR'));
  }
  next(err);
}

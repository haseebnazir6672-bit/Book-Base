import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isBook = req.originalUrl.includes('/books');
    const isHub = req.originalUrl.includes('/hub');
    const isPdf = file.mimetype === 'application/pdf';
    const isVideo = file.mimetype.startsWith('video/');
    const isDocument = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype);

    const folder = isBook ? 'elibrary_books' : isHub ? 'elibrary_hub' : 'elibrary_profiles';
    const allowed_formats = isHub
      ? ['jpg', 'png', 'jpeg', 'webp', 'pdf', 'mp4', 'mov', 'doc', 'docx']
      : isPdf
        ? ['pdf']
        : ['jpg', 'png', 'jpeg', 'webp'];

    return {
      folder,
      resource_type: isHub && (isVideo || isDocument) ? 'auto' : 'image',
      allowed_formats,
      transformation: isPdf || isVideo || isDocument ? undefined : [{ width: 500, height: 500, crop: 'limit' }],
      public_id: `${isBook ? 'book' : isHub ? 'hub' : 'profile'}-${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage: storage });

export { cloudinary, upload };

import cloudinary from "../config/cloudinary.config.js";
import { UploadApiResponse } from "cloudinary";
export const uploadImage = async (
  file: Express.Multer.File,
  folder: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Image upload failed"));
        }

        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
};

export const deleteImage = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

import cloudinary from "../config/cloudinary.config.js";
import { UploadApiResponse } from "cloudinary";

export const uploadFile = async (
  file: Express.Multer.File,
  folder: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("File upload failed"));
        }

        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
};

export const deleteFile = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
};
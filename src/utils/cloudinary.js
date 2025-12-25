import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// const checkCloudinaryConnection = async () => {
//   try {
//     const result = await cloudinary.api.ping();
//     console.log("✅ Cloudinary Connected:", result);
//   } catch (error) {
//     console.error("❌ Cloudinary Connection Failed:", error.message);
//   }
// };

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // checkCloudinaryConnection();
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

// const uploadOnCloudinary = async function (filePath) {
//   try {
//     const res = await cloudinary.uploader.upload("./cleint.png");
//     console.log(res);
//     return res;
//     // if (!filePath) return null;
//     // console.log(filePath);
//     // const response = await cloudinary.uploader.upload(filePath, {
//     //   resource_type: "auto",
//     // });
//     // console.log("File Succesfully Uploaded : ", response);
//     // return response;
//   } catch (error) {
//     fs.unlinkSync(filePath); // remove the locally saved temporary file as the upload operation got failed
//     return null;
//   }
// };

export { uploadOnCloudinary };

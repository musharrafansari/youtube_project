const cloudinary = require('cloudinary').v2
const fs=require("fs")
require('dotenv').config();

       


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


// const uploadCloudinary=async(localFilePath)=>{
//     try {
//         if(!localFilePath) return null
//         // now upload file
//        const response=await  cloudinary.uploader.upload(localFilePath,{
//             resource_type:'auto'
//         })
//         // file has been uploaded successfully
//         console.log("file has been uploaded successfully",response.url)
//         return response
//     } catch (error) {
//         fs.unlinkSync(localFilePath)
//     // remove the locally saved temporary file as the upload operation failed
//     return null
//     }
// }


//==================>

// const uploadCloudinary=async(localFilePath)=>{
//     try {
//         if(!localFilePath) return null
//         // now upload file
//        const response=await  cloudinary.uploader.upload(localFilePath,{
//             resource_type:'auto'
//         })
//         // file has been uploaded successfully
//         console.log("file has been uploaded successfully",response.url)
        
//         fs.unlinkSync(localFilePath);
//         console.log("Local file has been deleted");

//         // return response;
//         return response
//     } catch (error) {
//         fs.unlinkSync(localFilePath)
//     // remove the locally saved temporary file as the upload operation failed
//     return null
//     }
// }


////////////// 

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });

        // File uploaded successfully
        console.log("File has been uploaded successfully", response.url);

        // Asynchronously delete the local file
        fs.unlink(localFilePath, (unlinkError) => {
            if (unlinkError) {
                console.error("Error deleting local file:", unlinkError);
            } else {
                console.log("Local file has been deleted");
            }
        });

        return response;
    } catch (uploadError) {
        console.error("Error uploading file to Cloudinary:", uploadError);

        // Remove the locally saved temporary file as the upload operation failed
        fs.unlink(localFilePath, (unlinkError) => {
            if (unlinkError) {
                console.error("Error deleting local file:", unlinkError);
            }
        });

        return null;
    }
};

module.exports={
    uploadCloudinary
}
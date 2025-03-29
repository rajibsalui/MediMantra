import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


// configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadCloudinary=async(localfilepath)=>{
     try {
        if(!localfilepath) return null;
    // file upload part
     const uploadresponse=await cloudinary.uploader.upload(localfilepath,{
        resource_type:'auto'
     });
     console.log("file is uploaded to cloudinary",uploadresponse.url);
     
     fs.unlinkSync(localfilepath);
     return uploadresponse;

     } catch (error) {
        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        } 
          return null;
     }
}
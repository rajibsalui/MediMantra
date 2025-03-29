import { User } from "../models/user.models.js";
import { ApiError } from "../config/ApiError.js";
import { validationResult } from "express-validator";
import { uploadCloudinary } from "../config/cloudinary.js";



export const register = async (req, res) => {
    try {
      const { firstName, lastName, email, password, phone } = req.body;
  
      // Validate input
      if (!firstName || !lastName || !email || !password || !username) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
        });
      }
  
      // Check if user already exists
      const userExists = await User.findOne(
        { email: email.toLowerCase() }
      );
      
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }
      const avatarLocalPath = req.files?.avatar?.[0]?.path;
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required");
        }

        // Upload avatar to Cloudinary
        const avatar = await uploadCloudinary(avatarLocalPath);
        console.log(avatar);
      // Create user with hashed password
      const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        avatar: avatar.url,
        phoneNumber: phone,
      });
  
      // Generate token
      const token = generateRefreshToken();
  
      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
  
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
  
      res.status(201).json({
        success: true,
        token,
        user: userResponse,
      });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({
        success: false,
        message: "Error creating user",
        error: error.message, // Include error message for debugging
      });
    }
  };



export { register };
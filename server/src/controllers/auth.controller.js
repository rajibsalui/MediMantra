import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.utils.js";
import { uploadImage } from "../utils/uploadImage.js";
import bcrypt from "bcryptjs";

// Register user
// export const register = async (req, res) => {
//   try {
//     const { firstName, lastName, email, password } = req.body;
//     // Validate input
//     if (!firstName || !lastName || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide all required fields",
//       });
//     }

//     // Check if user already exists
//     const userExists = await User.findOne({
//       $or: [
//         { email: email.toLowerCase() },
//         { username: username.toLowerCase() },
//       ],
//     });

//     if (userExists) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists",
//       });
//     }

//     // Create user with hashed password
//     const user = await User.create({
//       firstName,
//       lastName,
//       username: username.toLowerCase(),
//       email: email.toLowerCase(),
//       password,
//     });

//     // Generate token
//     const token = generateToken(user._id);

//     // Set cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 24 * 60 * 60 * 1000, // 24 hours
//     });

//     // Remove password from response
//     const userResponse = user.toObject();
//     delete userResponse.password;

//     res.status(201).json({
//       success: true,
//       token,
//       user: userResponse,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error creating user",
//     });
//   }
// };

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, username, phone } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }


    // Create user with hashed password
    const user = await User.create({
      firstName,
      lastName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      phoneNumber: phone,
    });

    // Generate token
    const token = generateToken(user._id);

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

// Firebase authentication
export const firebaseAuth = async (req, res) => {
  try {
    const { user: firebaseUser } = req.body;

    if (!firebaseUser?.uid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Firebase user data",
      });
    }

    // Find or create user
    let user = await User.findOne({
      $or: [{ firebaseUid: firebaseUser.uid }, { email: firebaseUser.email }],
    });

    if (!user) {
      // Create new user
      const names = firebaseUser.displayName?.split(" ") || [];
      user = await User.create({
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        email: firebaseUser.email,
        username: firebaseUser.email.split("@")[0],
        firebaseUid: firebaseUser.uid,
        phoneNumber: firebaseUser.phoneNumber || "",
        authProvider: "google",
        avatar: firebaseUser.photoURL || "",
        isVerified: firebaseUser.emailVerified,
        isOnline: true,
        lastSeen: new Date(),
      });
    } else {
      // Update existing user
      user.isOnline = true;
      user.lastSeen = new Date();
      user.firebaseUid = firebaseUser.uid;
      if (!user.avatar && firebaseUser.photoURL) {
        user.avatar = firebaseUser.photoURL;
      }
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        isOnline: user.isOnline,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("Firebase auth error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and check if it's an email/password user
    const user = await User.findOne({
      email: email.toLowerCase(),
      authProvider: "email",
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or wrong authentication method",
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    // Update user status
    await User.findByIdAndUpdate(req.user.id, {
      isOnline: false,
      lastSeen: Date.now(),
    });

    // Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging out",
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      currentPassword,
      newPassword,
    } = req.body;
    const avatar = req.body.avatar;

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Handle phone number update with verification check
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const isVerified = await Verification.findOne({
        userId: user._id,
        phone: phoneNumber,
        phoneVerified: true,
        expiresAt: { $gt: new Date() }
      });

      if (!isVerified) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be verified before updating",
          requiresVerification: true
        });
      }
      user.phoneNumber = phoneNumber;
    }

    // Check file size if avatar is being updated
    if (avatar && avatar !== user.avatar) {
      const sizeInMB =
        Buffer.from(avatar.split(",")[1], "base64").length / (1024 * 1024);
      if (sizeInMB > 5) {
        return res.status(400).json({
          success: false,
          message: "Image size should not exceed 5MB",
        });
      }
    }

    // Handle password update
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required",
        });
      }

      const isPasswordValid = await user.matchPassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      user.password = newPassword;
    }

    // Handle username update
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
      user.username = username.toLowerCase();
    }

    // Handle email update
    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already taken",
        });
      }
      user.email = email.toLowerCase();
    }

    // Update other fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    // Handle avatar update
    if (avatar && avatar !== user.avatar) {
      try {
        user.avatar = await uploadImage(avatar);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Error uploading avatar",
        });
      }
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating profile",
    });
  }
};

// Check auth status
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        isLoggedIn: false,
        message: "Not authenticated",
      });
    }

    res.status(200).json({
      success: true,
      isLoggedIn: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        contacts: user.contacts,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        authProvider: user.authProvider,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      isLoggedIn: false,
      message: "Error checking authentication status",
    });
  }
};



export const verifyPhoneNumber = async (req, res) => {
  try {
    const { phone, code } = req.body;
    const userId = req.user.id;

    const verification = await Verification.findOne({
      userId,
      phone,
      phoneCode: code,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code"
      });
    }

    verification.phoneVerified = true;
    await verification.save();

    res.status(200).json({
      success: true,
      message: "Phone number verified successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying phone number"
    });
  }
};

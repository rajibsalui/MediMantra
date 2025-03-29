import mongoose, { Schema, } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      // required: [true, "Last name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
    },
    phoneNumber: {
      type: String,
      default: "",
      sparse: true
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ["email", "google", "facebook"],
      default: "email",
    },
    avatar: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    displayName: {
      type: String,
      // required: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      sparse: true
    }
  },
  {
    timestamps: true,
  }
)


userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
   this.password=await bcrypt.hash(this.password,10);
   next();
})

// custom method to match encrypted and user provided password
userSchema.methods.isPasswordCorrect=async function (password) {
  return await bcrypt.compare(password,this.password) 
}

userSchema.methods.generateAccessToken=function()
{
   return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);
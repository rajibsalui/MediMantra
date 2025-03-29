import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
const createUser=async({firstname,lastname,email,password})=>{
  if(!firstname || !email || !password){
    throw new ApiError(401,"all fields are required");
  }
   
  const user=await User.create({
    fullname:{
        firstname,
        lastname
    },
    email,password
  });
  return user;
}

export {createUser}
import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDb from "./src/db/dbconnection.js";

dotenv.config();

const app=express();

app.use(cors(
    {
      origin:process.env.CORS_ORIGIN,
      credentials:true,  
    }
))
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"})); 
app.use(express.static("public"));//to store public assets
app.use(cookieParser());
connectDb();



export {app}
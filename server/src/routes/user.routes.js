import {Router} from "express"

import {req,body} from "express-validator"
import { register } from "../controllers/user.controller";


const authrouter=Router();

authrouter.post('/register',
    
    post(
        upload.fields([
            {
                name:"avatar",
                maxCount:1
    
            },]),
            [
     body('fullname.firstname').isLength({min:3}).withMessage('firstname must be 3 characters long'),
    body('email').isEmail().withMessage('Invalid Email'),
   


    body('password').isLength({min:8}).withMessage('password must be atleast 8 characters long'),
],register));

export default authrouter;
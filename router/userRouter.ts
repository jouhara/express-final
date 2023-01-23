import express, { response } from 'express'
import {body,validationResult} from 'express-validator'
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';
import TokenVerifier from "../middleware/TokenVerifier";

const userRouter:express.Router=express.Router();

/*
@usage:register user
@url:http://127.0.0.1:500/users/register
@method:post
@fields:name,email,password
@access:public
*/ 
userRouter.post('/register',[
    body('name').not().isEmpty().withMessage('name is required'),
    body('email').not().isEmpty().withMessage(' email required'),
    body('password').not().isEmpty().withMessage('pswd reqiured')
],async(req:express.Request,res:express.Response)=>{
    let errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors:errors.array()
        })
    }
    try{
        let{name,email,password}=req.body;
        //check email exist
        let user=await User.findOne({email:email});
        if (user){
            return response.status(400).json({
                errors:[
                    {
                        msg:'user exist'
                    }
                ]
            });
        }
        //encrypt the pswd
        let salt = await bcrypt.genSalt(10);
        password=await bcrypt.hash(password,salt);
        //get avatar 
        let avatar=gravatar.url(email,{
            s:'300',
            r:'pg',
            d:'mm'
        });
        //reg logic
        user =new User({name,email,password,avatar});
        user=await user.save();
        res.status(200).json({
            msg:'reg user success'
        });

    }catch
    (error){
        console.error(error);
        res.status(500).json({
            errors:[{
                msg:error
            }]
        });
    }
});
/*
@usage:login user
@url:http://127.0.0.1:5000/user/login
method:post
fields:email.password
access:public */

userRouter.post('/login',[body('email').not().isEmpty().withMessage('email required'),
body('password').not().isEmpty().withMessage('pswd required')],
async(req:express.Request,res:express.Response)=>{
    let errors =validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({
            errors:errors.array()
        });
    }
    try{
        let{email,password}=req.body;
        //login logic
        //check for email
        let user=await User.findOne({email:email})
        if(!user){
            return res.status(401).json({
                errors:[
                    {
                        msg:' invalid mail'
                    }
                ]
            })
        }
        //check pswd
        let isMatch:boolean = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({
                errors:[
                    {
                        msg:' invalid pass'
                    }
                ]
            })
        }
        //create tkn
        let payload:any = {
            user:{
                id:user.id,
                name:user.name
            }
        };
        let secretKey:string|undefined=process.env.JWT_SECRET_KEY;
        if(secretKey){
            let token = jwt.sign(payload,secretKey);
            res.status(200).json({
                msg:'login success',
                token:token
            });
        }
         

    }catch(error){
        console.error(error);
        res.status(500).json({
            errors:[{
                msg:error
            }]
        });
    }
});
/* 
@usage:get user profile
@url:http://127.0.0.1:5000/users/me
@method:get
@fields:none
access:private
*/
userRouter.get('/me',TokenVerifier,async(req:express.Request,res:express.Response)=>{
    try{
        let requestedUser:any=req.headers['user'];
        let user =await User.findOne({_id:requestedUser.id}).select('-password');
        if(!user){
            res.status(400).json({
                errors:[
                    {
                        msg:"user data not found"
                    }
                   
                ]
            });
        }
        res.status(200).json({
           user:user
        })
    }catch(error){
        console.error(error);
        res.status(500).json({
            errors:[
                {
                    msg:error
                }
               
            ]
        })
    }
})
export default userRouter;
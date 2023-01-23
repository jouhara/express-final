import express from 'express';
import jwt from 'jsonwebtoken';
let TokenVerifier =(req:express.Request,res:express.Response,next:express.NextFunction)=>
{
    try{
        let token = req.headers['x-auth-token'];
        if(!token){
            return res.status(401).json({
               errors:[
                {
                    msg:'no token provided.Acess denied'
                }
               ] 
            });
        }
        if(typeof token==="string"){
            let decode:any= jwt.verify(token,process.env.JWT_SECRET_KEY as string);
            req.headers['user']=decode.user;
            next();
        }   

    }catch(error){
        return res.status(500).json({
            errors:[
             {
                 msg:'invalid tokn token provided.Acess denied'
             }
            ] 
         });
    }
};
export default TokenVerifier;
import express from 'express';
import path from 'path'; 
import cors from 'cors';
import dotEnv from 'dotenv';
import mongoose from 'mongoose';
import userRouter from './router/userRouter';
import eventRouter from './router/eventRouter';
const app:express.Application=express();
import TokenVerifier from './middleware/TokenVerifier';
import {body,validationResult} from 'express-validator';
import { IEvent } from './models/IEvent';
import Event from './models/Event';
import multer from 'multer';
const storage=multer.diskStorage({
    destination:'uploads/',
    filename:(req,file,cb)=>{
        const fileSplit=file.originalname.split('.');
        const filename=file.fieldname+"-"+Date.now()+"."+fileSplit[fileSplit.length-1];
        cb(null,filename);
    }
})
const upload =multer({storage}) 

//cors
app.use(cors());
//cofiguration of express to recieve form data
app.use(express.json());
//configure dotEnv
dotEnv.config({path:'./.env'});
const hostName:string|undefined =process.env.HOST_NAME;
const port:string|undefined =process.env.PORT;
//connect to mongodb
let dbURL:string|undefined=process.env.MONGO_DB_LOCAL;
console.log(dbURL)
if(dbURL){
mongoose.connect(dbURL,{
    useUnifiedTopology:true,
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
    
}).then((res)=>{
    console.log('connected to db')
}).catch((error)=>{
    console.error(error);
    process.exit(1);

});
}
app.use('/public',express.static('public'));
app.use('/public',express.static('public/css'));
app.use('/public',express.static('public/js '));
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));




app.get('/',async(req:express.Request,res:express.Response)=>{
    let event:IEvent[]|null =await Event.find();

    res.render('index',{event});

});

app.post('/create',upload.single('image'), async(req, res)=> {
   
    
let {name ,image, price ,date,info,type}=req.body
   
let event=new Event({name,image,price,date,info,type});
    event=await event.save(); 
    res.send("succes")
    });


app.get('/eventView/:id',(req:express.Request,res:express.Response)=>{
   
    
    res.render('eventView');

    })  
    app.get('/free',async(req:express.Request,res:express.Response)=>{
        try{
        let event:IEvent[]|null =await Event.find({type:"free"});
        if(!event){
            res.status(400).json({
                errors:[
                    {
                        msg:'no events found'
                    }
                ]
            })
        } 
        res.render('eventView');  
        } catch(error){
         console.error(error);
         res.status(500).json({
             error:[
                 {
                     msg:'error'
                 }
             ]
         })
        }
        
     })
    


app.post('/upload',[
        body('name').not().isEmpty().withMessage('name is required'),
        body('image').not().isEmpty().withMessage('omg is required'),
        body('price').not().isEmpty().withMessage('pric is required'),
        body('date').not().isEmpty().withMessage('date is required'),
        body('info').not().isEmpty().withMessage('info is required'),
        body('type').not().isEmpty().withMessage('typ is required'),
    ],TokenVerifier,async(req:express.Request,res:express.Response)=>{
       let errors=validationResult(req);
       if(!errors.isEmpty())
       {
        return res.status(401).json({
            errors:errors.array()
        });
    
       }
        try{
        let {name ,image, price ,date,info,type}=req.body
        //check if ann event with same name
        let event:IEvent|null =await Event.findOne({name:name});
        if(event){
            return res.status(401).json({
                errors:[
                    {
                        msg:"evennt exist"
                    }
                ]
            });
        }
        //create event
        event=new Event({name,image,price,date,type,info});
        event=await event.save();
        res.status(200).json({
            msg:' upload eventsuccess'
        })
       } catch(error){
        console.error(error);
        res.status(500).json({
            error:[
                {
                    msg:'error'
                }
            ]
        })
       }
       
    })
    


    
  


app.get('/events',async(req:express.Request,res:express.Response)=>{
    let event:IEvent[]|null =await Event.find();
    res.render('events',{event});
     });



//router config
app.use('/users',userRouter);
app.use('/events',eventRouter);
app.get('**',(req:express.Request,res:express.Response)=>{
    res.render('404')
});
if(port && hostName){
    app.listen(Number(port),hostName,()=>{
         console.log(`server at http://${hostName}:${port}`);
    });
}
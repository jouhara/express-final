import express from 'express';
import TokenVerifier from '../middleware/TokenVerifier';
import {body,validationResult} from 'express-validator';
import { IEvent } from '../models/IEvent';
import Event from '../models/Event';
import mongoose from 'mongoose';


const eventRouter:express.Router=express.Router();

//logic
/*
@usage:upload event
@url:http://127.0.0.1:500/events/upload
method:post
fields:name,date,price,type,info,
access:private */
eventRouter.post('/upload',[
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

eventRouter.get('/free',async(req:express.Request,res:express.Response)=>{
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
     res.status(200).json({
        event:event
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
//update event
eventRouter.put('/update/:eventId' ,TokenVerifier,async(req:express.Request,res:express.Response)=>{
    
    let{eventId}=req.params;
    
    try{
        let UpdatedEvent={
            name:req.body.name,
            image:req.body.image,
            price:req.body.price,
            date:req.body.date,
            info:req.body.info,
            type:req.body.type
        };
        //check if event is exist
        
        let uevent:IEvent|null =await Event.findById(eventId);
        
        if(!uevent){
            return res.status(404).json({
                msg:'event dosnt exist'
            });
        }
        uevent=await Event.findByIdAndUpdate(eventId,{$set:{
            name:UpdatedEvent.name? UpdatedEvent.name:uevent.name,
            image:UpdatedEvent.image? UpdatedEvent.image:uevent.image,
           price:UpdatedEvent.price ?UpdatedEvent.price:uevent.price,

            date:UpdatedEvent.date ?UpdatedEvent.date:uevent.date,
            info:UpdatedEvent.info ?UpdatedEvent.info :uevent.date,
            type:UpdatedEvent.type ? UpdatedEvent.type:uevent.type
        }},{new:true});
        res.status(200).json({
            msg:'updated'
        });
    }catch(error){
        console.error(error);
        res.status(500).json({
            error:[
                {
                    msg:'error'
                }
            ]
        });
    }
})

 eventRouter.get('/pro',async(req:express.Request,res:express.Response)=>{
    try{
        let event:IEvent[]|null =await Event.find({type:"pro"});
        if(!event){
            res.status(400).json({
                errors:[
                    {
                        msg:'no events found'
                    }
                ]
            })
        }    
   
     res.status(200).json({
         event:event
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

 eventRouter.get('/:eventId',async(req:express.Request,res:express.Response)=>{
    try{
   let{eventId}=req.params;
   let event:IEvent|null = await Event.findById(eventId);
   if(!event){
    res.status(400).json({
        errors:[
            {
                msg:'no events found'
            }
        ]
    })
}    
     res.status(200).json({
         event:event
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
export default eventRouter;
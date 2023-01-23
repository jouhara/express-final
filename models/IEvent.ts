import mongoose ,{Document} from 'mongoose';
export interface IEvent extends Document{
  
    name:string;
    image:string;
    price:number;
    date:string;
    info:string;
    type:string;
    createdAAt?:string;
    updatedAt?:string;

}


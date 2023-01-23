import mongoose,{Document} from "mongoose";
export interface IUser extends Document{
    
    name:string;
    email:string;
    password:string;
    avatar:string;
    isAdmin:boolean;
    createdAt?:string;
    updatedAt?:string;
}

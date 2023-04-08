import mongoose from "mongoose";
import validator  from "validator";

const schema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter your Name"],
       
    },
    email:{
        type:String,
        required:[true,"Please Enter Your Email"],
        unique:true,
        validate:validator.isEmail,
        
    },
    message:{
            type:String,
            required:true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
});


export const Request = mongoose.model("Request",schema);
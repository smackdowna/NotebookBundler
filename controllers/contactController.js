import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import  ErrorHandler  from "../utils/errorHandler.js";
import { Contact } from "../models/contact.js";
import { Request } from "../models/request.js";
import twilio from "twilio"

const sid = "AC722ea02ae6962d83e9091b17a22b4bda"
const auth_token = "87ff09d684e031d5c5ec34428fad687d"

const twili = twilio(sid,auth_token);

//Create conatct
export const createContact = catchAsyncError(async(req,res,next)=>{
    
    const{name,email,message} = req.body;
    
    if(!name || !email || !message ) return next(new ErrorHandler("Please add all fields",400));
    
    await Contact.create({
        name,
        email,
        message,
    });

    const contact_name = name

    twili.messages.create({
            from:"+13858992852",
            to:`+918210464851`,
            body:`${contact_name} Has Requested for conatact`
        })
        .then((res) => "")
        .catch((err)=>{})



    res.status(201).json({
        success:true,
        message:"Thank You! We recived Your concern ",
    })
});


//Get All conatct
export const getAllConatct = catchAsyncError(async(req,res,next)=>{


    const conatct = await Contact.find({});
    res.status(200).json({
        success:true,
        conatct,
    })
});


//Create conatct
export const createRequest = catchAsyncError(async(req,res,next)=>{
    
    const{name,email,message} = req.body;
    
    if(!name || !email || !message ) return next(new ErrorHandler("Please add all fields",400));
    
    await Request.create({
        name,
        email,
        message,
    });

    const contact_name = name

    twili.messages.create({
            from:"+13858992852",
            to:`+918210464851`,
            body:`${contact_name} Has Requested for Ebook`
        })
        .then((res) => "")
        .catch((err)=>{})



    res.status(201).json({
        success:true,
        message:"Thank You! We recived Your Request",
    })
});


//Get All conatct
export const getAllRequest = catchAsyncError(async(req,res,next)=>{


    const conatct = await Request.find({});
    res.status(200).json({
        success:true,
        conatct,
    })
});
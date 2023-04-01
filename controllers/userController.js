import ErrorHandler from "../utils/errorHandler.js";
import {User} from "../models/User.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import {Ebooks} from "../models/Ebooks.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { Stats } from "../models/Stats.js";


//Register User
export const register = catchAsyncError(async(req,res,next)=>{
    const {name,email,password}=req.body;
    const file = req.file;

    if(!name || !email || !password || !file) return next(new ErrorHandler("Please Enter all Field",400));

    let user = await User.findOne({email});

    if (user) return next(new ErrorHandler("user already exist",409));

    

    const fileUri = getDataUri(file);

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    user=await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url,
        },
    });

    sendToken(res,user,"Registered Successfully",201);
});


//login User
export const login = catchAsyncError(async(req,res,next)=>{

    const {email,password}=req.body;

    if(!email || !password) return next(new ErrorHandler("Please Enter all Field",400));

    const user = await User.findOne({email}).select("+password");

    if (!user) return next(new ErrorHandler("Incorrect Email or Password",401));

    //upload file in cloudinary

    const isMatch = await user.comparePassword(password);

    if(!isMatch)
        return next(new ErrorHandler("Incorrect Email or Password",401))


    sendToken(res,user,`Welcome Back, ${user.name}`,200);
});



//logout
export const logout = catchAsyncError(async (req,res,next) =>{
    res.status(200).cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
        secure:true,
        sameSite:"none",
    })
    .json({
        success:true,
        message:"Logged out Successfully",
    })
});



//get my profile
export const getMyProfile = catchAsyncError(async (req,res,next) =>{
    
    const user = await User.findById(req.user._id);    
    res.status(200).json({
        success:true,
        user,
    });
});


//changed password
export const changePassword = catchAsyncError(async (req,res,next) =>{

    const{oldPassword,newPassword} = req.body;

    if(!oldPassword || !newPassword) return next(new ErrorHandler("Please Enter all Field",400));

    
    const user = await User.findById(req.user._id).select("+password");
    
    const isMatch = await user.comparePassword(oldPassword);
    
    if(!isMatch) return next(new ErrorHandler("Incorrect Old Password",400));

    user.password = newPassword;

    await user.save();


    res.status(200).json({
        success:true,
        message:"Password changed succesfully",
    });
});


//update profile
export const updateProfile = catchAsyncError(async (req,res,next) =>{

    const{name,email} = req.body;

    const user = await User.findById(req.user._id);

    if(name)user.name = name;
    if(email)user.email=email;

    await user.save();


    res.status(200).json({
        success:true,
        message:"Profile Updated succesfully",
    });
});


//update profile picture
export const updateprofilepicture = catchAsyncError(async(req,res,next)=>{

    const file = req.file;

    const user = await User.findById(req.user._id);

    const fileUri = getDataUri(file);

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar ={
        public_id:mycloud.public_id,
        url:mycloud.secure_url
    };

    await user.save();


    res.status(200).json({
        success:true,
        message:"Profile picture updated successfully",
    })
});


//forgot password
export const forgotPassword = catchAsyncError(async(req,res,next)=>{
    
        const{email} = req.body;

        const user = await User.findOne({email});
    
        if(!user) return next(new ErrorHandler("User Not Found",400));
    
    
        const resetToken = await user.getResetToken(); 

        await user.save();
    
    
        const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    
        const message = `Click on the link to reset your password.${url}. if you have not requested than please ignore`
    
        await sendEmail(user.email,"NoteBook Reset Password",message);
    
    
    
        res.status(200).json({
            success:true,
            message:`Reset Token Has Been sent To ${user.email}`,
        })
});


//Reset password
export const resetPassword = catchAsyncError(async(req,res,next)=>{

    const {token} = req.params;

    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            $gt:Date.now(),
        },
    });

    if(!user) return next(new ErrorHandler("Token is Invalid or has been Expired"));

    user.password=req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();


    res.status(200).json({
        success:true,
        message:'Password changed Successfully',
        
    })
});


//Add to favourite
export const addToFavourite = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user._id);

    const ebook = await Ebooks.findById(req.body.id);

    if(!ebook) return next(new ErrorHandler("Invalid Book ID",404));

    const itemExist = user.favourite.find((item)=>{
        if(item.ebook.toString() === ebook._id.toString()) return true;
    });

    if(itemExist) return next(new ErrorHandler("Already Added to Favourite",409)); 

    user.favourite.push({
        ebook:ebook._id,
        poster:ebook.poster.url
    });

    await user.save();

    res.status(200).json({
        success:true,
        message:"Added to Favourite",
    })

});


//Delete from favourite
export const removeFromFavourite = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user._id);

    const ebook = await Ebooks.findById(req.query.id);

    if(!ebook) return next(new ErrorHandler("Invalid Book ID",404));

    const newFavourite = user.favourite.filter((item) => {
        if(item.ebook.toString() !== ebook._id.toString()) return item;
    })

    user.favourite = newFavourite;
    await user.save();

    res.status(200).json({
        success:true,
        message:"Removed From Favourite",
    })
});


//get All users --Admin
export const getAllUsers = catchAsyncError(async(req,res,next)=>{
    const users = await User.find();

    res.status(200).json({
        success:true,
        users,
    });
});


//update user role--Admin
export const updateUserRole = catchAsyncError(async(req,res,next)=>{
    
    const user = await User.findById(req.params.id);

    if(!user) return next(new ErrorHandler("User Not Found",404));

    if(user.role === "user") user.role = "admin";
    else user.role = "user";

    await user.save();

    res.status(200).json({
        success:true,
        message:"Role Updated"
    });
});


//delete User
export const deleteUser = catchAsyncError(async(req,res,next)=>{
    
    const user = await User.findById(req.params.id);

    if(!user) return next(new ErrorHandler("User Not Found",404));

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);



    await user.deleteOne();

    res.status(200).json({
        success:true,
        message:"User Deleted Successfully",
    });
});


//delete User
export const deleteMyProfile = catchAsyncError(async(req,res,next)=>{
    
    const user = await User.findById(req.user._id);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);



    await user.deleteOne();

    res.status(200).cookie("token",null,{
        expires:new Date(Date.now())
    }).json({
        success:true,
        message:"User Deleted Successfully",
    });
});


User.watch().on("change",async() => {

    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1);

    stats[0].users = await User.countDocuments();
    stats[0].createdAt = new Date(Date.now());

    await stats[0].save();

});
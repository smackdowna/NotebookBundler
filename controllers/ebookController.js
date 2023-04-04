import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import {Ebooks} from "../models/Ebooks.js";
import getDataUri from "../utils/dataUri.js";
import  ErrorHandler  from "../utils/errorHandler.js";
import cloudinary from "cloudinary";
import { Stats } from "../models/Stats.js";


//Get All Ebooks
export const getAllEbooks = catchAsyncError(async(req,res,next)=>{

    const keyword = req.query.keyword || "";
    const category = req.query.category || "";

    const ebooks = await Ebooks.find({
        title:{
            $regex:keyword,
            $options:"i"
        },category:{
            $regex:keyword,
            $options:"i"  
        }
    });
    res.status(200).json({
        success:true,
        ebooks,
    })
});



//Create Ebook 
export const createEbook = catchAsyncError(async(req,res,next)=>{
    
    const{title,description,category,createdBy} = req.body;

    if(!title || !description || !category || !createdBy) return next(new ErrorHandler("Please add all fields",400));

    // for PDF
    const file = req.file;

    const fileUri = getDataUri(file);

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await Ebooks.create({
        title,
        description,
        category,
        createdBy,
        poster:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url,
        }
    });


    res.status(201).json({
        success:true,
        message:"Ebooks Created succesfully, You can add PDf Now",
    })
});


//get a ebook
export const getEbook = catchAsyncError(async(req,res,next)=>{
    
    const ebook = await Ebooks.findById(req.params.id);

    if(!ebook) return next(new ErrorHandler("Ebook Not Found",404));

    ebook.views+=1;

    await ebook.save();


    res.status(200).json({
        success:true,
        ebook,
    })

});



//Delete Ebook 
export const deleteEbook = catchAsyncError(async(req,res,next)=>{
    
    const {id} = req.params;

    const ebooks = await Ebooks.findById(id);

    if(!ebooks) return next(new ErrorHandler("Ebook Not found",404));

    await cloudinary.v2.uploader.destroy(ebooks.bookLink.public_id);
    
    await ebooks.deleteOne();

    res.status(200).json({
        success:true,
        message:"Ebook Deleted Successfully",
    })
});



//Add PDF
export const AddPdf = catchAsyncError(async(req,res,next)=>{
    
    const { id } = req.params;

    const ebook = await Ebooks.findById(id);

    if(!ebook) return next(new ErrorHandler("Ebook Not Found",400));

    // for PDF
    const file = req.file;

    const fileUri = getDataUri(file);

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    ebook.bookLink=({
        public_id:mycloud.public_id,
        url:mycloud.secure_url,
    });

    await ebook.save();

    res.status(201).json({
        success:true,
        message:"Pdf Added",
    })
});



//ADd discussion
export const addComment = catchAsyncError(async(req,res,next)=>{

    const { id } = req.params;
    const {comment} = req.body;

    const review = {
        user:req.user._id,
        name:req.user.name,
        comment,
    };

    const ebook = await Ebooks.findById(id);

    const isReviewed = ebook.discuss.find((rev)=> rev.user.toString()===req.user._id.toString());

   if(isReviewed){
        ebook.discuss.forEach((rev) => {
            if(rev.user.toString() === req.user._id.toString())
                (rev.comment = comment);
        });
    }
    else{
        ebook.discuss.push(review);
    }

    await ebook.save();

    res.status(200).json({
        success:true,
    });
});



Ebooks.watch().on("change",async() => {

    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1);

    const ebooks = await Ebooks.find({});

     let totalViews = 0;

    for (let i = 0; i<ebooks.length;i++){
        totalViews += ebooks[i].views;
    };

    stats[0].views = totalViews;
    stats[0].createdAt = new Date(Date.now());

    await stats[0].save();


});

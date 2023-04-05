import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Please Enter your Book Name"],
        minLength:[4,"Title Must be atleast 4 character"],
        maxLength:[80,"Title can't exceed 80 character"]
    },
    description:{
        type:String,
        required:[true,'Please entere book description'],
        minLength:[20,"title must be at least 20 character"],
    },
    bookLink:{
            type:String,
            required:true,
        },
    poster:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        },
    },
    views:{
        type:Number,
        default:0,
    },
    discuss:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required:true
            },
            name:{
                type:String,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required:true,
    },
    createdBy:{
        type:String,
        required:[true,'Enter book Creator name']
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
});


export const Ebooks = mongoose.model("Ebooks",schema);
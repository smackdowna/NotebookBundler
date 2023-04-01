import express from "express";
import {config} from "dotenv";
import ErrorMiddleware from "./middlewares/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config({
    path:"./config/config.env",
})

const app = express();

//using mddlewares
app.use(express.json());
app.use(
    express.urlencoded({
        extended:true,
    })
);

app.use(cookieParser());
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
    methods:["GET","POST","PUT","DELETE"]
}))


//Importing and using Routes
import ebook from "./routes/ebookRoutes.js"
import user from "./routes/userRoutes.js"
import stats from "./routes/otherRoutes.js"


app.use("/api/v1/",ebook);
app.use("/api/v1/",user);
app.use("/api/v1/",stats);



export default app;

app.use(ErrorMiddleware);
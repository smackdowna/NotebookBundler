import express  from "express";
import {  addComment, createEbook, deleteEbook, getAllComment, getAllEbooks, getEbook } from "../controllers/ebookController.js";
import { authorizeAdmmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();


//get all ebook
router.route("/ebooks").get(getAllEbooks);

//create ebook
router.route("/createebooks").post(isAuthenticated,authorizeAdmmin,singleUpload,createEbook);

//get a single ebook and ADD PDF
router.route("/ebook/:id")
    .get(isAuthenticated,getEbook)
    .delete(isAuthenticated,authorizeAdmmin,deleteEbook);



router.route("/review/:id").put(isAuthenticated, addComment).get(getAllComment);

export default router;
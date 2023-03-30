import express  from "express";
import { createEbook, deleteEbook, getAllEbooks, getEbook } from "../controllers/ebookController.js";
import { authorizeAdmmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();


//get all ebook
router.route("/ebooks").get(getAllEbooks);

//create ebook
router.route("/createebooks").post(isAuthenticated,authorizeAdmmin,singleUpload,createEbook);

//get a single ebook
router.route("/ebook/:id")
    .get(isAuthenticated,getEbook)
    .delete(isAuthenticated,authorizeAdmmin,deleteEbook);






export default router;
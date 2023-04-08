import express  from "express";
import { authorizeAdmmin, isAuthenticated } from "../middlewares/auth.js";
import { createContact, createRequest, getAllConatct, getAllRequest } from "../controllers/contactController.js";


const router = express.Router();


//create conatct
router.route("/createcontact").post(createContact);

//get all contact
router.route("/getcontact").get(getAllConatct);

//create request
router.route("/createrequest").post(createRequest);

//get all request
router.route("/getreq").get(getAllRequest);



export default router;
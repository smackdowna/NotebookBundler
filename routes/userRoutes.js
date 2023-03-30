import express  from "express";
import { addToFavourite, changePassword, deleteMyProfile, deleteUser, forgotPassword, getAllUsers, getMyProfile, login, logout, register, removeFromFavourite, resetPassword, updateProfile, updateprofilepicture, updateUserRole } from "../controllers/userController.js";
import { authorizeAdmmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();



//register user
router.route("/register").post(singleUpload,register);

//login user
router.route("/login").post(login);

//logout user
router.route("/logout").get(logout);

//get my profile
router.route("/me")
    .get(isAuthenticated,getMyProfile)
    .delete(isAuthenticated,deleteMyProfile);

//changed password
router.route("/changepassword").put(isAuthenticated, changePassword);

//update profile
router.route("/updateprofile").put(isAuthenticated, updateProfile);


////update profilepic
router.route("/updateprofilepicture").put(isAuthenticated, singleUpload,updateprofilepicture);

//forgot password
router.route("/forgotpassword").post(forgotPassword);


//forgot password
router.route("/resetpassword/:token").put(resetPassword);

//Add to favourite
router.route("/addtofavourite").post(isAuthenticated,addToFavourite);


//remove from favourite
router.route("/removeFromFavourite").delete(isAuthenticated,removeFromFavourite);


//Get All Users---Admin
router.route("/admin/users").get(isAuthenticated,authorizeAdmmin,getAllUsers);

//update user role -Admin
router.route("/admin/user/:id")
    .put(isAuthenticated,authorizeAdmmin,updateUserRole)
    .delete(isAuthenticated,authorizeAdmmin,deleteUser);




export default router;
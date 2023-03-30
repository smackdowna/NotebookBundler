import express  from "express";
import { getDashboardStats } from "../controllers/otherControllers.js";
import { authorizeAdmmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

//stats

//get my profile
router.route("/admin/stats").get(isAuthenticated,authorizeAdmmin,getDashboardStats);

export default router;
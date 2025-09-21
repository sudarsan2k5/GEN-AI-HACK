import { Router } from "express";
import { login, signup, getUserInfo, updateProfile,addProfileImage,removeProfileImage,logout} from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";




const authRoutes = Router();
const upload =multer({dest:"uploads/profiles/"});

// ✅ Auth routes
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);

// ✅ Protected routes
authRoutes.get("/user-info", verifyToken, getUserInfo);
authRoutes.put("/update-profile", verifyToken, updateProfile);
authRoutes.post("/add-profile-image",verifyToken,upload.single("profile-image"),addProfileImage);
authRoutes.delete("/remove-profile-image",verifyToken,removeProfileImage);
authRoutes.post("/logout",logout);

export default authRoutes;





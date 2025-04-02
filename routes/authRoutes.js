const express = require("express");
const { register, login, getProfile, updateProfile, forgetPassword, resetPassword, refreshToken, logout,updateProfileImage, requestReset, verifyOtp, resetPasswordPatient } = require("../controllers/authController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const { upload } = require("../lib/cloudinaryConfig");

const router = express.Router();

router.post("/request-reset", requestReset);
router.post("/verify-otp", verifyOtp);
router.post("/reset-passwordPatient",resetPasswordPatient);
router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/updateProfile",upload.none(),authMiddleware, updateProfile);
router.put("/updateProfileImage", upload.single("image"),authMiddleware, updateProfileImage);

router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", authMiddleware, resetPassword);
router.post("/refreshToken", refreshToken );
router.post("/logout", logout, authMiddleware);



module.exports = router;
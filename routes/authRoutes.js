const express = require("express");
const { register, login, getProfile, updateProfile, forgetPassword, resetPassword } = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const { upload } = require("../lib/cloudinaryConfig");

const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile/:idUser", upload.single("image"), updateProfile);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", authMiddleware, resetPassword);


module.exports = router;
const express = require("express");
const { register, login, getProfile, updateProfile, forgetPassword, resetPassword } = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/forget-password",  forgetPassword);
router.post("/reset-password/:token", authMiddleware, resetPassword);


module.exports = router;
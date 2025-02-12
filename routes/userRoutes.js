const express = require('express');
const { viewUserDetails, deleteUserProfile } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:id', viewUserDetails);

module.exports = router;
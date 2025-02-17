const express = require('express');
const { viewUserDetails, getUsers } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/Users',getUsers );
router.get('/:id', viewUserDetails);

module.exports = router;
const express = require('express');
const router = express.Router();
const { addPrivateEngagement, updateEngagement, deleteEngagement, getEngagement } = require('../controllers/PrivateEngagementController');
const { authMiddleware } = require('../middlewares/authMiddleware');
// Add a new private engagement
router.post('/',authMiddleware, addPrivateEngagement);

// Update a private engagement
router.put('/:id', updateEngagement);

// Delete a private engagement
router.delete('/:id', deleteEngagement);

// Get private engagements for a doctor
router.get('/',authMiddleware, getEngagement);

module.exports = router;
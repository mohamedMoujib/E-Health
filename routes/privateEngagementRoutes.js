const express = require('express');
const router = express.Router();
const { addPrivateEngagement, updateEngagement, deleteEngagement, getEngagement } = require('../controllers/PrivateEngagementController');
// Add a new private engagement
router.post('/', addPrivateEngagement);

// Update a private engagement
router.put('/:id', updateEngagement);

// Delete a private engagement
router.delete('/:id', deleteEngagement);

// Get private engagements for a doctor
router.get('/:doctorId', getEngagement);

module.exports = router;
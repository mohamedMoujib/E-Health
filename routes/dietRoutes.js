const express = require('express');
const router = express.Router();
const dietController = require('../controllers/dietController');

router.post('/:medicalFileId', dietController.addDiet);
router.get('/:medicalFileId/:itemId', dietController.getDietDetails);

module.exports = router;

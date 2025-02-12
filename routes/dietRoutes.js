const express = require('express');
const router = express.Router();
const dietController = require('../controllers/dietController');

router.post('/medical-file/:medicalFileId', dietController.addDiet);
router.get('/medical-file/:medicalFileId/:itemId', dietController.getDietDetails);

module.exports = router;

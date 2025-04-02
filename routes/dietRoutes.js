const express = require('express');
const router = express.Router();
const dietController = require('../controllers/dietController');

router.post('/', dietController.addDiet);
router.get('/:medicalFileId/:itemId', dietController.getDietDetails);
router.get('/:id', dietController.getDietsbyPatient);


module.exports = router;

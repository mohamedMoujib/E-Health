const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

router.post('/medical-file/:medicalFileId', documentController.addDocument);
router.get('/medical-file/:medicalFileId/:itemId', documentController.getDocumentDetails);

module.exports = router;

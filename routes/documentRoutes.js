const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { uploadDocument } = require('../lib/cloudinaryConfig');


router.post('/:medicalFileId', uploadDocument.single('file'), documentController.addDocument);
router.get('/:medicalFileId/:itemId', documentController.getDocumentDetails);

module.exports = router;

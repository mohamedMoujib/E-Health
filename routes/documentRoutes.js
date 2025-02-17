const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

router.post('/:medicalFileId', documentController.addDocument);
router.get('/:medicalFileId/:itemId', documentController.getDocumentDetails);

module.exports = router;

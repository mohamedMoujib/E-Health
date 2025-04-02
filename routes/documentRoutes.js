const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { upload } = require("../lib/cloudinaryConfig");

router.post('/',upload.single("image"), documentController.addDocument);
router.get('/:medicalFileId/:itemId', documentController.getDocumentDetails);
router.get('/:id', documentController.getDocumentsbyPatient);
module.exports = router;

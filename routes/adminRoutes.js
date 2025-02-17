const express = require('express');
const router = express.Router();
const { confirmDoctor, deleteDoctor, getDoctorsPending } = require("../controllers/adminController");

router.get('/pending',getDoctorsPending);
router.put('/confirm',confirmDoctor);
router.delete('/delete',deleteDoctor);

module.exports = router;
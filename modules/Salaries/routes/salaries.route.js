const express = require('express');
const router = express.Router();
const Salaries = require('../services/salaries.service');
const validateSalaries = require('../validation/salaries.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllSalaries' , verifyToken, checkPermission('user.create'),Salaries.getAllSalaries);

router.get('/getSalariesById/:Id' , verifyToken, checkPermission('user.create'),Salaries.getSalariesById);

router.post('/createSalaries' , verifyToken , checkPermission('user.create') ,validateSalaries, Salaries.createSalaries);

router.put('/updateSalaries/:id' , verifyToken , checkPermission('user.create'),validateSalaries , Salaries.updateSalaries);

router.delete('/deleteSalaries/:id' , verifyToken , checkPermission('user.create') , Salaries.deleteSalaries);


module.exports = router;

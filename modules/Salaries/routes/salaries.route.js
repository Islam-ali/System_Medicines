const express = require('express');
const router = express.Router();
const Salaries = require('../services/salaries.service');
const validateSalaries = require('../validation/salaries.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllSalaries' , verifyToken, checkPermission('user.read'),Salaries.getAllSalaries);

router.get('/getSalariesById/:Id' , verifyToken, checkPermission('user.read'),Salaries.getSalariesById);

router.post('/createSalaries' , verifyToken , checkPermission('user.create') ,validateSalaries, Salaries.createSalaries);

router.put('/updateSalaries/:id' , verifyToken , checkPermission('user.update'),validateSalaries , Salaries.updateSalaries);

router.delete('/deleteSalaries/:id' , verifyToken , checkPermission('user.delete') , Salaries.deleteSalaries);


module.exports = router;

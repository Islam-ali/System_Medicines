const express = require('express');
const router = express.Router();
const Salaries = require('../services/dr-services.service');
const validateSalaries = require('../validation/dr-services.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllServices' , verifyToken, checkPermission('clients.read'),Salaries.getAllServices);

router.get('/getServiceById/:Id' , verifyToken, checkPermission('clients.read'),Salaries.getServiceById);

router.post('/createService' , verifyToken , checkPermission('clients.create') ,validateSalaries, Salaries.createService);

router.put('/updateService/:id' , verifyToken , checkPermission('clients.update'),validateSalaries , Salaries.updateService);

router.delete('/deleteService/:id' , verifyToken , checkPermission('clients.delete') , Salaries.deleteService);


module.exports = router;

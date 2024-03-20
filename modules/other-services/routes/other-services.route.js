const express = require('express');
const router = express.Router();
const otherServices = require('../services/other-services.service');
const validateOtherServices = require('../validation/other-services.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllOtherServices' , verifyToken, checkPermission('clients.read'),otherServices.getAllOtherServices);

router.get('/getOtherServiceById/:Id' , verifyToken, checkPermission('clients.read'),otherServices.getOtherServiceById);

router.post('/createOtherService' , verifyToken , checkPermission('clients.create') ,validateOtherServices, otherServices.createOtherService);

router.put('/updateOtherService/:id' , verifyToken , checkPermission('clients.update'),validateOtherServices , otherServices.updateOtherService);

router.delete('/deleteOtherService/:id' , verifyToken , checkPermission('clients.delete') , otherServices.deleteOtherService);


module.exports = router;

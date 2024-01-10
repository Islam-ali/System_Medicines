const express = require('express');
const router = express.Router();
const typeOfFactory = require('../services/typeOfFactory.service');
const validateTypeOfFactory = require('../validation/typeOfFactory.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getTypeOfFactories' , verifyToken, checkPermission('admin'),typeOfFactory.getTypeOfFactories);

router.get('/getTypeOfFactoryById/:id' , verifyToken, checkPermission('admin'),typeOfFactory.getTypeOfFactoryById);

router.get('/getListOfTypesFactoryByClassificationId/:id' , verifyToken, checkPermission('admin'),typeOfFactory.getListOfTypesFactoryByClassificationId);

router.post('/createTypeOfFactory' , verifyToken , checkPermission('admin') ,validateTypeOfFactory, typeOfFactory.createTypeOfFactory);

router.put('/updateTypeOfFactory/:id' , verifyToken , checkPermission('admin'),validateTypeOfFactory , typeOfFactory.updateTypeOfFactory);

router.delete('/deleteTypeOfFactory/:id' , verifyToken , checkPermission('admin') , typeOfFactory.deleteTypeOfFactory);


module.exports = router;

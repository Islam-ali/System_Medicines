const express = require('express');
const router = express.Router();
const typeOfFactory = require('../services/typeOfFactory.service');
const validateTypeOfFactory = require('../validation/typeOfFactory.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getTypeOfFactories' , verifyToken, checkPermission("typeOfFactory.read"), typeOfFactory.getTypeOfFactories);

router.get('/getTypeOfFactoryById/:id' , verifyToken, checkPermission("typeOfFactory.read"), typeOfFactory.getTypeOfFactoryById);

router.get('/getListOfTypesFactoryByClassificationId/:id' , verifyToken, checkPermission("typeOfFactory.read"), typeOfFactory.getListOfTypesFactoryByClassificationId);

router.post('/createTypeOfFactory' , verifyToken  , checkPermission("typeOfFactory.create"),validateTypeOfFactory, typeOfFactory.createTypeOfFactory);

router.put('/updateTypeOfFactory/:id' , verifyToken , checkPermission("typeOfFactory.update"),validateTypeOfFactory , typeOfFactory.updateTypeOfFactory);

router.delete('/deleteTypeOfFactory/:id' , verifyToken  , checkPermission("typeOfFactory.delete"), typeOfFactory.deleteTypeOfFactory);


module.exports = router;

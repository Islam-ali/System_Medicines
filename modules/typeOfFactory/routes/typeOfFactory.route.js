const express = require('express');
const router = express.Router();
const typeOfFactory = require('../services/typeOfFactory.service');
const validateTypeOfFactory = require('../validation/typeOfFactory.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getTypeOfFactories' , verifyToken,typeOfFactory.getTypeOfFactories);

router.get('/getTypeOfFactoryById/:id' , verifyToken,typeOfFactory.getTypeOfFactoryById);

router.get('/getListOfTypesFactoryByClassificationId/:id' , verifyToken,typeOfFactory.getListOfTypesFactoryByClassificationId);

router.post('/createTypeOfFactory' , verifyToken  ,validateTypeOfFactory, typeOfFactory.createTypeOfFactory);

router.put('/updateTypeOfFactory/:id' , verifyToken ,validateTypeOfFactory , typeOfFactory.updateTypeOfFactory);

router.delete('/deleteTypeOfFactory/:id' , verifyToken  , typeOfFactory.deleteTypeOfFactory);


module.exports = router;

const express = require('express');
const router = express.Router();
const typeOfFactory = require('../services/typeOfFactory.service');
const validateTypeOfFactory = require('../validation/typeOfFactory.validation')
const {verifyToken,checkUserRole} = require('../../../middelware/auth.middleware')

router.get('/getTypeOfFactories' , verifyToken, checkUserRole('admin'),typeOfFactory.getTypeOfFactories);

router.get('/getListOfTypesFactoryByClassificationId/:id' , verifyToken, checkUserRole('admin'),typeOfFactory.getListOfTypesFactoryByClassificationId);

router.post('/createTypeOfFactory' , verifyToken , checkUserRole('admin') ,validateTypeOfFactory, typeOfFactory.createTypeOfFactory);

router.put('/updateTypeOfFactory/:id' , verifyToken , checkUserRole('admin'),validateTypeOfFactory , typeOfFactory.updateTypeOfFactory);

router.delete('/deleteTypeOfFactory/:id' , verifyToken , checkUserRole('admin') , typeOfFactory.deleteTypeOfFactory);


module.exports = router;

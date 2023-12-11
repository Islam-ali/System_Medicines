const express = require('express');
const router = express.Router();
const typeOfFactory = require('../services/typeOfFactory.service');
const {verifyToken,checkUserRole} = require('../../../middelware/auth.middleware')

router.get('/getTypeOfFactories' , verifyToken, checkUserRole('admin'),typeOfFactory.getTypeOfFactories);

router.post('/createTypeOfFactory' , verifyToken , checkUserRole('admin') , typeOfFactory.createTypeOfFactory);

router.put('/updateTypeOfFactory/:id' , verifyToken , checkUserRole('admin') , typeOfFactory.updateTypeOfFactory);

router.delete('/deleteTypeOfFactory/:id' , verifyToken , checkUserRole('admin') , typeOfFactory.deleteTypeOfFactory);


module.exports = router;

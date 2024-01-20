const express = require('express');
const router = express.Router();
const sale = require('../services/sale.service');
const validateSale = require('../validation/sale.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllSale' , verifyToken, checkPermission('user.create'),sale.getAllSale);

router.get('/getSaleById/:Id' , verifyToken, checkPermission('user.create'),sale.getSaleById);

router.post('/createSale' , verifyToken , checkPermission('user.create') ,validateSale, sale.createSale);

router.put('/updateSale/:id' , verifyToken , checkPermission('user.create'),validateSale , sale.updateSale);

router.delete('/deleteSale/:id' , verifyToken , checkPermission('user.create') , sale.deleteSale);


module.exports = router;

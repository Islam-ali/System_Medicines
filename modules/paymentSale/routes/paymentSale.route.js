const express = require('express');
const router = express.Router();
const paymentSale = require('../services/paymentSale.service');
const validatepaymentSale = require('../validation/paymentSale.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllPaymentSale' , verifyToken, checkPermission('user.create'),paymentSale.getAllPaymentSale);

router.get('/getPaymentSaleById/:Id' , verifyToken, checkPermission('user.create'),paymentSale.getPaymentSaleById);

router.post('/createPaymentSale' , verifyToken , checkPermission('user.create') ,validatepaymentSale, paymentSale.createPaymentSale);

router.put('/updatePaymentSale/:id' , verifyToken , checkPermission('user.create'),validatepaymentSale , paymentSale.updatePaymentSale);

router.delete('/deletePaymentSale/:id' , verifyToken , checkPermission('user.create') , paymentSale.deletePaymentSale);


module.exports = router;

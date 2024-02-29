const express = require('express');
const router = express.Router();
const paymentSale = require('../services/paymentSale.service');
const validatepaymentSale = require('../validation/paymentSale.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllPaymentSale' , verifyToken, checkPermission('paymentClient.read'),paymentSale.getAllPaymentSale);

router.get('/getPaymentSaleById/:Id' , verifyToken, checkPermission('paymentClient.read'),paymentSale.getPaymentSaleById);

router.post('/createPaymentSale' , verifyToken , checkPermission('paymentClient.create') ,validatepaymentSale, paymentSale.createPaymentSale);

router.put('/updatePaymentSale/:id' , verifyToken , checkPermission('paymentClient.update'),validatepaymentSale , paymentSale.updatePaymentSale);

router.delete('/deletePaymentSale/:id' , verifyToken , checkPermission('paymentClient.delete') , paymentSale.deletePaymentSale);


module.exports = router;

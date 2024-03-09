const express = require('express');
const router = express.Router();
const paymentClient = require('../services/paymentClient.service');
const validatepaymentClient = require('../validation/paymentClient.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllPaymentClient' , verifyToken, checkPermission('paymentClient.read'),paymentClient.getAllPaymentClient);

router.get('/getPaymentClientById/:Id' , verifyToken, checkPermission('paymentClient.read'),paymentClient.getPaymentClientById);

router.post('/createPaymentClient' , verifyToken , checkPermission('paymentClient.create') ,validatepaymentClient, paymentClient.createPaymentClient);

router.put('/updatePaymentClient/:id' , verifyToken , checkPermission('paymentClient.update'),validatepaymentClient , paymentClient.updatePaymentClient);

router.delete('/deletePaymentClient/:id' , verifyToken , checkPermission('paymentClient.delete') , paymentClient.deletePaymentClient);


module.exports = router;

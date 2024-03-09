const express = require('express');
const router = express.Router();
const invoice = require('../services/invoice.service');
const validateinvoice = require('../validation/invoice.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllInvoice' , verifyToken, checkPermission('paymentClient.read'),invoice.getAllInvoice);

router.get('/getInvoiceById/:Id' , verifyToken, checkPermission('paymentClient.read'),invoice.getInvoiceById);

router.post('/createInvoice' , verifyToken , checkPermission('paymentClient.create') ,validateinvoice, invoice.createInvoice);

router.put('/updateInvoice/:id' , verifyToken , checkPermission('paymentClient.update'),validateinvoice , invoice.updateInvoice);

router.delete('/deleteInvoice/:id' , verifyToken , checkPermission('paymentClient.delete') , invoice.deleteInvoice);


module.exports = router;

const express = require('express');
const router = express.Router();
const sale = require('../services/sale.service');
const validateSale = require('../validation/sale.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get(
  "/getAllSales",
  verifyToken,
  checkPermission("sale.read"),
  sale.getAllSales
);

router.get('/getAllSalesByClientId/:clientId' , verifyToken, checkPermission('sale.read'),sale.getAllSalesByClientId);


router.get('/getSaleById/:Id' , verifyToken, checkPermission('sale.read'),sale.getSaleById);

router.post('/createSale' , verifyToken , checkPermission('sale.create') ,validateSale, sale.createSale);

router.put(
  "/updateSale/:id",
  verifyToken,
  checkPermission("sale.update"),
  validateSale,
  sale.updateSale
);

router.delete('/deleteSale/:id' , verifyToken , checkPermission('sale.delete') , sale.deleteSale);


module.exports = router;

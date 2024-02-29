const express = require('express');
const router = express.Router();
const client = require('../services/client.service');
const validateclient = require('../validation/client.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllClient' , verifyToken, checkPermission('clients.read'),client.getAllClient);

router.get('/getClientsByTypeOfClientId/:typeOfClientId' , verifyToken, checkPermission('clients.read'),client.getClientsByTypeOfClientId);

router.get('/getClientById/:id' , verifyToken, checkPermission('clients.read'),client.getClientById);

router.post('/createClient' , verifyToken , checkPermission('clients.create') ,validateclient, client.createClient);

router.put(
  "/updateClient/:id",
  verifyToken,
  checkPermission("clients.update"),
  validateclient,
  client.updateClient
);

router.delete(
  "/deleteClient/:id",
  verifyToken,
  checkPermission("clients.delete"),
  client.deleteClient
);

router.get(
  "/getLogClient",
  verifyToken,
  checkPermission("clients.create"),
  client.getLogClient
);

module.exports = router;

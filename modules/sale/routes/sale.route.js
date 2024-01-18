const express = require('express');
const router = express.Router();
const city = require('../services/city.service');
const validateCity = require('../validation/city.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllCity' , verifyToken, checkPermission('user.create'),city.getAllCity);

router.get('/getCityByGovernmentId/:governmentId' , verifyToken, checkPermission('user.create'),city.getCityByGovernmentId);

router.post('/createCity' , verifyToken , checkPermission('user.create') ,validateCity, city.createCity);

router.put('/updateCity/:id' , verifyToken , checkPermission('user.create'),validateCity , city.updateCity);

router.delete('/deleteCity/:id' , verifyToken , checkPermission('user.create') , city.deleteCity);


module.exports = router;

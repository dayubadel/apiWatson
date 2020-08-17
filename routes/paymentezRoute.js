var express = require('express')
var router = express.Router();
var paymentezController = require('./../controllers/paymentezController')


router.get('/', paymentezController.GetFormulario)
router.post('/respuestapago', paymentezController.RespuestaPago)

module.exports = router;
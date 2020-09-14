var express = require('express')
var router = express.Router();
var paymentezController = require('./../controllers/paymentezController')

router.get('/', paymentezController.GetFormulario)
router.get('/ws', paymentezController.WSFacturacion)
router.post('/respuestapago', paymentezController.RespuestaPago)
router.post('/gestionfactura', paymentezController.GestionFactura)

module.exports = router;
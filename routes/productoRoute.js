var express = require('express')
var router = express.Router();
var productController = require('./../controllers/productoController')


router.post('/', productController.RegistrarProductos)
router.get('/entidades', productController.ActualizarEntidades)

module.exports = router;
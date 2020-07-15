const express = require('express');
const router = express.Router();

//Pedir la logica al controlador
const watsonController = require('./../controllers/watsonController');

//Rutas
router.post('/', watsonController.ControlMensajes);

//Exportar rutas
module.exports = router;
const mssql = require('mssql');
const { sql } = require('../config/config');
const Producto = require('../models/productoModel');
var request = new mssql.Request();

var sqlProductoController = {}

//Funciones SQL

sqlProductoController.gestionProductos = async(arrProductos) =>{
    let query = '',
        resultSQL = {};

    arrProductos.forEach(objProducto => {
        // let objProducto = new Producto({})
        query = `${query}

            EXEC [dbo].[sp_GestionProductos]
                    @idMarcaVtex = ${objProducto.marca.idMarca},
                    @nombreMarca = N'${objProducto.marca.marca}',
                    @idVitex = ${objProducto.idVitex},
                    @nombreProducto = N'${objProducto.nombre}',
                    @idRefSAP = ${objProducto.idRefSAP},
                    @stockCC = ${objProducto.stockCC},
                    @stockOtroPago = ${objProducto.stockOtroPago},
                    @precioCC = ${objProducto.precioCC},
                    @precioOtroPago = ${objProducto.precioOtroPago},
                    @interesCC = ${objProducto.interesCC},
                    @interesOtroPago = ${objProducto.interesOtroPago},
                    @activo = ${objProducto.activo},
                    @visible = ${objProducto.visible},
                    @fechaCreacionWs = N'${objProducto.fechaCreacionWS}',
                    @fechaModificaWs = N'${objProducto.fechaCreacionWS}',
                    @arrImagenes = N'${JSON.stringify(objProducto.imagenes)}',
                    @arrCaracteristicas = N'${JSON.stringify(objProducto.caracteristicas).replace(/[{}"]+/g,'')}'    

        `
    });


    await request.query(query)
    .then(async data => {
        // console.log(data)
        // if (data.recordset != undefined && data.recordset.length > 0) {
        //     // resultSQL = {
        //     //     idClienteCanalMensajeria : data.recordset[0].idClienteCanalMensajeria,
        //     //     contexto : data.recordset[0]. contexto
        //     // }

        // } else {
        //     // resultSQL = {}
        // }
    })
    .catch(err => {

        console.log("error al registrar productos en bd")
        console.log(err)
    })

    // console.log(query)
}


module.exports = sqlProductoController

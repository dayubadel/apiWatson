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
                    @cuotasPrecioCC = ${objProducto.cuotasPrecioCC},
                    @plazoGarantia = ${objProducto.plazoGarantia},
                    @arrImagenes = N'${JSON.stringify(objProducto.imagenes)}',
                    @arrCaracteristicas = N'${JSON.stringify(objProducto.caracteristicas).replace(/[{}"]+/g,'')}',
                    @arrCategorias = N'${JSON.stringify(objProducto.categorias).replace(/[{\]["]+/g,'').replace(/(},)+/g,'^').replace('}','')}'

        `
    });

    // console.log(query)
    await request.query(query)
    .then(async data => {
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
        // console.log(err)
        throw new Error('Error al registrar en BD')
    })

}


sqlProductoController.ObtenerEntidades = async () => {
    let query = '',
        resultSQL = [];

    query = 'EXEC [dbo].[sp_ObtenerEntidades]'


    await request.query(query)
    .then(async data => {
        // console.log(data.recordsets)
        if (data.recordset != undefined && data.recordset.length > 0) {
            data.recordsets.forEach(element => {
                element.forEach(element2 => {
                    let objSql = {
                        tipoEntidad : element2.nombreEntidad,
                        valorEntidad : element2.nombreValor
                    }
                    resultSQL.push(objSql)
                });
            });
            
            
        } else {
            resultSQL = []
        }
    })
    .catch(err => {

        console.log("error al obtener entidades desde bd")
        console.log(err)
    })
    return resultSQL
}

module.exports = sqlProductoController

const mssql = require('mssql');
var request = new mssql.Request();
const pedidoModel = require('./../models/pedido.js')
var sqlController = {}

//Funciones SQL

sqlController.gestionContexto = async(contexto, idWhatsAppChat, opcion) =>{
    //opcion = 1 => registrar contexto
    //opcion = 2 => obtener contexto
    //opcion = 3 => eliminar contexto
    var query
    var resultSQL

    query = `exec [dbo].[sp_GestionContexto] @_idChatWhatsApp = '${idWhatsAppChat}', @contexto = '${JSON.stringify(contexto)}', @opcion = '${opcion}'`
    // console.log(query)
    await request.query(query)
    .then(async data => {
        // console.log(data)

        if (data.recordset != undefined && data.recordset.length > 0) {
            resultSQL = JSON.parse(data.recordset[0].contexto)
        } else {
            resultSQL = {}
        }
    })
    .catch(err => {

        console.log("error al gestionar el contexto base")
        console.log(err)
    })

    return resultSQL
}
module.exports = sqlController

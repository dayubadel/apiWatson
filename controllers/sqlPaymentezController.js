const mssql = require('mssql');
const { sql } = require('../config/config');
const mailCOntroller = require('./mailController')
var request = new mssql.Request();


var sqlPaymentezController = {}


sqlPaymentezController.getDatosToWS = async (numeroReferencia) => {

    let query
    var resultSQL = []
    let datos = {} 

    query = `[dbo].[sp_consultarInfoWS]
            @numeroReferencia = N'${numeroReferencia}'`

    await request.query(query)
    .then(async data => {
        // console.log(data)
        if (data.recordsets != undefined && data.recordsets.length > 0) {
            resultSQL = data.recordsets
            
       }
        // return resultSQL
    })
    .catch(err => {
            console.log(err)
            console.log(err)
            throw new Error('Error al registrar en BD')
    })
    // console.log(resultSQL)
    return resultSQL
}





module.exports = sqlPaymentezController
const mssql = require('mssql');
const { sql } = require('../config/config');
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

sqlPaymentezController.GestionLugares = async (provincia, opcion) =>
{
    let query
    var resultSQL = []
    var datos = {}
    if(opcion==1)
    {
        query = `[dbo].[sp_GestionLugares] 
                @opcion = ${opcion}`
    }
    else if(opcion==2)
    {
        query = `[dbo].[sp_GestionLugares] 
                @provincia = N'${provincia}',
                @opcion = ${opcion}`
    }
    await request.query(query)
    .then(async data => {
        if (data.recordset != undefined && data.recordset.length > 0) {
               data.recordset.forEach(element => 
               {
                   datos =  
                    { 
                        idCiudad : element.idCiudad,
                        identificador : element.identificador,
                        ciudad : element.nombre,
                        provincia : element.provincia
                    }                    
                   resultSQL.push(datos)
               })
       }
   })
   .catch(err => {
           console.log("Error al gestionar lugares")
           console.log(err)
           throw new Error('Error al registrar en BD')
   })
   return resultSQL
}

sqlPaymentezController.gestionCabeceraVenta = async (numeroReferencia, nombresCabecera, apellidosCabecera, tipoIdentificacion, numIdentificacion, email, numeroTelefono,
    nombreReceptor, idCiudadEntrega, callePrincipalEntrega, calleSecundariaEntrega, barrioEntrega, referenciaEntrega, 
    tipoTarjeta, valorTotalPaymentez, mesesPlazo, primerosDigitosTarjetaPaymentez, ultimosDigitosTarjetaPaymentez, tidPaymentez
    ,opcion) =>
{
    
    let resultSQL = []
    let datos = {}
    let query

    if(opcion==1)
    {
        query =`[dbo].[sp_GestionCabeceraVenta]
            @numeroReferencia = N'${numeroReferencia}',
            @nombresCabecera = N'${nombresCabecera}',
            @apellidosCabecera = N'${apellidosCabecera}',
            @tipoIdentificacion = N'${tipoIdentificacion}',
            @numIdentificacion = N'${numIdentificacion}',
            @numeroTelefono = N'${numeroTelefono}',
            @opcion = ${opcion}`
    }
    else if(opcion==2 || opcion==3 || opcion==5 )
    {
        query = `[dbo].[sp_GestionCabeceraVenta]
        @numeroReferencia = N'${numeroReferencia}',
        @opcion = ${opcion}`
    }
    else if(opcion==4)
    {
        query =`[dbo].[sp_GestionCabeceraVenta]
            @numeroReferencia = N'${numeroReferencia}',
            @nombresCabecera = N'${nombresCabecera}',
            @apellidosCabecera = N'${apellidosCabecera}',
            @tipoIdentificacion = N'${tipoIdentificacion}',
            @numIdentificacion = N'${numIdentificacion}',
            @numeroTelefono = N'${numeroTelefono}',
            @email = N'${email}',
            @nombreReceptor = N'${nombreReceptor}',
            @idCiudadEntrega = ${idCiudadEntrega},
            @callePrincipalEntrega = N'${callePrincipalEntrega}',
            @calleSecundariaEntrega = N'${calleSecundariaEntrega}',
            @barrioEntrega = N'${barrioEntrega}',
            @referenciaEntrega = N'${referenciaEntrega}',
            @opcion = ${opcion}`
    }
    else if(opcion==6)
    {
        query = `[dbo].[sp_GestionCabeceraVenta]
        @numeroReferencia = N'${numeroReferencia}',
        @tipoTarjeta = N'${tipoTarjeta}',
        @valorTotalPaymentez  =${valorTotalPaymentez},
        @mesesPlazo  = ${mesesPlazo},
        @primerosDigitosTarjetaPaymentez = N'${primerosDigitosTarjetaPaymentez}',
        @ultimosDigitosTarjetaPaymentez = N'${ultimosDigitosTarjetaPaymentez}',
        @tidPaymentez= N'${tidPaymentez}',
        @opcion = ${opcion}`
    }
    
    await request.query(query)
    .then( async data => {
         if (data.recordset != undefined && data.recordset.length > 0) {
                data.recordset.forEach(element => 
                {
                    datos = 
                    {
                             numeroReferencia : element.numeroReferencia,
                             nombresCabecera : element.nombres,
                             apellidosCabecera : element.apellidos,
                             numeroTelefono : element.numeroTelefono,
                             tipoIdentificacion : element.tipoIdentificacion,
                             numIdentificacion : element.numIdentificacion,
                             fechaUltimaModificacion : element.fechaUltimaModificacion,
                             fechaFinalizacion : element.fechaFinalizacion,
                             valorTotalOrden : element.valorTotalOrden,
                             valorNeto : element.valorNeto,
                             valorNetoIva : element.valorNetoIva,
                             valorEnvio : element.valorEnvio,
                             idClienteCanalMensajeria : element.idClienteCanalMensajeria,
                             email : element.email,
                             identificadorMetodoPago : element.identificadorMetodoPago,
                             idConversacionCanal : element.idConversacionCanal
                    }
                    resultSQL.push(datos)
                }
                )
        }
    })
    .catch(err => {
            console.log("Error al gestionar cabecera venta")
            console.log(err)
            throw new Error('Error al registrar en BD')
    })
    return resultSQL
}

module.exports = sqlPaymentezController
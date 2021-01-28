const mssql = require('mssql');
const { sql } = require('../config/config');
var request = new mssql.Request();
const logger = require('../models/winston');
const canalesMensajeriaController = require('../controllers/canalesMensajeriaController');
const { error } = require('winston');

var sqlPaymentezController = {}
var respuestaGrupoWhatsappp = []
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
    .catch(error => {
            console.log(error)
            logger.error({tittle:'Error al consultar los datos a nivel de BD para enviar al web service de facturacion automatica',type:'Model-BD',file:'sqlPaymentezController.js',method:'getDatosToWS',details: error})
            respuestaGrupoWhatsapp.push({type:'text',text:`*Proyecto:* ChatbotDora - Comandato\n*Api:* WatsonComandato\n*Mensaje:* Ha ocurrido un error interno de la Api a nivel de base de datos, revisar el log.`})
            canalesMensajeriaController.enviarMensajeWhatsapp(respuestaGrupoWhatsapp,config.destinatarios.grupoWhatsAppDesarrolladora)    
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
   .catch(error => {
           console.log("Error al gestionar lugares")
           console.log(error)
            logger.error({tittle:'Error al consultar los datos a nivel de BD de provincias y ciudades',type:'Model-BD',file:'sqlPaymentezController.js',method:'GestionLugares',details: error})
            respuestaGrupoWhatsapp.push({type:'text',text:`*Proyecto:* ChatbotDora - Comandato\n*Api:* WatsonComandato\n*Mensaje:* Ha ocurrido un error inerno de la Api a nivel de base de datos, revisar el log.`})
            canalesMensajeriaController.enviarMensajeWhatsapp(respuestaGrupoWhatsapp,config.destinatarios.grupoWhatsAppDesarrolladora)    
           throw new Error('Error al registrar en BD')
   })
   return resultSQL
}

sqlPaymentezController.gestionCabeceraVenta = async (numeroReferencia, nombresCabecera, apellidosCabecera, tipoIdentificacion, numIdentificacion, email, numeroTelefono,
    nombreReceptor, idCiudadEntrega, callePrincipalEntrega, calleSecundariaEntrega, numeroEntrega, referenciaEntrega, 
    tipoTarjeta, valorTotalPaymentez, mesesPlazo, primerosDigitosTarjetaPaymentez, ultimosDigitosTarjetaPaymentez, tidPaymentez,
    codigoAutorizacionPaymentez ,opcion) =>
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
            @numeroEntrega = N'${numeroEntrega}',
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
        @codigoAutorizacionPaymentez = N'${codigoAutorizacionPaymentez}',
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
                        idConversacionCanal : element.idConversacionCanal,
                        finalizado : element.finalizado,
                        tidPaymentez : element.tidPaymentez,
                        codigoAutorizacionPaymentez : element.codigoAutorizacionPaymentez,
                        descripcionMetodoPago : element.descripcionMetodoPago,
                        ciudad : element.ciudad,
                        provincia : element.provincia,
                        nombreReceptor : element.nombreReceptor,
                        callePrincipalEntrega : element.callePrincipalEntrega,
                        calleSecundariaEntrega : element.calleSecundariaEntrega,
                        numeroEntrega : element.numeroEntrega,
                        referenciaEntrega : element.referenciaEntrega,
                        idCabeceraVenta : element.idCabeceraVenta,
                        idCanalMensajeria : element.identificadorCanal,
                        stockDisponible : element.stockDisponible
                    }
                    resultSQL.push(datos)
                }
                )
        }
    })
    .catch(error => {
            console.log("Error al gestionar cabecera venta")
            console.log(error)
            logger.error({tittle:'Error al gestionar los datos de la cabecera venta a nivel de base de datos',type:'Model-BD',file:'sqlPaymentezController.js',method:'gestionCabeceraVenta',details: error})
            respuestaGrupoWhatsapp.push({type:'text',text:`*Proyecto:* ChatbotDora - Comandato\n*Api:* WatsonComandato\n*Mensaje:* Ha ocurrido un error interno de la Api a nivel de base de datos, revisar el log.`})
            canalesMensajeriaController.enviarMensajeWhatsapp(respuestaGrupoWhatsapp,config.destinatarios.grupoWhatsAppDesarrolladora)    
            throw new Error('Error al registrar en BD')
    })
    return resultSQL
}

sqlPaymentezController.gestionCarritoCompras = async (idClienteCanalMensajeria, numeroReferencia, idDetalleVenta, idProductoBot, metodoPago, cantidad, opcion) =>
 {
     let query
     let datos = {}
     let resultSQL = []
     if(opcion==1) //insertar producto al carrito
     {
         query = `[dbo].[sp_GestionCarritoDeCompras]
                 @idClienteCanalMensajeria=${idClienteCanalMensajeria},
                 @idProductoBot=${idProductoBot},
                 @metodoPago=N'${metodoPago}',
                 @cantidad=${cantidad},
                 @opcion=${opcion}`
     }
     else if(opcion==2) //consultar carrito
     {
         query = `[dbo].[sp_GestionCarritoDeCompras]
                 @idClienteCanalMensajeria=${idClienteCanalMensajeria},
                 @opcion=${opcion}`
     }
     else if(opcion==3) //eliminar producto de carrito
     {
         query = `[dbo].[sp_GestionCarritoDeCompras]
                 @idClienteCanalMensajeria=${idClienteCanalMensajeria},
                 @idDetalleVenta=${idDetalleVenta},
                 @opcion=${opcion}`
     }
     else if(opcion==4) //consultar carrito por numero ref de la factura
     {
         query = `[dbo].[sp_GestionCarritoDeCompras]
                @idClienteCanalMensajeria=${idClienteCanalMensajeria},
                 @numeroReferencia=${numeroReferencia},
                 @opcion=${opcion}`
     }
 
     await request.query(query)
     .then(async data => {
         if (data.recordset != undefined && data.recordset.length > 0) {
                data.recordset.forEach(element =>
                     {
                         datos = {
                             idProductoBot : element.idProductoBot,
                             nombreProducto : element.nombreProducto,
                             cantidad : element.cantidad,
                             precioProducto : element.precioProducto,
                             metodoPago : element.metodoPago,
                             identificadorMetodoPago: element.identificadorMetodoPago,
                             idDetalleVenta : element.idDetalleVenta,
                             numeroReferencia : element.numeroReferencia,
                             iva : element.iva
                         }
                         resultSQL.push(datos)
                     })             
            }
     })
     .catch(error => {
         console.log("Error al gestionar el carrito de compras")
         console.log(error)
         logger.error({tittle:'Error al gestionar al gestionar el carrito de compras a nivel de base de datos',type:'Model-BD',file:'sqlPaymentezController.js',method:'gestionCarritoCompras',details: error})
         respuestaGrupoWhatsapp.push({type:'text',text:`*Proyecto:* ChatbotDora - Comandato\n*Api:* WatsonComandato\n*Mensaje:* Ha ocurrido un error interno de la Api a nivel de base de datos, revisar el log.`})
         canalesMensajeriaController.enviarMensajeWhatsapp(respuestaGrupoWhatsapp,config.destinatarios.grupoWhatsAppDesarrolladora)    
         throw new Error('Error al registrar en BD')
     })
     return resultSQL
 }

 sqlPaymentezController.insertarHistoricoPago = async(idCabeceraVenta, codigoMensaje, detalleMensaje, tid, estado, detalleTransaccion) => {

    let query
    var resultSQL = []
    var datos = {}
    
    query = `EXEC [dbo].[Sp_InsertarHistoricoPago]
                @idCabeceraVenta = ${idCabeceraVenta},
                @codigoMensaje = N'${codigoMensaje}',
                @detalleMensaje = N'${detalleMensaje}',
                @tid = N'${tid}',
                @estado = N'${estado}',
                @detalleTransaccion =N'${detalleTransaccion}' `
                
    await request.query(query)
    .then(async data => {
        if (data.recordset != undefined && data.recordset.length > 0) {          
        }
    })
    .catch(error => {
        console.log("Ha ocurrido un error al ingresar el histórico del pago")
        console.log(error)
        logger.error({tittle:'Error al gestionar al insertar el historico de un pago a nivel de base de datos',type:'Model-BD',file:'sqlPaymentezController.js',method:'insertarHistoricoPago',details: error})
        respuestaGrupoWhatsapp.push({type:'text',text:`*Proyecto:* ChatbotDora - Comandato\n*Api:* WatsonComandato\n*Mensaje:* Ha ocurrido un error interno de la Api a nivel de base de datos, revisar el log.`})
        canalesMensajeriaController.enviarMensajeWhatsapp(respuestaGrupoWhatsapp,config.destinatarios.grupoWhatsAppDesarrolladora)    
      
        throw new Error('Error al registrar en BD')
    })
    return resultSQL
 }

module.exports = sqlPaymentezController
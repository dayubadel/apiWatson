const config = require("../config/config.js");
const sqlPaymentezController = require('./sqlPaymentezController.js')
const soap = require('soap')
const util = require('util')
const mailController = require('./mailController')
const whatsappController = require('./whatsappController')


const paymentezController = {}


paymentezController.GestionFactura = async (req, res) => {
    let opcion = req.body.opcion
    var respuestaSql
    if(opcion == 1)
    {
        var numeroReferencia = req.body.numeroReferencia
        respuestaSql = await sqlPaymentezController.gestionCabeceraVenta(numeroReferencia,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2)
    }
    else if(opcion == 2)
    {
        var datosFactura = req.body
        respuestaSql = await sqlPaymentezController.gestionCabeceraVenta (datosFactura.numeroReferencia,datosFactura.first_name.toUpperCase(),
                                        datosFactura.last_name.toUpperCase(),datosFactura.user_tipo_identificacion,
                                        datosFactura.user_numero_identificacion,datosFactura.user_email.toLowerCase(),datosFactura.user_phone,
                                        datosFactura.nombre_receptor, datosFactura.ciudad, datosFactura.calle_principal, datosFactura.numero_calle,
                                        datosFactura.barrio_entrega, datosFactura.referencia_entrega,null,null,null,null,null,null,4)    
    }
    if(respuestaSql.length==0)
    {
        res.send({estado: false, mensaje: 'Ocurrió un error con el número de referencia del pedido.'})
    }
    else
    {
        let factura = respuestaSql[0]
        var tipoPago = 0
        if(factura.identificadorMetodoPago == 3)
            tipoPago = 2
        else if (factura.identificadorMetodoPago == 5)
            tipoPago = 3
        var facuturaPaymentez =
            {
                user_id : factura.idClienteCanalMensajeria.toString(),
                order_description : 'Chatbot_Dora',
                order_amount : factura.valorTotalOrden,
                order_vat : factura.valorNetoIva,
                order_reference :  factura.numeroReferencia,
                order_installments_type: tipoPago,
                order_taxable_amount : factura.valorNeto + factura.valorEnvio,
                order_tax_percentage : config.valorGlobales.IVAPercent,
                first_name : factura.nombres,
                last_name : factura.apellidos,
                phone : factura.numeroTelefono,
                tipo_identificacion : factura.tipoIdentificacion,
                numero_identificacion : factura.numIdentificacion,
                email : factura.email,
                idConversacionCanal : factura.idConversacionCanal
            }
        res.send({estado: true, resultado: facuturaPaymentez})
    }
}

paymentezController.GestionLugares= async (req, res) => {
    var resultadoSql =  await sqlPaymentezController.GestionLugares(req.body.provincia,req.body.opcion)

    res.send({estado: true, resultado: resultadoSql})
}

paymentezController.GetFormulario = (req, res) => {
    res.sendFile('indexPago.html', { root: `${__dirname}\\..\\dist\\` })
}

paymentezController.RespuestaPago = async (req, res) => {
    var respuesta = []
    const transaction = req.body.myjson.transaction;
    if(transaction.hasOwnProperty("type")){
        res.send(
        {
            estado: false,
            type: "Error de servidor",
            mensaje: 'HA OCURRIOD UN ERROR CON EL PAGO, POR FAVOR INTENTE NUEVAMENTE'
        })
    }
    else if(transaction.hasOwnProperty("status")){
        if(transaction.status == "failure"){
            res.send(
                {
                    estado: false,
                    type: "Error con la tarjeta",
                    mensaje: 'SU TARJETA HA SIDO RECHAZADA'
                })
        }
        else{
           let card = req.body.myjson.card
           console.log(req.body)
           let respuestaSql = await sqlPaymentezController.gestionCabeceraVenta(transaction.dev_reference,null,null,null,null,null,null,null,null,null,null,null,null,card.type,transaction.amount,transaction.installments,card.bin,card.number,transaction.id,6)
           if(respuestaSql.length==0)
           {
                res.send(
                {
                    estado: false,
                    type: "Error al actualizar datos en la base",
                    mensaje: 'PAGO FUE PROCESADO DE FORMA CORRECTA. SIN EMBARGO SE PRESENTARON ERRORES AL ACTUALIZAR SUS DATOS.'
                })
           }
           else
           {
                let respuestaWS = await paymentezController.WSFacturacion(transaction.dev_reference)
                var mensajeF = `Su pago ha sido procesado correctamente con el siguiente número de orden de compra: ${transaction.dev_reference}`
                //preguntar si es necesario emitir email al dpto. de ventas  cuando ws falla
                if(respuestaWS==true)
                {     
                    res.send(
                    {
                        estado: true,
                        type: "¡Transacción exitosa!",
                        mensaje: mensajeF
                    })                    
                    respuesta.push({
                        response_type:'text',
                        text: mensajeF
                    })
                }
                else 
                {           
                    res.send(
                    {
                        estado: true,
                        type: "¡Transacción exitosa!",
                        mensaje: `${mensaje} Con errores en la facturación.` 
                    })
                    respuesta.push({
                        response_type:'text',
                        text: `${mensaje} Con errores en la facturación.` 
                    })
                }
                console.log(respuesta, respuestaSql[0].idConversacionCanal)
                paymentezController.sendWhatsapp(respuesta,respuestaSql[0].idConversacionCanal)
            }
        }
    }
}

paymentezController.WSFacturacion = async (numeroReferencia) => {
    var facuturaCreada = false
    // const soapUrl = config.wsFacturacion.urlSoapFactuacion
    var jsonCompra = {}
    var data  = await sqlPaymentezController.getDatosToWS(numeroReferencia)
    if(data.length > 0){
        data.forEach(tabla => {
            if(tabla[0].tipoTabla == 'Cabecera'){
                    let orden = tabla[0];
                    delete orden.tipoTabla
                    jsonCompra.orden = orden
            }
            if(tabla[0].tipoTabla == 'Detalle'){
                let detalle = tabla
                delete detalle.tipoTabla
                jsonCompra.orden.items = tabla
            }
        });
    }

    await (async () => {        
        for (let i = 0; i < 3; i++) {
            facuturaCreada = await paymentezController.CallWS(jsonCompra)
            if(facuturaCreada == true){
                break;
            }      
        }
    })()

    if(!facuturaCreada){
        mailController.MailErrorWSFacturacion(jsonCompra);
    }

    return facuturaCreada
}

paymentezController.CallWS = async (jsonCompra) => {
    var facturaCreada = false
    const soapUrl = config.wsFacturacion.urlSoapFactuacion

    const paramsWS = {
        "I_TOKEN": config.wsFacturacion.token,
        'I_FECHAHORA_BOT': new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/[:]/g,'').replace(/[-]/g,'').replace(/\s/g,''),
        'I_DATOS_ORDEN': JSON.stringify(jsonCompra.orden)
    }
    await soap.createClientAsync(soapUrl)
    .then(async soapClient => {
        const soapCreateOrder = util.promisify(soapClient.CreateOrder)
        return soapCreateOrder(paramsWS)
    })
    .then(clientRes => {
        console.log(clientRes)
        if(clientRes.CreateOrderResult.O_TIPOM == 'S'){
            facturaCreada = true
        }else{
            facturaCreada = false
        }
    })
    .catch(err => {
        console.log("error de comunicacion",err)
        facturaCreada = false
            // res.send(err)
    })

    return facturaCreada
}

paymentezController.sendWhatsapp = (objRespuesta, idWhatsapp) => {
    // var respuesta = [
    //     {
    //         response_type: 'text',
    //         text: 'este mensaje es una prueba'
    //     },
    //     {
    //         response_type: 'text',
    //         text: 'este mensaje es una pruea'
    //     }
    // ]
    whatsappController.enviarMensaje(objRespuesta,idWhatsapp)
}

module.exports = paymentezController;
const config = require("../config/config.js");
const sqlPaymentezController = require('./sqlPaymentezController.js')
const soap = require('soap')
const util = require('util')
const mailController = require('./mailController')
const whatsappController = require('./whatsappController');
const { json } = require("body-parser");


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
        respuestaSql = await sqlPaymentezController.gestionCabeceraVenta (datosFactura.numeroReferencia,datosFactura.first_name,
                                        datosFactura.last_name,datosFactura.user_tipo_identificacion,
                                        datosFactura.user_numero_identificacion,datosFactura.user_email.toLowerCase(),datosFactura.user_phone,
                                        datosFactura.nombre_receptor, datosFactura.ciudad, datosFactura.calle_principal,datosFactura.calle_secundaria,
                                        datosFactura.numero_calle,datosFactura.referencia_entrega,null,null,null,null,null,null,4)    
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
                idConversacionCanal : factura.idConversacionCanal,
                finalizado : factura.finalizado
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
    let respuestaSql = await sqlPaymentezController.gestionCabeceraVenta(transaction.dev_reference,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2)
    if(transaction.hasOwnProperty("type")){
        respuesta.push({
            response_type:'text',
            text: 'HA OCURRIDO UN ERROR CON SU PAGO, POR FAVOR INTENTE NUEVAMENTE' 
        })
        paymentezController.sendWhatsapp(respuesta,respuestaSql[0].idConversacionCanal)
        res.send(
        {
            estado: false,
            type: "Error de servidor",
            mensaje: 'HA OCURRIDO UN ERROR CON SU PAGO, POR FAVOR INTENTE NUEVAMENTE'
        })
    }
    else if(transaction.hasOwnProperty("status")){
        if(transaction.status == "failure"){     
            respuesta.push({
                response_type:'text',
                text: 'LAMENTAMOS INFORMARLE QUE SU TARJETA HA SIDO RECHAZADA' 
            })       
            paymentezController.sendWhatsapp(respuesta,respuestaSql[0].idConversacionCanal)
            res.send(
                {
                    estado: false,
                    type: "Error con la tarjeta",
                    mensaje: 'LAMENTAMOS INFORMARLE QUE SU TARJETA HA SIDO RECHAZADA'
                })
        }
        else
        {
            let card = req.body.myjson.card
            let respuestaSql2 = await sqlPaymentezController.gestionCabeceraVenta(transaction.dev_reference,null,null,null,null,null,null,null,null,null,null,null,null,card.type,transaction.amount,transaction.installments,card.bin,card.number,transaction.id,6)
          
            var mensajeF = `Su pago ha sido procesado correctamente con el siguiente número de orden de compra: ${transaction.dev_reference}`                 
            respuesta.push({
                response_type:'text',
                text: `${mensajeF}` 
            })
            paymentezController.sendWhatsapp(respuesta,respuestaSql[0].idConversacionCanal)
            paymentezController.WSFacturacion(transaction.dev_reference)
            res.send(
                {
                    estado: true,
                    type: "¡Transacción exitosa!",
                    mensaje: mensajeF
                })
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
                tabla.forEach(tblDetalle => {
                    delete tblDetalle.tipoTabla
                });
                let detalle = tabla
                jsonCompra.orden.items = tabla
            }
        });
    }

    await (async () => {        
        for (let i = 0; i < 3; i++) {
            console.log(jsonCompra)
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
        'I_DATOS_ORDEN': JSON.stringify(jsonCompra)
    }
    await soap.createClientAsync(soapUrl)
    .then(async soapClient => {
        const soapCreateOrder = util.promisify(soapClient.CreateOrder)
        return soapCreateOrder(paramsWS)
    })
    .then(clientRes => {
        console.log("res",clientRes)
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
    whatsappController.enviarMensaje(objRespuesta,idWhatsapp)
}

module.exports = paymentezController;
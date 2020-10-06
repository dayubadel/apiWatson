const config = require("../config/config.js");
const sqlPaymentezController = require('./sqlPaymentezController.js')
const soap = require('soap')
const util = require('util')
const mailController = require('./mailController')
const whatsappController = require('./whatsappController');
const { json } = require("body-parser");
const sqlController = require("./sqlController.js");


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
    var grupoWhatsapp = '593963206990-1601935738@g.us'
    var respuesta = []
    var respuestaGrupoWhatsap = []
    const transaction = req.body.myjson.transaction;
    let respuestaSql = await sqlPaymentezController.gestionCabeceraVenta(transaction.dev_reference,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2)
    if(transaction.hasOwnProperty("type")){
        respuesta.push({
            response_type:'text',
            text: 'Ha ocurrido un error con su pago, por favor intente nuevamente.' 
        })
        var datosJsonFacutura = await paymentezController.getDatosFactura(transaction.dev_reference)
        mailController.MailErrorPaymentez(datosJsonFacutura,transaction)
        paymentezController.sendWhatsapp(respuesta,respuestaSql[0].idConversacionCanal)
        respuestaGrupoWhatsap.push(
            {
                response_type:'text',
                text: `Estimados, les saluda Dora.\nUn cliente está intentando pagar, pero el sistema de Paymentez está presentando problemas.\nHe enviado un correo electrónico con los datos del cliente y de la compra.`
            })
        paymentezController.sendWhatsapp(respuestaGrupoWhatsap,grupoWhatsapp)
        res.send(
        {
            estado: false,
            type: "Error de servidor",
            mensaje: 'Ha ocurrido un error con su pago, por favor intente nuevamente.'
        })
    }
    else if(transaction.hasOwnProperty("status")){
        if(transaction.status == "failure"){     
            respuesta.push({
                response_type:'text',
                text: 'Lamentamos informarle que su tarjeta ha sido rechazada.' 
            })       
            paymentezController.sendWhatsapp(respuesta,respuestaSql[0].idConversacionCanal)
            var datosJsonFacutura = await paymentezController.getDatosFactura(transaction.dev_reference)
            mailController.MailErrorPaymentez(datosJsonFacutura,transaction)
            respuestaGrupoWhatsap.push(
                {
                    response_type:'text',
                    text: `Estimados, les saluda Dora.\nUn cliente está intentando pagar, pero tiene problemas con su tarjeta.\nHe enviado un correo electrónico con los datos del cliente y de la compra.`
                })
            paymentezController.sendWhatsapp(respuestaGrupoWhatsap,grupoWhatsapp)
            res.send(
                {
                    estado: false,
                    type: "Error con la tarjeta",
                    mensaje: 'Lamentamos informarle que su tarjeta ha sido rechazada.'
                })
        }
        else
        {
            let card = req.body.myjson.card
            let datosCabecera = await sqlPaymentezController.gestionCabeceraVenta(transaction.dev_reference,null,null,null,null,null,null,null,null,null,null,null,null,card.type,transaction.amount,transaction.installments,card.bin,card.number,transaction.id,6)
            paymentezController.sendEmailCliente(datosCabecera[0])
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

paymentezController.sendEmailCliente = async (objCabecera) => {
    let current_datetime = objCabecera.fechaFinalizacion
    let formattedDate = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() 
    var tipoIdentificacion = 'Cédula'
    if(objCabecera.tipoIdentificacion=='rucECU')
        tipoIdentificacion='RUC'
    let tituloCliente = `Comandato / Compra exitosa mediante Asistente Virtual Dora - Factura: #${objCabecera.numeroReferencia} `
    let cabeceraCliente = `<div>    
                        <p>Su pago ha sido procesado exitosamente a través del asistente virtual.</p>
                        <p>A continuación, se muestran los datos relevantes de su compra.</p>
                        <br>           
                        <label><strong>Referencia:</strong> ${objCabecera.numeroReferencia}</label><br>
                        <label><strong>Identificador del pago:</strong> ${objCabecera.tidPaymentez}</label><br>
                        <label><strong>Código de autorización del pago:</strong> ${objCabecera.codigoAutorizacionPaymentez}</label><br>
                        <label><strong>Fecha de finalización:</strong> ${formattedDate}</label><br>
                        <label><strong>Nombres:</strong> ${objCabecera.nombresCabecera}</label><br>
                        <label><strong>Apellidos:</strong> ${objCabecera.apellidosCabecera}</label><br>
                        <label><strong>${tipoIdentificacion}:</strong> ${objCabecera.numIdentificacion}</label><br>
                        <label><strong>Teléfono:</strong> ${objCabecera.numeroTelefono}</label><br>
                        <label><strong>Correo electrónico:</strong> ${objCabecera.email}</label><br>
                        <label><strong>Método de pago:</strong> ${objCabecera.descripcionMetodoPago}</label><br>
                        </div>`
    var cabeceraTabla = `<tr>
                        <th>N</th>
                        <th>Cantidad</th>
                        <th>Producto</th>
                        <th>Precio Unitario</th>
                        <th>Precio Total</th>
                    </tr>`
    filaCuerpo = ''
    numero = 1
    var totalFactura = 0
    var elementosFactura = await sqlPaymentezController.gestionCarritoCompras(objCabecera.idClienteCanalMensajeria,objCabecera.numeroReferencia,null,null,null,null,4)
    console.log(objCabecera.idClienteCanalMensajeria,elementosFactura)
    elementosFactura.forEach(element =>
        {
            let total = element.cantidad*element.precioProducto
            filaCuerpo = filaCuerpo + `<tr>
                                            <td>${numero}</td>
                                            <td>${element.cantidad}</td>
                                            <td>${element.nombreProducto}</td>
                                            <td>${element.precioProducto}</td>
                                            <td>${total.toFixed(2)}</td>
                                        </tr>`
            totalFactura = totalFactura + total
            numero++
        })
        filaCuerpo = filaCuerpo + `<tr>
        <td>${numero}</td>
        <td>1</td>
        <td>VALOR DE ENVÍO</td>
        <td>3.51</td>
        <td>3.51</td>
    </tr>`
    filaCuerpo = filaCuerpo +  `<tr>
                                    <td colspan="3">SUBTOTAL</td>
                                    <td colspan="3">${(totalFactura+3.51).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="3">IVA</td>
                                    <td colspan="3">${((totalFactura+3.51)*0.12).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="3">TOTAL A PAGAR</td>
                                    <td colspan="3">$${((totalFactura+3.51)*1.12).toFixed(2)}</td>
                                </tr>`
                                            
    var tabla = `<table style="text-align:center;border:1px solid blak" class="table-responsive">${cabeceraTabla}${filaCuerpo}</table><br><h4>Correo enviado automáticamente desde la asistente virtual Dora</h4>  `
    var contenido = `${cabeceraCliente}${tabla}`
    mailController.enviarEmailCliente(objCabecera.email, tituloCliente, contenido)
}


paymentezController.getDatosFactura = async (numeroReferencia) => {
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
    return jsonCompra
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
        var respuestaGrupoWhatsap = []
        var grupoWhatsapp = '593963206990-1601935738@g.us'
        respuestaGrupoWhatsap.push(
            {
                response_type:'text',
                text: `Estimados, les saluda Dora.\nUn cliente ha finalizado exitosamente el pago de una compra.\nSin embargo, el servicio web de facturación automática ha fallado en los 3 intentos.\nHe enviado un correo electrónico con los datos del cliente y de la compra.`
            })
        paymentezController.sendWhatsapp(respuestaGrupoWhatsap,grupoWhatsapp)
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
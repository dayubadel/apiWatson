const config = require("../config/config.js");
const sqlController = require('./sqlController.js')
const sqlPaymentezController = require('./sqlPaymentezController.js')
const soap = require('soap')
const util = require('util')
const mailController = require('./mailController')
const paymentezController = {}

paymentezController.GestionFactura = async (req, res) => {
    let opcion = req.body.opcion
    var respuestaSql
    if(opcion == 1)
    {
        var numeroReferencia = req.body.numeroReferencia
        respuestaSql = await sqlController.gestionCabeceraVenta(numeroReferencia,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2)
    }
    else if(opcion == 2)
    {
        var datosFactura = req.body
        respuestaSql = await sqlController.gestionCabeceraVenta (datosFactura.numeroReferencia,datosFactura.first_name.toUpperCase(),
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
                email : factura.email
            }
        res.send({estado: true, resultado: facuturaPaymentez})
    }
}

paymentezController.GestionLugares= async (req, res) => {
    var resultadoSql =  await sqlController.GestionLugares(req.body.provincia,req.body.opcion)

    res.send({estado: true, resultado: resultadoSql})
}

paymentezController.GetFormulario = (req, res) => {
    res.sendFile('indexPago.html', { root: `${__dirname}\\..\\dist\\` })
}

paymentezController.RespuestaPago = async (req, res) => {
    const transaction = req.body.myjson.transaction;
    console.log(req.body.myjson)
    if(transaction.hasOwnProperty("type")){
        res.send(
        {
            estado: false,
            type: "Error de servidor",
            mensaje: '<div class="alert alert-danger text-center" role="alert">HA OCURRIOD UN ERROR CON EL PAGO, POR FAVOR INTENTE NUEVAMENTE.</div>'
        })
    }
    else if(transaction.hasOwnProperty("status")){
        if(transaction.status == "failure"){
            res.send(
                {
                    estado: false,
                    type: "Error con la tarjeta",
                    mensaje: '<div class="alert alert-danger text-center" role="alert">SU TARJETA HA SIDO RECHAZADA</div>'
                })
        }
        else{
           let card = req.body.myjson.card
           console.log(req.body)
           let respuestaSql = await sqlController.gestionCabeceraVenta(transaction.dev_reference,null,null,null,null,null,null,null,null,null,null,null,null,card.type,transaction.amount,transaction.installments,card.bin,card.number,transaction.id,6)
           if(respuestaSql.length==0)
           {
                res.send(
                {
                    estado: false,
                    type: "Error al actualizar datos en la base",
                    mensaje: '<div class="alert alert-warning text-center" role="alert">SU PAGO FUE PROCESADO DE FORMA CORRECTA. SIN EMBARGO SE PRESENTARON ERRORES AL ACTUALIZAR SUS DATOS.</div>'
                })
           }
           else
           {
                res.send(
                {
                    estado: true,
                    type: "Exito",
                    mensaje:'<div class="alert alert-success text-center" role="alert">SU PAGO HA SIDO PROCESADO EXITOSAMENTE. GRACIAS POR SU COMPRA</div>'
                })
            }
        }
    }

}


paymentezController.WSFacturacion = async (req,res) => {
    var facuturaCreada = false
    // const soapUrl = config.wsFacturacion.urlSoapFactuacion
    var jsonCompra = {}
    var data  = await sqlPaymentezController.getDatosToWS('20200914124041710')
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

    res.json({'Estado':facuturaCreada})
    return facuturaCreada
    
    return
    // console.log(jsonCompra)
    /*
    const paramsWS = {
        "I_TOKEN": config.wsFacturacion.token,
        'I_FECHAHORA_BOT': new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/[:]/g,'').replace(/[-]/g,'').replace(/\s/g,''),
        'I_DATOS_ORDEN': JSON.stringify(jsonCompra.orden)
    }

    soap.createClientAsync(soapUrl)
    .then(async soapClient => {
        // res.send(soapClient.describe())
        const soapCreateOrder = util.promisify(soapClient.CreateOrder)
        return soapCreateOrder(paramsWS)
        // .then()
        // var respSoap
        // soapClient.CreateOrder(paramsWS, (err, clientRes)=> {
        //     respSoap = clientRes 
        //     console.log(1,respSoap)
        // // if(clientRes.CreateOrderResult.O_TIPOM == 'S'){
        //     //     // res.json({'Estado':'OK',clientRes})

        //     // }else{
        //     //     // res.json({'Estado':'no',clientRes})
        //     // }
        // })
        console.log(2,respSoap)
        return respSoap
    })
    .then(clientRes => {
        console.log(3,clientRes)
        res.json({'Estado':'OK',clientRes})
    })
    .catch(err => {
        console.log("errro",err)
        res.send(err)
    })

    // soap.createClient(soapUrl, function(err, client) {
    //     // res.send(client.describe())
    //     client.CreateOrder(paramsWS,(err, result) => {
    //         if(result.CreateOrderResult.O_TIPOM == 'S'){
    //             res.json({'Estado':'OK',result})

    //         }else{
    //             res.json({'Estado':'no',result})
    //         }
    //     })
    // })*/
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

module.exports = paymentezController;
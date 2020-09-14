const config = require("../config/config.js");
const soap = require('soap')
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
                                        datosFactura.nombre_receptor, 1, datosFactura.calle_principal, datosFactura.numero_calle,
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
                order_tax_percentage : valorGlobales.IVAPercent,
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

paymentezController.GetFormulario = (req, res) => {
    res.sendFile('indexPago.html', { root: `${__dirname}\\..\\dist\\` })
}

paymentezController.RespuestaPago = async (req, res) => {
    const transaction = req.body.myjson.transaction;
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


paymentezController.WSFacturacion = (req, res) => {
    const soapUrl = config.wsFacturacion.urlSoapFactuacion

    const jsonCompra = {
        "orden": {
            "id":"717763",
            "orderid":"717763",
            "value_order":"105898",
            "value_items":"94196",
            "value_discounts":"0",
            "value_tax":"11346",
            "value_envio":"356",
            "value_intereses":"0",
            "items":[
                {
                    "id":"2012775",
                    "quantity":1,
                    "name":"Refrigeradora LG Side by Side  GS65MPP1 | 626 Litros 100054508",
                    "refId":"100054508",
                    "price":94196,
                    "listPrice":196696,
                    "tax":11303,
                    "bodega":397,
                    "marketPlace":"0"
                }
            ],
            "email":"oscar_chavez_1992@hotmail.com",
            "firstname":"Oscar Omar",
            "lastname":"Chavez Molina",
            "document_type":"cedulaECU",
            "document":"930177720",
            "phone":"5930997335903",
            "receiver_name":"Oscar Omar Chavez Molina",
            "address_id":"",
            "code_postal":"",
            "city":"9001",
            "state":"GUAYAS",
            "country":"ECU",
            "street":"Guasmo Sur Coop Union de Bananeros Bloque 1 Manzana 2823 Solar 4",
            "number":"",
            "neighborhood":"",
            "complement":"",
            "reference":"",
            "isactive_transaction":"",
            "transactionId":"",
            "merchantName":"COMANDATO",
            "paymenId":"",
            "paymentSystem":"4",
            "paymentSystemName":"Mastercard",
            "valuePayment":"105898",
            "installments":"1",
            "firstDigits":"545195",
            "lastDigits":"2016",
            "group":"",
            "tid":"DF-3536229",
            "estado":"1"
        }
        
    }

    const paramsWS = {
        "I_TOKEN": config.wsFacturacion.token,
        'I_FECHAHORA_BOT': new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/[:]/g,'').replace(/[-]/g,'').replace(/\s/g,''),
        'I_DATOS_ORDEN': JSON.stringify(jsonCompra)
    }
    
    soap.createClient(soapUrl, function(err, client) {
        // res.send(client.describe())
        client.CreateOrder(paramsWS,(err, result) => {
            res.json(result)
        })
    })
}

module.exports = paymentezController;
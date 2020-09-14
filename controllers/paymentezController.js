const config = require("../config/config.js");
const soap = require('soap')
const paymentezController = {}



paymentezController.GetFormulario = (req, res) => {
    res.sendFile('indexPago.html', { root: `${__dirname}\\..\\dist\\` })
}

paymentezController.RespuestaPago = (req, res) => {
    console.log(req.body)
    const resPay = req.body;

    if(resPay.hasOwnProperty("error")){
        
    }
    if(resPay.hasOwnProperty("transaction")){
        if(resPay.status == "failure"){

        }
        else{
            
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
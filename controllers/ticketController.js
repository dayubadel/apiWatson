const soap = require('soap')
const util = require('util')
const config = require("../config/config.js");
const mailController = require('./mailController');
const mail = require("./mailController");

const ticketController = {}

ticketController.EnviarTicket = async (motivoTicket,detalleTicket,nombres,numIdentificacion,telefono)  =>
{
    const urlSoap = config.wsTickets.urlSoapTickets
    const token = config.wsTickets.token

    const paramsWS = {
        "I_TEXTO": motivoTicket,
        "I_IDFISCAL": numIdentificacion,
        "I_NOMBRE" : nombres,
        "I_TELEFONO" : telefono,
        "I_TOKEN": token,
        'I_SECUENCIA': new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/[:]/g,'').replace(/[-]/g,'').replace(/\s/g,''),
        'I_MENSAJE': `<tdline>${detalleTicket}</tdline>` 
    }
    console.log(paramsWS)

    var numeroSecuencia = null
    var contador = 0
    while(numeroSecuencia == null && contador<3)
    {
        await soap.createClientAsync(urlSoap)
        .then(async soapClient => {
            const soapCreateOrder = util.promisify(soapClient.CreateTicket)
            console.log("1",soapCreateOrder)
            return soapCreateOrder(paramsWS)
        })
        .then(clientRes => {
            console.log("r",clientRes)
            if(clientRes.CreateTicketResult.O_TIPOM == 'S'){
               numeroSecuencia = clientRes.CreateTicketResult.O_MENSAJE 
            }
        })
        .catch(err => {
            console.log("error de comunicacion",err)
        })
        contador++
    }
    if(numeroSecuencia==null)
    {
        mailController.MailErrorWSTickets(JSON.stringify(paramsWS))
    }
    return numeroSecuencia
}

module.exports = ticketController;
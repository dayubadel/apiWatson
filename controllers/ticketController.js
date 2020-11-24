const soap = require('soap')
const util = require('util')
const config = require("../config/config.js");
const mailController = require('./mailController');
const mail = require("./mailController");
const canalesMensajeriaController = require('./canalesMensajeriaController');

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
        'I_MENSAJE': [{ 'Mensaje' : {'tdline' : detalleTicket} }]    
    }
    console.log(paramsWS)
    var numeroSecuencia = null
    var contador = 0
    while(numeroSecuencia == null && contador<3)
    {
        await soap.createClientAsync(urlSoap)
        .then(async soapClient => {
            const soapCreateOrder = util.promisify(soapClient.CreateTicket)
            return soapCreateOrder(paramsWS)
        })
        .then(clientRes => {
            console.log(clientRes)
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
        var respuestaGrupoWhatsap = []
        var grupoWhatsapp = config.destinatarios.grupoWhatsApp
        respuestaGrupoWhatsap.push(
            {
                response_type:'text',
                text: `Estimados, les saluda Dora.\nEl servicio web de tickets ha fallado después de 3 intentos.\nHe enviado un correo electrónico con los datos del requerimiento del cliente.`
            })
        ticketController.sendWhatsapp(respuestaGrupoWhatsap,grupoWhatsapp)
        mailController.MailErrorWSTickets(JSON.stringify(paramsWS))
    }
    return numeroSecuencia
}
ticketController.sendWhatsapp = (objRespuesta, idWhatsapp) => {
    canalesMensajeriaController.enviarMensajeWhatsapp(objRespuesta,idWhatsapp)
}
module.exports = ticketController;
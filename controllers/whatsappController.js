var fetch = require('node-fetch');
var config = require('./../config/config')

var whatsappController = {}

whatsappController.enviarMensaje = (objMensajeWatson, idWhatsapp) => {
    const uriWhatsapp = config.valorGlobales.uriWhatsapp

    var paramsPetition = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({objMensajeWatson, idWhatsapp})
    }
    
    fetch(uriWhatsapp,paramsPetition)
    .then(res => res.json())
    .then(resWhatapp => {

    })
    .catch(err => {
        //si sudede erro, enviar a grupo de soporte el mensaje
        console.log(err)
    })
}


module.exports = whatsappController
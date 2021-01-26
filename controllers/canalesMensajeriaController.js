var fetch = require('node-fetch');
var config = require('../config/config')

var canalesMensajeriaController = {}

canalesMensajeriaController.enviarMensajeWhatsapp = (objMensajeWatson, idWhatsapp) => {
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
        logger.error({tittle:'Error al enviar un mensaje por whatsapp',type:'Controller',file:'canalesMensajeriaController.js',details: err.originalError.info})
        console.log(err)
    })
}

canalesMensajeriaController.EnviarMensajeMessenger = (objMensajeWatson, idPerfilUsuario) => {
    const uriMessenger = config.valorGlobales.uriMessenger
    const idPaginaFacebook = config.valorGlobales.idPaginaFacebook
    console.log(objMensajeWatson, idPerfilUsuario)
    var paramsPetition = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({'text':objMensajeWatson.text, 'numeroCliente': idPerfilUsuario, 'idPagina' : idPaginaFacebook})
    }
    console.log('paramsPetition')
    console.log(paramsPetition)
    fetch(uriMessenger,paramsPetition)
    .then(res => res.json())
    .then(resWhatapp => {
        console.log('resWhatapp')
        console.log(resWhatapp)
    })
    .catch(err => {
        logger.error({tittle:'Error al enviar un mensaje por messenger',type:'Controller',file:'canalesMensajeriaController.js',details: err.originalError.info})
        console.log(err)
    })
}


module.exports = canalesMensajeriaController
const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const sqlController = require('./sqlController.js')
const config = require("../config/config.js");
const pedidoModel = require('./../models/pedido.js')

const id_workspace = config.Watson.id_workspace
const apikey = config.Watson.apikey
const url = config.Watson.url
const version = config.Watson.version

const watsonController = {};

const assistant = new AssistantV1({
    version: version,
    authenticator: new IamAuthenticator({
      apikey: apikey,
    }),
    url: url,
  });

watsonController.ControlMensajes = async (req, res) => {
    // console.log(req.body)
    let idChat = req.body.idChat //es el idConversacionCanal
    let txtMsg = req.body.textMsg
    let idCanal = req.body.idCanal

    try {

        let objMensajeria = await sqlController.gestionContexto(null,null, idCanal,idChat,1) //consulta el contexto anterior

        let idClienteCanalMensajeria = (objMensajeria.idClienteCanalMensajeria == undefined) ? 0 :  objMensajeria.idClienteCanalMensajeria;

        let contextoAnterior = (objMensajeria.contexto == undefined) ? {} : JSON.parse(objMensajeria.contexto);
        
        
        let watsonResponse = await assistant.message({ //emite mensaje a watson y asigna su respuesta
            workspaceId: id_workspace,
            input: { text: txtMsg},
            context: contextoAnterior
        })

        var contexto = watsonResponse.result.context
        var opcionAcionNode =''
        if(contexto.hasOwnProperty('_actionNode')) 
        {
            opcionAcionNode= 'si'
            let respuesta = await watsonController.AccionesNode(contexto._actionNode,contexto) 
            console.log(respuesta)
            respuesta.forEach(element => {  watsonResponse.result.output.generic.push(element)})
           console.log(watsonResponse.result.output.generic)
            delete contexto._actionNode
          
        }

       // console.log(JSON.stringify(watsonResponse.result,null,4))

        objMensajeria = await sqlController.gestionContexto(contexto, idClienteCanalMensajeria, idCanal,idChat,2) //actualiza el contexto recibido
        
        idClienteCanalMensajeria = (objMensajeria.idClienteCanalMensajeria == undefined) ? 0 :  objMensajeria.idClienteCanalMensajeria;
        contextoAnterior = (objMensajeria.contexto == undefined) ? {} : JSON.parse(objMensajeria.contexto);

        await watsonController.RegistrarMensajes(idClienteCanalMensajeria,watsonResponse.result.input.text,watsonResponse.result.output.generic)
      //  console.log(watsonResponse.result.output.generic, 'normal')
        res.send(watsonResponse.result.output.generic)

     

        // if(opcionAcionNode=='')
        // {
        //     console.log(watsonResponse.result.output.generic, 'normal')
        //     res.send(watsonResponse.result.output.generic)
        // }else 
        // {
        //     console.log(watsonResponse.result.output.generic, 'node')
        //     let listaRespuestas=watsonResponse.result.output.generic
        //     listaRespuestas.forEach(element => {  res.send(element) })
        // }
    
        
    } catch (error) {
        console.log(error)
        res.status(400).send('')
    }
}

watsonController.AccionesNode = async (strAccion, contexto) => {
    var respuesta = []
    if(strAccion == "consultarTienda"){
        var ciudad = contexto.Ciudad   
        var tiendasOrganizadas = {}

        sqlController.consultarTiendasPorCiudad(ciudad)
        .then(data =>{
            data.forEach(elementTienda =>
                {
                    tiendasOrganizadas = {
                        response_type: 'text',
                        text: 'Tienda ubicada en '+elementTienda.direccionEspecifica
                    }
                    respuesta.push(tiendasOrganizadas)
            }            
           )})  
             
    }
    return respuesta   
}

watsonController.RegistrarMensajes = async (idClienteCanalMensajeria, msgUser, outputWatson) => {
    
    var textoMsgWatson = '';

    (async () => {
        for (const item of outputWatson) {
            if(item.response_type =='text' ){
                textoMsgWatson = textoMsgWatson + '\n' +  item.text  
            }else if(item.response_type =='option' ){
                let respuesta = item.title + '\n'
                item.options.forEach(element => {
                    respuesta = respuesta + element.label + '\n'
                });
            }else if(item.response_type =='image' ){

            }
        }
    })();
    
    await sqlController.gestionMensajes(idClienteCanalMensajeria,msgUser,textoMsgWatson)
}

//con esta funcion pueden actualizar entidades en watson directamente desde base de datos
watsonController.ActualizarEntidadesProductos = (req, res) => {
    var entitieCategoriasProductos
    var entitieSubCategoriasProductos
    var entitieProductos

    var params = {
        workspaceId: id_workspace,
        entity: '',
        newValues: []
    };
    var newValuesArr = []

    sqlController.actualizarEntidadesProducto()
    .then(data => {
        entitieCategoriasProductos = data.categoriasProductos
        entitieSubCategoriasProductos = data.subCategoriasProductos
        entitieProductos = data.productos
        //aqui actualizo la entidad categoriasProductos
        params.entity = 'categoriasProductos'

        entitieCategoriasProductos.forEach(element => {
            newValuesArr.push({
                'value': element.nombreCategoria.toString(),
                'type' : 'synonyms',
                'synonyms' : [element.nombreCategoria]
            })
        });

        params.newValues = newValuesArr

        return assistant.updateEntity(params)
    })
    .then(data => {
        newValuesArr= []
        //aqui actualizo la entidad categoriasProductos
        params.entity = 'subCategoriasProductos'

        entitieSubCategoriasProductos.forEach(element => {
            newValuesArr.push({
                'value': element.nombreSubCategoria.toString(),
                'type' : 'synonyms',
                'synonyms' : [element.nombreSubCategoria]
            })
        });

        params.newValues = newValuesArr

        return assistant.updateEntity(params)
    })
    .then(data => {
        newValuesArr= []

        //aqui actualizo la entidad categoriasProductos
        params.entity = 'productos'

        entitieProductos.forEach(element => {
            newValuesArr.push({
                'value': element.productos.toString(),
                'type' : 'synonyms',
                'synonyms' : [element.productos]
            })
        });

        params.newValues = newValuesArr

        return assistant.updateEntity(params)
    })
    .then(data => {
        console.log(JSON.stringify(data.result, null, 2));
        res.send(data)
    })
    .catch(err => {
        console.log(err)
        res.send(err)
    });

}

module.exports = watsonController;


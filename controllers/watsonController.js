const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const sqlController = require('./sqlController.js')
const config = require("../config/config.js");
const pedidoModel = require('./../models/pedido.js')
const id_workspace = config.Watson.id_workspace, apikey = config.Watson.apikey, url = config.Watson.url, version = config.Watson.version
const watsonController = {};
var idChatWhatsApp = ''
//var idChat = ''
// constantre para autenticacion en Watson Assitant
const assistant = new AssistantV1({
    version: version,
    authenticator: new IamAuthenticator({
      apikey: apikey,
    }),
    url: url,
  });

watsonController.ControlMensajes = async (req, res) => {
    console.log(req.body)
    let idChat = req.body.idChat
    let txtMsg = req.body.textMsg
    let idCanal = req.body.idCanal

    
    assistant.message({
        workspaceId: id_workspace,
        //input: { text: txtMsg},
        input: { text: 'Necesito un credito'},
        context: {}
    })
    .then( watsonResponse => {
        if(watsonResponse.result.entities.length>0)
        {
            console.log(watsonResponse.result.entities,'datos generales')
        }
       console.log(JSON.stringify(watsonResponse.result.output.generic8, null, 4))
        res.send(watsonResponse.result.output.generic)
    })

    // console.log(req.body)
    // var intanciaWhatsapp = req.body.intanciaWhatsapp
    // var textMensajeReq = req.body.textMensajeReq
    // var idChat = req.body.idChat

    // var objResToWhatsapp = {
    //     instancia : intanciaWhatsapp,
    //     respuesta : ''
    // }

    // contextoAnterior = await sqlController.gestionContexto('',idChat,2)
    // .then(async contextoAnterior => {
    //     return await assistant.message({
    //         workspaceId: id_workspace,
    //         input: { text:textMensajeReq},
    //         context: contextoAnterior
    //     })

    // })    
    // .then(async watsonResponse => {
    //     const contexto = watsonResponse.result.context
    //     var respuestaToWhatsAppSQL
    //     if(contexto.hasOwnProperty("_accionNode")){
    //         console.log(contexto._accionNode)
    //         respuestaToWhatsAppSQL = await watsonController.AccionesNode(contexto._accionNode, contexto)
    //         watsonResponse.result.output.generic.unshift({
    //             "response_type": "text",
    //             "text": respuestaToWhatsAppSQL
    //         })
            
    //     }


    //     await sqlController.gestionContexto(watsonResponse.result.context,req.body.idChat,1)

    //     //console.log(JSON.stringify(watsonResponse.result, null, 4))

    //     objResToWhatsapp.respuesta = watsonResponse.result.output.generic
       
    //     res.send(objResToWhatsapp)
    // })
    // .catch(err => {

    //     //aque setear instancia de grupo tecnico de gaia para enviar el error
    //     console.log(err)
    //     objResToWhatsapp.respuesta =[{
    //         "response_type": "text",
    //         "text": 'tuve un problema interno. Por favor intentalo mas tarde.'
    //     }]
    //     res.send(objResToWhatsapp)
    // })
}

watsonController.AccionesNode = async (strAccion, contexto) => {

    if(strAccion == "consultarDatosClienteYCategorias"){
        var estado = contexto.estado
        var cliente = {}
        var categorias = []
        var respuesta = ''
        var numeroLista = 0
        var nombreCliente='';


        cliente = await sqlController.gestionClientes(contexto.codUsuario,1)
        //console.log('*********************'+cliente+'********************');
        categorias = await sqlController.gestionCategorias(contexto.codUsuario,1)

        if (estado == 'NO'){
            if (cliente.nombreCliente == undefined){
                respuesta = 'El código ingresado es incorrecto. si no tienes codigo o no te acuerdas puedes decirme no tengo código'
                contexto.conCodigo = 'NO'
                
            }
            else{
                if(contexto.codUsuario!='CF0000'){
                    nombreCliente = cliente.nombreCliente
                    
                }else{
                    nombreCliente = contexto.nombreCF
                    
                }
                respuesta = `Que tal ${nombreCliente}.\n¿Los productos de qué categoría deseas ver?\n- Estas son los disponibles para ti:\n` 
                contexto.conCodigo = 'SI'
            }

        }
        else{

            respuesta = `¿Los productos de qué categoría deseas ver?\n - Estas son los disponibles para ti:\n`



    
        }
        
        
        categorias.forEach(element => {
            numeroLista=numeroLista+1;
            respuesta = respuesta + ' '+numeroLista+'. '+ element + '\n'
        });
        
        if(!contexto.hasOwnProperty("_pedido")){
            contexto._pedido = new pedidoModel.Pedido()
            contexto._nombreCliente = cliente.nombreCliente
            
        }
        //Para la seleccion de numeros
        //crear la variable de contexto para agregar al contexto
        contexto._numCategoria = categorias.length
        contexto._arrCategoria = categorias

        contexto._accionNode='NULL'//RESETEAMOS LA VARIABLE _accionNode en Watson


       return respuesta
        
    }

    if(strAccion == 'consultarProductoXCategoria'){
        var subCategorias = []
        var imagenCategoria = []
        var respuestaUrl
        var respuesta = ''
        var numWhatsapp = []
        var numeroListaProductos = 0;
        
        //para la seleccion de numeros
        var nombreCategoria = ''
        var arrCategoriaProducto
        var varCategoriaProducto
        var arrayCategorias = contexto._arrCategoria

        varCategoriaProducto = contexto.categoriaProductos//"SI:SI AND ( OR (3<=3 AND 3>0))"
        arrCategoriaProducto = varCategoriaProducto.split('(')//sacamos el texto
        nombreCategoria = arrCategoriaProducto[1].split('OR')
        nombreCategoria = nombreCategoria[0].trim()

        if(nombreCategoria == ''){
            arrCategoriaProducto = arrCategoriaProducto[2].split('<')
            //console.log('Entree*1**'+arrCategoriaProducto+'****')
            arrCategoriaProducto = parseInt(arrCategoriaProducto[0])
            //console.log('Entree2***'+arrCategoriaProducto+'****')
            nombreCategoria = arrayCategorias[arrCategoriaProducto-1];
            //console.log('Entree3***'+arrCategoriaProducto+'*********'+nombreCategoria+'****************')
            subCategorias = await sqlController.GestionSubCategorias(contexto.codUsuario,nombreCategoria,1)
            imagenCategoria = await sqlController.GestionSubCategoriasImg(contexto.codUsuario,nombreCategoria,1)
            //respuestaUrl = await sqlController.enviaImg(imagenCategoria[0],idChat,nombreCategoria)
            respuesta = 'image:'+ imagenCategoria[0] + '^'
        }else{
            //console.log('Otro Caso **********'+nombreCategoria+'**********')
            subCategorias = await sqlController.GestionSubCategorias(contexto.codUsuario,nombreCategoria,1)
            imagenCategoria = await sqlController.GestionSubCategoriasImg(contexto.codUsuario,nombreCategoria,1)
            //respuestaUrl = await sqlController.enviaImg(imagenCategoria[0],idChat,nombreCategoria)
            respuesta = 'image:'+ imagenCategoria[0] + '^'
        }


        respuesta = respuesta + `¿Qué producto deseas adquirir?\nLista de Productos:\n`
        //console.log(subCategorias)
        subCategorias.forEach(element => {
            
            numeroListaProductos=numeroListaProductos+1;
            respuesta = respuesta+' '+numeroListaProductos+'. ' + element + '\n'
        });

        contexto._arrSubCategoria = subCategorias
        contexto._numSubCategoria = subCategorias.length
       
        return respuesta
        
    }

    if(strAccion == 'consultarVersionesXProducto'){
        var productos = []
        var respuesta = ''
        var imagenSubCategoria1 = []
        var respuestaUrl1
        var numeroListaVersion=0

        //para la seleccion de numeros
        var nombreSubCategoria
        var arraySubCategoria
        var subCategoriaProducto
        var arrSubCategoriaP = contexto._arrSubCategoria

        subCategoriaProducto = contexto.subCategoria
        arraySubCategoria = subCategoriaProducto.split('(')//sacamos el texto
        nombreSubCategoria = arraySubCategoria[1].split('OR')
        nombreSubCategoria = nombreSubCategoria[0].trim()

        if(nombreSubCategoria==''){
            
            arraySubCategoria = arraySubCategoria[2].split('<')
            arraySubCategoria = parseInt(arraySubCategoria[0])
            nombreSubCategoria = arrSubCategoriaP[arraySubCategoria-1];
            
            productos = await sqlController.GestionProductos(contexto.codUsuario,nombreSubCategoria, undefined,1)
        }else{
            productos = await sqlController.GestionProductos(contexto.codUsuario,nombreSubCategoria, undefined,1)
        }
        
        imagenSubCategoria1 = await sqlController.GestionProductoImg(contexto.codUsuario,nombreSubCategoria, undefined,1)
        //respuestaUrl1 = await sqlController.enviaImg(imagenSubCategoria1[0],idChat,contexto.subCategoria)
        console.log(imagenSubCategoria1,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
        respuesta = 'image:'+ imagenSubCategoria1[0] + '^'
        respuesta = respuesta + `¿Qué presentación quieres comprar?\nTenemos las siguientes:\n`
       

        //console.log(productos)
        productos.forEach(element => {
            numeroListaVersion=numeroListaVersion+1
            respuesta = respuesta+numeroListaVersion+'. ' +  element.nombreProducto  + ' a $' + element.precio + ' \n'
        });

        contexto._arrProductos = productos
        contexto._numProductos = productos.length
        contexto._nombreSubCategoria = nombreSubCategoria

        return respuesta
    }
 
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


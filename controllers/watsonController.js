const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const sqlController = require('./sqlController.js')
const config = require("../config/config.js");
const { json } = require('body-parser');
// const pedidoModel = require('./../models/pedido.js')

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

    let idChat = req.body.idChat //es el idConversacionCanal
    let txtMsg = req.body.textMensajeReq
    let idCanal = req.body.idCanal

    try {
        let objMensajeria = await sqlController.gestionContexto(null,null, idCanal,idChat,1) //consulta el contexto anterior

        let idClienteCanalMensajeria = (objMensajeria.idClienteCanalMensajeria == undefined) ? 0 :  objMensajeria.idClienteCanalMensajeria;

        var contextoAnterior = (objMensajeria.contexto == undefined) ? {} : JSON.parse(objMensajeria.contexto);

        if(Object.keys(contextoAnterior).length === 0 && contextoAnterior.constructor === Object && objMensajeria.idConversacionWatson != null){
            contextoAnterior['conversation_id'] = objMensajeria.idConversacionWatson
        }

        if(objMensajeria.nombres!=null)
        {
            contextoAnterior['nombres'] = objMensajeria.nombres
        }
        
        if(idCanal==1)
        {
            contextoAnterior['telefono'] = idChat.split('@')[0]
        }
        else if(objMensajeria.numeroTelefono!=null)
        {
            contextoAnterior['telefono'] = objMensajeria.numeroTelefono
        }

        if(objMensajeria.idClienteCanalMensajeria!=null)
        {
            contextoAnterior['idClienteCanalMensajeria'] = objMensajeria.idClienteCanalMensajeria
        }
        var idCliente = (objMensajeria.idCliente == undefined ) ? 0 : objMensajeria.idCliente;
        

        let watsonResponse = await assistant.message({ //emite mensaje a watson y asigna su respuesta
            workspaceId: id_workspace,
            input: { text: txtMsg},
            context: contextoAnterior
        })       
        var contexto = watsonResponse.result.context
        console.log("*********************************************")
        console.log(JSON.stringify(watsonResponse.result,null,4))

        if(contexto.hasOwnProperty('_actionNode')) 
        {   
            if(contexto._actionNode == "actualizarCliente")     
            {
                await watsonController.RegistrarCliente(idCliente,contexto) 
            }
            else
            {
                let respuesta = await watsonController.AccionesNode(contexto._actionNode,watsonResponse.result,idClienteCanalMensajeria) 
                respuesta.forEach(element => {  watsonResponse.result.output.generic.push(element)})
                if(contexto.hasOwnProperty('Ciudad') && contexto._actionNode!="consultarSectoresAgrupadosPorCiudad")
                {
                    console.log(contexto.Ciudad)
                    delete contexto.Ciudad
                }
                // if(contexto.hasOwnProperty('marcaProductos') && contexto._actionNode=="consultarProductosPorMarcaPorCategoriaUltimoNivel")
                // {
                //     delete contexto.marcaProductos
                // }
            }
            delete contexto._actionNode          
        }      

        objMensajeria = await sqlController.gestionContexto(contexto, idClienteCanalMensajeria, idCanal,idChat,2) //actualiza el contexto recibido
        idClienteCanalMensajeria = (objMensajeria.idClienteCanalMensajeria == undefined) ? 0 :  objMensajeria.idClienteCanalMensajeria;
        contextoAnterior = (objMensajeria.contexto == undefined) ? {} : JSON.parse(objMensajeria.contexto);

        await watsonController.RegistrarMensajes(idClienteCanalMensajeria,watsonResponse.result.input.text,watsonResponse.result.output.generic)
        res.send(watsonResponse.result.output.generic)
        
    } catch (error) {
        console.log(error)
        res.status(400).send('')
    }
}

watsonController.RegistrarCliente = async (idCliente, contexto) => 
{   
    var nombre =  (contexto.hasOwnProperty("nombres")) ? contexto.nombres : null ; 
    var telefono = (contexto.hasOwnProperty("telefono") ? contexto.telefono : null ) 
  
    await sqlController.actualizarCliente(idCliente,nombre,null,telefono,null,null,0)        
    
}

watsonController.AccionesNode = async (strAccion, result, idClienteCanalMensajeria) => {
    var respuesta = []
    var contexto = result.context
        if(strAccion == "consultarTienda"){
            var ciudad = contexto.Ciudad   
            var tiendasOrganizadas = {}

        await sqlController.consultarTiendasPorCiudad(ciudad)
            .then(data =>{ 
                let contadorTiendas = data.length
                var textoGeneral =  'Contamos con una tienda en '+ciudad+':'
                if(contadorTiendas>1)
                {
                    textoGeneral =  'A continuación, le presento las '+contadorTiendas+' tiendas disponibles en '+ciudad+':'
                }
                tiendasOrganizadas = {
                    response_type: 'text',
                    text: textoGeneral
                }
                respuesta.push(tiendasOrganizadas)
                var contador = 1
                data.forEach(elementTienda =>
                    {
                        var atencionSabado='No atiende días sábados. '
                        if(elementTienda.atiendeSabado==true)
                        {
                            atencionSabado='*Horario sábado:* '+elementTienda.horaAperturaSabado+
                            ' - '+elementTienda.horaCierreSabado+' . '
                        }
                        var atencionDomingo='No atiende días domingos. '
                        if(elementTienda.atiendeDomingo==true)
                        {
                            atencionDomingo='*Horario domingo:* '+elementTienda.horaAperturaDomingo+
                            ' - '+elementTienda.horaCierreDomingo+' . '
                        }
                        tiendasOrganizadas = {
                            response_type: 'text',
                            text: '*ALMACEN # '+contador+'*\n*Dirección:* '+elementTienda.direccionEspecifica+'.\n*Teléfono(s):*'+elementTienda.telefonos+'.\n*Horario de lunes a viernes:* '+
                            elementTienda.horaApertura+' - '+elementTienda.horaCierre+'.\n'+atencionSabado+'\n'+atencionDomingo
                        }
                    
                        respuesta.push(tiendasOrganizadas)
                        contador++
                }            
            )})              
        }
        else if(strAccion == "consultarSectoresAgrupadosPorCiudad"){
            var ciudad = contexto.Ciudad   
            var sectores =''

        await sqlController.consultarSectoresAgrupadosPorCiudad(ciudad)
            .then(data =>{ 
                data.forEach(element => {
                     sectores = sectores + element.sector + ' - '
                })
                let sectorRespuesta =  {
                    response_type: 'text',
                    text: 'En '+ciudad+' tenemos almacenes en los sectores: '+sectores+'. Por favor, indicame en qué sector deseas consultar.'
                }
                respuesta.push(sectorRespuesta)
            })
        }
        else   if(strAccion == "consultarTiendasPorCiudadPorSector"){
            var ciudad = contexto.Ciudad
            var sector = contexto.Sector  
            var tiendasOrganizadas = {}
    
           await sqlController.consultarTiendasPorCiudadPorSector(ciudad, sector)
            .then(data =>{ 
                let contadorTiendas = data.length
                var textoGeneral =  'Contamos con una tienda en el sector '+sector+ ' de '+ciudad+':'
                if(contadorTiendas>1)
                {
                    textoGeneral =  'A continuación, le presento las '+contadorTiendas+' tiendas disponibles en el sector '+sector+' de '+ciudad+':'
                }
                tiendasOrganizadas = {
                    response_type: 'text',
                    text: textoGeneral
                }
                respuesta.push(tiendasOrganizadas)
                var contador = 1
                data.forEach(elementTienda =>
                    {
                        var atencionSabado='No atiende días sábados. '
                        if(elementTienda.atiendeSabado==true)
                        {
                            atencionSabado='*Horario sábado:* '+elementTienda.horaAperturaSabado+
                            ' - '+elementTienda.horaCierreSabado+' . '
                        }
                        var atencionDomingo='No atiende días domingos. '
                        if(elementTienda.atiendeDomingo==true)
                        {
                            atencionDomingo='*Horario domingo:* '+elementTienda.horaAperturaDomingo+
                            ' - '+elementTienda.horaCierreDomingo+' . '
                        }
                        tiendasOrganizadas = {
                            response_type: 'text',
                            text: '*ALMACEN # '+contador+'*\n*Dirección:* '+elementTienda.direccionEspecifica+'.\n*Teléfono(s):*'+elementTienda.telefonos+'.\n*Horario de lunes a viernes:* '+
                            elementTienda.horaApertura+' - '+elementTienda.horaCierre+'.\n'+atencionSabado+'\n'+atencionDomingo
                        }
                      
                        respuesta.push(tiendasOrganizadas)
                        contador++
                }          
               )})              
        }       
        else if(strAccion == "insertarValoracion"){
            var valor = contexto.valorfeedback
            await sqlController.insertarValoracion(idClienteCanalMensajeria,valor,null,null)
            .then(data =>{ 

                let valoracionRespuesta =  {
                    response_type: 'text',
                    text: 'Muchas gracias por su valoración.'
                }
                respuesta.push(valoracionRespuesta)
            })
        }
        else if(strAccion == "consultarCategoriasPorCategoria")
        {
            var categoriasHijas = {}
            var nombreCategoria = contexto.categoria
            await sqlController.consultarCategoriasPorCategoria(nombreCategoria)
            .then(data => {
                categoriasHijas =   { response_type: "text", text: 'Tenemos las siguientes subcategorías:'}                      
                respuesta.push(categoriasHijas)
                data.forEach(element =>  {
                    categoriasHijas = { response_type: "text", text: element.nombreCategoriaHija }
                    respuesta.push(categoriasHijas)
                })
            })
        }
        else if(strAccion == "consultarCategoriasNivelMasBajo"){

            await sqlController.consultarCategoriasNivelMasBajo()
            .then(sqlResult => {
                respuesta.push({ response_type: "text", text: 'Tenemos estas categorias para ti:'})
                sqlResult.forEach(cat => {
                    respuesta.push(
                        {
                            response_type: "text",
                            text: cat.nombreCategoria
                        }
                    )
                });
            })

        }
        else if(strAccion== "consultarMarcasPorCategoriaUltimoNivel")
        {
            var categoriaUltimoNivel = contexto.categoriaUltimoNivel
            await sqlController.consultarMarcasPorCategoriaUltimoNivel(categoriaUltimoNivel)
            .then(result => {
                let tipoResultado = result[0].tipoResultado
                if(tipoResultado=="marcas")
                {
                    respuesta.push({response_type: "text", text:`Disponemos *${categoriaUltimoNivel}* de las siguientes marcas: `})
                    result.forEach(
                        marca => {
                            respuesta.push({response_type: "text", text:marca.nombreMarca+' ('+marca.totalProductos+') '})
                        }
                    )
                }
                else 
                {
                    var productosMostrados = []
                    respuesta.push({response_type: "text", text:`Disponemos de los siguientes productos en *${categoriaUltimoNivel}*:`})
                    let resultMapped = result.reduce((acc, item) => {
                        (acc[item.idProducto] = acc[item.idProducto] || []).push({'nombre':item.nombreCaracteristicaK, 'value': item.caracteristicaValue});
                            return acc;
                        }, []);
                    var num =1;
          
                    resultMapped.forEach(elementProducto => {
                        var carTexto = "";
                        var urlImagen ="";
                        var nombreProducto ="";
                        elementProducto.forEach(elementCaracteristica => 
                            {
                               if(elementCaracteristica['nombre']=="imagen")
                               {
                                    urlImagen = JSON.parse(elementCaracteristica['value'])[0].ImageUrl
                               }
                               else if(elementCaracteristica['nombre']=="nombreProducto")
                               {
                                    nombreProducto = elementCaracteristica['value']
                                    productosMostrados.push({
                                        "pocision": num,
                                        "nombre" : nombreProducto
                                    })
                               }
                               else
                               {
                                    carTexto = `${carTexto} *- ${elementCaracteristica['nombre']}:* ${elementCaracteristica['value']}\n`
                               }
                            })
                        respuesta.push({
                            response_type: "text", 
                            text: `*${num}) ${nombreProducto}*\n${carTexto}`
                        })
                        num++;
                    }) 
                    
                    respuesta.push({
                        response_type: "text", 
                        text: `Por favor, indicame cual te interesa`
                    });
                    contexto['productosMostrados'] = productosMostrados
                }
            })
        }
        else if(strAccion == "consultarProductosPorMarcaPorCategoriaUltimoNivel")
        {
            let categoriaUltimoNivel = contexto.categoriaUltimoNivel
            let marcaProductos = contexto.marcaProductos
            await sqlController.consultarProductosPorMarcaPorCategoriaUltimoNivel(categoriaUltimoNivel, marcaProductos)
            .then(result => {
                let tipoResultado = result[0].tipoResultado
                if(tipoResultado=="marcas")
                {
                    respuesta.push({response_type: "text", text:"No hemos encontrado "+categoriaUltimoNivel+" en la marca "+marcaProductos+"\nDisponemos de las siguientes marcas: "})
                    result.forEach(elementMarca => respuesta.push({response_type: "text", text:elementMarca.nombreMarca+" ("+ elementMarca.totalProductos +") "}) )
                }
                else 
                {
                    var productosMostrados = []
                    respuesta.push({response_type: "text", text:`Disponemos de los siguientes *${categoriaUltimoNivel} ${marcaProductos}* productos:`})
                    let resultMapped = result.reduce((acc, item) => {
                        (acc[item.idProducto] = acc[item.idProducto] || []).push({'nombre':item.nombreCaracteristicaK, 'value': item.caracteristicaValue});
                            return acc;
                        }, []);
                    var num =1;
          
                    resultMapped.forEach(elementProducto => {
                        var carTexto = "";
                        var urlImagen ="";
                        var nombreProducto ="";
                        elementProducto.forEach(elementCaracteristica => 
                            {
                               if(elementCaracteristica['nombre']=="imagen")
                               {
                                    urlImagen = JSON.parse(elementCaracteristica['value'])[0].ImageUrl
                               }
                               else if(elementCaracteristica['nombre']=="nombreProducto")
                               {
                                    nombreProducto = elementCaracteristica['value']
                                    productosMostrados.push({
                                        "pocision": num,
                                        "nombre" : nombreProducto
                                    })
                               }
                               else
                               {
                                    carTexto = `${carTexto} *- ${elementCaracteristica['nombre']}:* ${elementCaracteristica['value']}\n`
                               }
                            })
                        respuesta.push({
                            response_type: "text", 
                            text: `*${num}) ${nombreProducto}*\n${carTexto}`
                        })
                        num++;
                    }) 
                    
                    respuesta.push({
                        response_type: "text", 
                        text: `Por favor, indicame cual te interesa`
                    });
                    contexto['productosMostrados'] = productosMostrados
                }
            })
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
//esta funcion es obsoleta y debe ser borrada
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
      //  console.log(JSON.stringify(data.result, null, 2));
        res.send(data)
    })
    .catch(err => {
        console.log(err)
        res.send(err)
    });

}

module.exports = watsonController;


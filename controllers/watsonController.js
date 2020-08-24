const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const sqlController = require('./sqlController.js')
const mailController = require('./mailController.js')
const config = require("../config/config.js");
const { json } = require('body-parser');
const { sql } = require('../config/config.js');
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

        if(objMensajeria.numeroReferencia!=null)
        {
            contextoAnterior['numeroReferencia'] = objMensajeria.numeroReferencia
        }

        var idCliente = (objMensajeria.idCliente == undefined ) ? 0 : objMensajeria.idCliente;

        var carritoCompras = await sqlController.gestionCarritoCompras(idClienteCanalMensajeria,0,0,null,0,2)

        if(carritoCompras.length>0)
        {
            carritoActual = []
            let numeroRegistro = 1
            carritoCompras.forEach(element => {
                carritoActual.push({    
                    p : numeroRegistro, idDetalleVenta: element.idDetalleVenta, 
                    nombreProducto: element.nombreProducto, cantidad: element.cantidad,
                    precioProducto: element.precioProducto, metodoPago : element.metodoPago
                })
                numeroRegistro++
            })
            contextoAnterior['carritoActual'] = carritoActual
        } 

        var cabeceraVenta = await sqlController.gestionCabeceraVenta(contextoAnterior.numeroReferencia,null,null,null,null,null,2)
        if(cabeceraVenta.length>0)
        {
            if(cabeceraVenta[0].nombresCabecera!=null)
            { contextoAnterior['primerNombre'] = cabeceraVenta[0].nombresCabecera }
            if(cabeceraVenta[0].apellidosCabecera!=null)
            { contextoAnterior['primerApellido'] = cabeceraVenta[0].apellidosCabecera }
            if(cabeceraVenta[0].numeroTelefono!=null)
            { contextoAnterior['telefono'] = cabeceraVenta[0].numeroTelefono }
            if(cabeceraVenta[0].numIdentificacion!=null)
            { contextoAnterior['numIdentificacion'] = cabeceraVenta[0].numIdentificacion }
            if(cabeceraVenta[0].tipoIdentificacion!=null)
            { contextoAnterior['tipoIdentificacion'] = cabeceraVenta[0].tipoIdentificacion }
        }

        let watsonResponse = await assistant.message({ //emite mensaje a watson y asigna su respuesta
            workspaceId: id_workspace,
            input: { text: txtMsg},
            context: contextoAnterior,
            nodesVisitedDetails : true
        })

        //bloque para reportes
        var contar = watsonResponse.result.output.generic.length
        contar = contar-1
        for(i=0;i<=contar;i++){
            if(watsonResponse.result.output.generic[i].text=="" || watsonResponse.result.output.generic[i].text==" "){
                watsonResponse.result.output.generic.splice(i,1)
                console.log('texto '+i+'-delete')
            }
        }

        var contexto = watsonResponse.result.context
        //console.log("********************este llega de watson*****************")
        //console.log(JSON.stringify(watsonResponse.result,null,4))
        //console.log("********************este llega de watson*****************")

        if(contexto.hasOwnProperty('_actionNode'))
        {
            if(contexto._actionNode == "actualizarCliente")
            {
                await watsonController.RegistrarCliente(idCliente,contexto)
            }
            else
            {
                let respuesta = await watsonController.AccionesNode(contexto._actionNode,watsonResponse.result,idClienteCanalMensajeria)
                respuesta.forEach(element => {
                    watsonResponse.result.output.generic.push(element)
                });
                if(contexto.hasOwnProperty('Ciudad') && contexto._actionNode!="consultarSectoresAgrupadosPorCiudad")
                {
                    delete contexto.Ciudad
                }
                if(contexto.hasOwnProperty('marcaProductos') && contexto.hasOwnProperty('categoriaUltimoNivel')
                    && contexto._actionNode=="consultarProductosPorMarcaPorCategoriaUltimoNivel" &&  
                    (contexto.hasOwnProperty('opcionNoValida') && contexto.opcionNoValida == null ))
                {
                    delete contexto.marcaProductos
                    delete contexto.categoriaUltimoNivel
                    delete contexto.categoria
                    console.log("entro if 1")
                }

                if(contexto.hasOwnProperty('categoria') && contexto._actionNode=="consultarCategoriasPorCategoria" && (!(contexto.hasOwnProperty('opcionNoValida')) || contexto.opcionNoValida == null ))
                {
                    console.log("entro if 2")
                    delete contexto.categoria
                }
            }
            delete contexto._actionNode
        }

        // console.log("********************este se va a BD*****************")
        // console.log(JSON.stringify(watsonResponse.result,null,4))
        // console.log("********************este se va a BD*****************")
        objMensajeria = await sqlController.gestionContexto(contexto, idClienteCanalMensajeria, idCanal,idChat,2) //actualiza el contexto recibido
        idClienteCanalMensajeria = (objMensajeria.idClienteCanalMensajeria == undefined) ? 0 :  objMensajeria.idClienteCanalMensajeria;
        contextoAnterior = (objMensajeria.contexto == undefined) ? {} : JSON.parse(objMensajeria.contexto);
        
        //anterior a reportes
        //await watsonController.RegistrarMensajes(idClienteCanalMensajeria,watsonResponse.result.input.text,watsonResponse.result.output.generic)
        
        //bloque reportes hasta registar mensaje
        var inputTextUsuario = watsonResponse.result.input.text
        var outputWatsonRespuesta = watsonResponse.result.output.generic
        var intencionesWatson = watsonResponse.result.intents
        
        if(Object.entries(intencionesWatson).length === 0){//De esta manera podemos validar rápidamente si el objeto esta vacío o no.
            intencionesWatson = ' '
        }

        var entidadesWatson = watsonResponse.result.entities

        if(Object.entries(entidadesWatson).length === 0){
            entidadesWatson = ' '
        }

        var contextoConversacion = watsonResponse.result
        await watsonController.RegistrarMensajes(idClienteCanalMensajeria,inputTextUsuario,outputWatsonRespuesta,intencionesWatson,entidadesWatson,contextoConversacion)
        
        
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
            var txtCategoriasHijas = '',
                nombreCategoria = contexto.categoria,
                num = 1,
                menuMostradoProductos = {
                    "tipoMenu" : "categoria",
                    'menuMostrado' : [],
                     "actionNodeAnterior" : strAccion
                };

            await sqlController.consultarCategoriasPorCategoria(nombreCategoria)
            .then(data => {
                respuesta.push({
                    response_type: "text",
                    text: `En *${nombreCategoria}* contamos con las siguientes *Sub Categorías:*`
                });
                data.forEach(element =>  {
                    txtCategoriasHijas = `${txtCategoriasHijas}${(txtCategoriasHijas=='') ? '' : '\n'}*${num}) ${element.nombreCategoriaHija}*`
                    menuMostradoProductos.menuMostrado.push({
                        "pocision": num,
                        "nombre" : element.nombreCategoriaHija,
                        "tipoCategoria": element.tipoCategoria
                    });
                    num++;
                });
                respuesta.push({
                    response_type: "text",
                    text: txtCategoriasHijas
                });
                if(contexto.hasOwnProperty('menuMostradoProductos')){
                    delete contexto.menuMostradoProductos
                }
                contexto['menuMostradoProductos'] = menuMostradoProductos;

            });
        }
        else if(strAccion == "consultarCategoriasNivelMasBajo"){

            await sqlController.consultarCategoriasNivelMasBajo()
            .then(sqlResult => {
                respuesta.push({
                    response_type: "text",
                    text: 'Pensando en tus necesidades, contamos con una gran variedad de productos en las siguientes *categorias:*'
                });
                let arrayCategorias = '',
                    num = 1
                    menuMostradoProductos = {
                        "tipoMenu" : "categoria",
                        'menuMostrado' : [],
                        "actionNodeAnterior" : strAccion
                    };
                sqlResult.forEach(cat => {
                    arrayCategorias = `${arrayCategorias}${(arrayCategorias=='') ? '' : '\n'}*${num}) ${cat.nombreCategoria}*`;
                    menuMostradoProductos.menuMostrado.push({
                        "pocision": ''+num,
                        "nombre" : cat.nombreCategoria,
                        "tipoCategoria":"categoria"
                    });
                    num++;
                });
                respuesta.push({
                    response_type: "text",
                    text: arrayCategorias//cat.nombreCategoria
                });

                if(contexto.hasOwnProperty('menuMostradoProductos')){
                    delete contexto.menuMostradoProductos
                }
                contexto['menuMostradoProductos'] = menuMostradoProductos;

            });

        }
        else if(strAccion== "consultarMarcasPorCategoriaUltimoNivel")
        {
            var categoriaUltimoNivel = contexto.categoriaUltimoNivel
            await sqlController.consultarMarcasPorCategoriaUltimoNivel(categoriaUltimoNivel)
            .then(result => {
                var tipoResultado = result[0].tipoResultado,
                    num = 1
                    menuMostradoProductos = {
                        "tipoMenu" : "",
                        'menuMostrado' : [],
                        "actionNodeAnterior" : strAccion
                    };
                if(tipoResultado=="marcas")
                {
                    menuMostradoProductos.tipoMenu = 'marcaProductos';
                    var txtMarcas = '';
                    respuesta.push({
                        response_type: "text",
                        text:`Disponemos de las siguientes marcas para *${categoriaUltimoNivel}:* `
                    })
                    result.forEach(marca => {
                        txtMarcas = `${txtMarcas}${(txtMarcas == '')? '' : '\n'} *${num}) ${marca.nombreMarca}*`//+marca.totalProductos => total de productos dentro de la marca => por si acaso, saber que esta ahi
                        menuMostradoProductos.menuMostrado.push({
                            "pocision": num,
                            "nombre" : marca.nombreMarca,
                            "tipoCategoria": "marcaProductos"
                        });
                        num++;
                    });
                    respuesta.push({
                        response_type: "text",
                        text: txtMarcas
                    });
                    if(contexto.hasOwnProperty('menuMostradoProductos')){
                        delete contexto.menuMostradoProductos
                    }
                    contexto['menuMostradoProductos'] = menuMostradoProductos;

                }
                else {
                    var menuMostradoProductos = {
                        "tipoMenu" : "",
                        'menuMostrado' : [],
                        "actionNodeAnterior" : strAccion
                    };

                    respuesta.push({response_type: "text", text:`Disponemos de los siguientes productos en *${categoriaUltimoNivel}*:`})

                    let resultMapped = result.reduce((acc, item) => {
                        (acc[item.idProducto] = acc[item.idProducto] || []).push({'nombre':item.nombreCaracteristicaK, 'value': item.caracteristicaValue});
                            return acc;
                    }, []);

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
                                    menuMostradoProductos.menuMostrado.push({
                                        "pocision": num,
                                        "nombre" : nombreProducto,
                                        "tipoCategoria": "productosEspecificos"
                                    });
                               }
                               else if(elementCaracteristica['nombre']!="idProducto")
                               {
                                    carTexto = `${carTexto} ${(carTexto == '') ? '' : '\n'} *- ${elementCaracteristica['nombre']}:* ${elementCaracteristica['value']}`
                               }
                            })
                            
                            respuesta.push({
                                response_type: "image",
                                title: `*${num}) ${nombreProducto}*\n${carTexto}`,
                                source: urlImagen
                            })
                            num++;
                    })

                    respuesta.push({
                        response_type: "text",
                        text: `Por favor, selecciona el *número* del producto que te interesa`
                    });
                    if(contexto.hasOwnProperty('menuMostradoProductos')){
                        delete contexto.menuMostradoProductos
                    }
                    contexto['menuMostradoProductos'] = menuMostradoProductos;
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
                    respuesta.push({
                        response_type: "text",
                        text:"No hemos encontrado "+categoriaUltimoNivel+" en la marca "+marcaProductos+"\nDisponemos de las siguientes marcas: "
                    });
                    respuesta.push({
                        response_type: "text",
                        text:"Este probar cuando entra"
                    });
                    result.forEach(elementMarca => {
                        respuesta.push({
                            response_type: "text",
                            text:elementMarca.nombreMarca+" ("+ elementMarca.totalProductos +") "
                        });
                    });
                }
                else
                {
                    var menuMostradoProductos = {
                        "tipoMenu" : "",
                        'menuMostrado' : [],
                        "actionNodeAnterior" : strAccion
                    };
                    respuesta.push({response_type: "text", text:`Disponemos de los siguientes *${categoriaUltimoNivel} en la marca ${marcaProductos}*:`})
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
                                    menuMostradoProductos.menuMostrado.push({
                                        "pocision": num,
                                        "nombre" : nombreProducto,
                                        "tipoCategoria": "productosEspecificos"
                                    });
                               }
                               else if(elementCaracteristica['nombre']!="idProducto")
                               {
                                    carTexto = `${carTexto} ${(carTexto == '') ? '' : '\n'} *- ${elementCaracteristica['nombre']}:* ${elementCaracteristica['value']}`
                               }
                            })

                            respuesta.push({
                                response_type: "image",
                                title: `*${num}) ${nombreProducto}*\n${carTexto}`,
                                source: urlImagen
                            })
                            num++;
                    })

                    respuesta.push({
                        response_type: "text",
                        text: `Por favor, selecciona el *número* del producto que te interesa`
                    });
                    if(contexto.hasOwnProperty('menuMostradoProductos')){
                        delete contexto.menuMostradoProductos
                    }
                    contexto['menuMostradoProductos'] = menuMostradoProductos;
                }
            })
        }
        else if(strAccion == 'consultarInfoProducto'){
            let producto,
                txtCarac = '';

            producto = await sqlController.consultarInfoProducto(contexto.productoSelected)

            //comentado por pruebas locales
            producto.arrayImagenes.forEach(imgItem => {
                respuesta.push({
                    response_type: "image",
                    // title: `*${num}) ${nombreProducto}*\n${carTexto}`,
                    source: imgItem.ImageUrl
                })
            });
            respuesta.push({
                response_type: "text",
                text: `El producto *${producto.nombre}* cuenta con las siguientes *caracteristicas:* ${producto.arrayCarac}`
            });
            respuesta.push({
                response_type: "text",
                text: `¿Deseas conocer el precio de este producto?\nEsta disponible para pagos con:\n ${(producto.stockCC > 0 && producto.stockOtroPago > 0 && producto.isMarketplace == 'no') ? '*- Crédito Directo Comandato*\n *- Tarjetas de Credito o Debito*\n *- Efectivo*': (producto.stockCC > 0 && producto.isMarketplace == 'no') ? ' *- Crédito Directo Comandato*' : ' *- Tarjetas de Credito o Debito*\n *- Efectivo*' }`
            });

            contexto['infoProductoSelected'] = {
                'idproductoBot' : producto.idProductoBot,
                'nombreProducto' : producto.nombre,
                'idVtex' : producto.idVtex,
                'stockCC' : producto.stockCC,
                'stockOtroPago' : producto.stockOtroPago,
                'precioCC' : producto.precioCC,
                'precioOtroPago' : producto.precioOtroPago,
                'cuotasPrecioCC' : producto.cuotasPrecioCC,
                'plazoGarantia' : producto.plazoGarantia,
                'isMarketplace' : producto.isMarketplace
            }

        }
        else if(strAccion=='agregarProductoAlCarrito')
        {
            await sqlController.gestionCarritoCompras(idClienteCanalMensajeria,0,contexto.infoProductoSelected.idproductoBot,
                contexto.metodoPago,contexto.cantidadProductos,1)
            .then(resultQuery =>
            {
                respuesta.push({response_type:'text', text: `Tiene un *carrito de compras activo* con el *método de pago* ${resultQuery[0].metodoPago}`})
                respuesta.push({response_type:'text', text: `Se agregaron *${contexto.cantidadProductos} ${contexto.infoProductoSelected.nombreProducto}* exitosamente`})
                respuesta.push({response_type:'text', text: `*Detalles adicionales:*\n*Cantidad:* ${resultQuery[0].cantidad}\n*Producto:* ${resultQuery[0].nombreProducto}\n*Precio unitario:* $${(resultQuery[0].precioProducto*1.12).toFixed(2)} _incluye IVA_\n*Total:* $${((resultQuery[0].precioProducto*1.12)*resultQuery[0].cantidad).toFixed(2)}`})
                respuesta.push({response_type:'text', text: 'Indícame qué más deseas hacer: \n- *Agregar productos* al carrito\n- *Quitar productos* del carrito\n- *Consultar carrito* de compras\n- *Finalizar compra*\n'})
                delete contexto.metodoPago
                delete contexto.mostrarCarrito
                delete contexto.marcaProductos
                delete contexto.categoriaUltimoNivel
                delete contexto.marcaProductos
                delete contexto.productoSelected
                delete contexto.infoProductoSelected
            })
        }
        else if(strAccion=='presentarCarritoDeCompras')
        {           
            respuesta.push({response_type:'text',text:`Con el método de pago seleccionado *${contexto.carritoActual[0].metodoPago}*`})
            respuesta.push({response_type:'text',text:'Su *carrito de compras* contiene los siguientes *productos*:'})
            let totalFactura= 0
            contexto.carritoActual.forEach(element => {
                let total = element.cantidad*(element.precioProducto*1.12)
                totalFactura=totalFactura+total
                respuesta.push({response_type:'text',text:`*Registro ${element.p}*\n*Cantidad:* ${element.cantidad}\n*Producto:* ${element.nombreProducto}\n*Precio unitario:* $${(element.precioProducto*1.12).toFixed(2)} _incluye IVA_\n*Total:* $${total.toFixed(2)}`})           
            })
            respuesta.push({response_type:'text', text: `*Total a pagar:* $${totalFactura.toFixed(2)} _incluye IVA_`})
            respuesta.push({response_type:'text', text: 'Indícame qué más deseas hacer: \n- *Agregar productos* al carrito\n- *Quitar productos* del carrito\n- *Finalizar compra*'})
        }
        else if(strAccion=="consultarProductosCarritoParaQuitar")
        {            
            respuesta.push({response_type: 'text', text: 'Su *carrito de compras* contiene los siguientes *registros*:'})
            let totalFactura = 0
            contexto.carritoActual.forEach(element => {
                let total = element.cantidad*(element.precioProducto*1.12)
                totalFactura=totalFactura+total
                respuesta.push({response_type:'text',text:`*Registro ${element.p}*\n*Cantidad:* ${element.cantidad}\n*Producto:* ${element.nombreProducto}\n*Precio unitario:* $${(element.precioProducto*1.12).toFixed(2)} _incluye IVA_\n*Total:* $${total.toFixed(2)}`})
            })
            respuesta.push({response_type:'text', text: `*Total a pagar:* $${totalFactura.toFixed(2)} _incluye IVA_`})
            respuesta.push({response_type: 'text', text: 'Por favor, seleccione el *número del registro* que desea quitar de su carrito'})
        }
        else if(strAccion=="eliminarProductoCarritoCompras")
        {
            await sqlController.gestionCarritoCompras(idClienteCanalMensajeria,contexto.idDetalleSelectedEliminar,0,null,0,3)
            .then(resultQuery => {
                respuesta.push({response_type:'text', text: 'El producto fue eliminado exitosamente'})
                if(resultQuery.length==0)
                {
                    respuesta.push({response_type:'text',text:'Actualmente no tiene un carrito de compras activo'})
                    respuesta.push({response_type:'text', text: 'Indícame qué más deseas hacer: \n- Ver el *catálogo de productos*\n- Volver al *menú principal*'})
                    delete contexto.carritoActual
                }
                else
                {
                    respuesta.push({response_type:'text',text:`*Con el método de pago seleccionado:* ${resultQuery[0].metodoPago}`})
                    respuesta.push({response_type:'text',text:'Su *carrito de compras* contiene los siguientes *productos*:'})
                    let totalFactura= 0
                    carritoActual = []
                    let numeroRegistro = 1
                    resultQuery.forEach(element => {
                        carritoActual.push({p : numeroRegistro, idDetalleVenta: element.idDetalleVenta, nombreProducto: element.nombreProducto, cantidad: element.cantidad, precioProducto: element.precioProducto, metodoPago : element.metodoPago})
                        let total = element.cantidad*element.precioProducto
                        totalFactura=totalFactura+total
                        respuesta.push({response_type:'text',text:`*Registro ${numeroRegistro}*\n*Cantidad:* ${element.cantidad}\n*Producto:* ${element.nombreProducto}\n*Precio unitario:* $${element.precioProducto}\n*Total:* $${total}`})
                        numeroRegistro++
                    })
                    contexto['carritoActual'] = carritoActual
                    respuesta.push({response_type:'text', text: `*Total a pagar:* $${totalFactura.toFixed(2)}`})
                    respuesta.push({response_type:'text', text: 'Indícame qué más deseas hacer: \n- *Agregar productos* al carrito\n- *Quitar productos* del carrito\n- *Finalizar compra*'})
                    delete contexto.metodoPago
                    delete contexto.mostrarCarrito
                    delete contexto.marcaProductos
                    delete contexto.categoriaUltimoNivel
                    delete contexto.marcaProductos
                    delete contexto.productoSelected
                    delete contexto.infoProductoSelected
                }
            })
        }
        else if(strAccion=='enviarLinkPago'){

            const datosCP = contexto.datosCliente
            datosCP.order_description = datosCP.order_description.replace(/\s/g,'%20')
            respuesta.push({
                response_type:'text',
                text: `http://1ffa79554e3b.ngrok.io/pago?user_id=${datosCP.user_id}&order_vat=${datosCP.order_vat}&user_email=${datosCP.user_email}&user_phone=${datosCP.user_phone}&order_amount=${datosCP.order_amount}&order_reference=${datosCP.order_reference}&order_description=${datosCP.order_description}&order_tax_percentage=${datosCP.order_tax_percentage}&order_taxable_amount=${datosCP.order_taxable_amount}`
            })
        }
        else if(strAccion == "consultarAlternativaProducto"){
            const metodoPago = contexto.tipoPago
            const productoSelected = contexto.productoSelected
            await sqlController.ConsultarProductoAlterno(metodoPago,productoSelected)
            .then(result => {
                let tipoResultado = result[0].tipoResultado
                var menuMostradoProductos = {
                    "tipoMenu" : "",
                    'menuMostrado' : [],
                    "actionNodeAnterior" : strAccion
                };
                respuesta.push({response_type: "text", text:`Disponemos de los siguientes productos que te podrían interesar con ese *metodo de pago*:`})
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
                                menuMostradoProductos.menuMostrado.push({
                                    "pocision": num,
                                    "nombre" : nombreProducto,
                                    "tipoCategoria": "productosEspecificos"
                                });
                           }
                           else if(elementCaracteristica['nombre']!="idProducto")
                           {
                                carTexto = `${carTexto} ${(carTexto == '') ? '' : '\n'} *- ${elementCaracteristica['nombre']}:* ${elementCaracteristica['value']}`
                           }
                        })

                        respuesta.push({
                            response_type: "image",
                            title: `*${num}) ${nombreProducto}*\n${carTexto}`,
                            source: urlImagen
                        })
                        num++;
                })

                respuesta.push({
                    response_type: "text",
                    text: `Por favor, selecciona el *número* del producto que te interesa`
                });
                if(contexto.hasOwnProperty('menuMostradoProductos')){
                    delete contexto.menuMostradoProductos
                }
                contexto['menuMostradoProductos'] = menuMostradoProductos;
            })

        }           
        else if(strAccion == 'enviarCorreoCompraFinalizada')
        {
            await sqlController.gestionCabeceraVenta(contexto.numeroReferencia,contexto.primerNombre,contexto.primerApellido,contexto.tipoIdentificacion,contexto.numIdentificacion,contexto.telefono,1)
            .then(resultSql => {
                if(resultSql.length>0)
                {            
                    let current_datetime = resultSql[0].fechaFinalizacion
                    let formattedDate = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() 
                    let titulo = `Compra Finalizada - Factura: #${contexto.numeroReferencia} `
                    let cabecera = `<div>    
                                        <p>Estimados</p>           
                                        <p>A continuacion se muestran los datos de una intención de compra a través del asistente virtual Dora:</p>
                                        <br>           
                                        <p>Referencia: ${contexto.numeroReferencia}</p>
                                        <p>Fecha de finalización: ${formattedDate}</p>
                                        <p>Nombres: ${contexto.primerNombre}</p>
                                        <p>Apellidos: ${contexto.primerApellido}</p>
                                        <p>${contexto.tipoIdentificacion}: ${contexto.numIdentificacion}</p>
                                        <p>Metodo de pago: ${contexto.metodoPago}</p>
                                        </div>`

                    var cabeceraTabla = `<tr>
                                            <th>N</th>
                                            <th>Cantidad</th>
                                            <th>Producto</th>
                                            <th>Precio Unitario</th>
                                            <th>Precio Total</th>
                                        </tr>`
                    filaCuerpo = ''
                    var totalFactura = 0
                    contexto.carritoActual.forEach(element =>
                        {
                            let total = element.cantidad*element.precioProducto
                            filaCuerpo = filaCuerpo + `<tr>
                                                            <td>${element.p}</td>
                                                            <td>${element.cantidad}</td>
                                                            <td>${element.nombreProducto}</td>
                                                            <td>${element.precioProducto}</td>
                                                            <td>${total.toFixed(2)}</td>
                                                        </tr>`
                            totalFactura = totalFactura + total
                        })
                    filaCuerpo = filaCuerpo +  `<tr>
                                                    <td colspan="3">SUBTOTAL</td>
                                                    <td colspan="3">${totalFactura.toFixed(2)}</td>
                                                </tr>
                                                <tr>
                                                    <td colspan="3">IVA</td>
                                                    <td colspan="3">${(totalFactura*0.12).toFixed(2)}</td>
                                                </tr>
                                                <tr>
                                                    <td colspan="3">TOTAL A PAGAR</td>
                                                    <td colspan="3">${(totalFactura*1.12).toFixed(2)}</td>
                                                </tr>`
                                                              
                                        var tabla = `<table style="text-align:center;border:1px solid blak" class="table-responsive">${cabeceraTabla}${filaCuerpo}</table><br><h4>Correo enviado automáticamente desde la asistente virtual Dora</h4>  `
                    var contenido = `${cabecera}${tabla}`
                        mailController.enviarEmail(titulo, contenido)
                    .then(respuesta => {
                        console.log(respuesta)
                    })
            }
        })
        }
        /*comentado v 2.0
        else if (strAccion=='consultarProductosPorMarcaPorCategoriaGeneral' || strAccion == 'consultarMarcasPorCategoriaGeneral' || strAccion == 'consultarCategoriasPorCategoria' )
        {
            let categoriaUltimoNivel = contexto.categoriaUltimoNivel
            let marcaProductos = contexto.marcaProductos
            await sqlController.consultarCategoriasMarcasGeneral(marcaProductos,categoriaUltimoNivel)
            .then(result => {
                console.log(result)
                var tipoResultado = result[0].tipoResultado,
                num = 1
                menuMostradoProductos = {
                    "tipoMenu" : "",
                    'menuMostrado' : []
                };
                console.log(tipoResultado)
                if(tipoResultado=="categorias")
                {
                    var txtCategoriasHijas = '',
                            //nombreCategoria = contexto.categoria,
                            num = 1,
                            menuMostradoProductos = {
                                "tipoMenu" : "categoria",
                                'menuMostrado' : [],
                                "actionNodeAnterior" : strAccion
                            };
                    respuesta.push({
                        response_type: "text",
                        text: `En *${categoriaUltimoNivel}* contamos con las siguientes *Sub Categorías:*`
                    });
                    result.forEach(element =>  {
                        txtCategoriasHijas = `${txtCategoriasHijas}${(txtCategoriasHijas=='') ? '' : '\n'}*${num}) ${element.nombreCategoriaHija}*`
                        menuMostradoProductos.menuMostrado.push({
                            "pocision": num,
                            "nombre" : element.nombreCategoriaHija,
                            "tipoCategoria": element.tipoCategoria
                        });
                        num++;
                        respuesta.push({
                            response_type: "text",
                            text: txtCategoriasHijas
                        });
                    });

                    if(contexto.hasOwnProperty('menuMostradoProductos')){
                        delete contexto.menuMostradoProductos
                    }
                    contexto['menuMostradoProductos'] = menuMostradoProductos;

                }
                else if(tipoResultado=="marcas")
                {
                    menuMostradoProductos.tipoMenu = 'marcaProductos';
                    var txtMarcas = '';
                    if(marcaProductos!=null)
                    {
                        respuesta.push({
                            response_type: "text",
                            text:"No hemos encontrado "+categoriaUltimoNivel+" en la marca "+marcaProductos+"\nDisponemos de las siguientes *marcas*: "
                        });
                    }
                    else
                    {
                        respuesta.push({
                            response_type: "text",
                            text:`Disponemos de las siguientes marcas para *${categoriaUltimoNivel}:* `
                        })
                    }
                    result.forEach(marca => {
                        txtMarcas = `${txtMarcas}${(txtMarcas == '')? '' : '\n'} *${num}) ${marca.nombreMarca}*`//+marca.totalProductos => total de productos dentro de la marca => por si acaso, saber que esta ahi
                        menuMostradoProductos.menuMostrado.push({
                            "pocision": num,
                            "nombre" : marca.nombreMarca,
                            "tipoCategoria": "marcaProductos"
                        });
                        num++;
                    });
                    respuesta.push({
                        response_type: "text",
                        text: txtMarcas
                    });
                    if(contexto.hasOwnProperty('menuMostradoProductos')){
                        delete contexto.menuMostradoProductos
                    }
                    contexto['menuMostradoProductos'] = menuMostradoProductos;

                }
                else if  (tipoResultado == "productos"){
                    var menuMostradoProductos = {
                        "tipoMenu" : "",
                        'menuMostrado' : [],
                        "actionNodeAnterior" : strAccion
                    };

                    if(marcaProductos ==null)
                        respuesta.push({response_type: "text", text:`Disponemos de los siguientes productos en *${categoriaUltimoNivel}*:`})
                    else
                        respuesta.push({response_type: "text", text:`Disponemos de los siguientes productos en *${categoriaUltimoNivel}* *${marcaProductos}*:`})

                    let resultMapped = result.reduce((acc, item) => {
                        (acc[item.idProducto] = acc[item.idProducto] || []).push({'nombre':item.nombreCaracteristicaK, 'value': item.caracteristicaValue});
                            return acc;
                    }, []);

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
                                    menuMostradoProductos.menuMostrado.push({
                                        "pocision": num,
                                        "nombre" : nombreProducto,
                                        "tipoCategoria": "productosEspecificos"
                                    });
                               }
                               else if(elementCaracteristica['nombre']!="idProducto")
                               {
                                    carTexto = `${carTexto} ${(carTexto == '') ? '' : '\n'} *- ${elementCaracteristica['nombre']}:* ${elementCaracteristica['value']}`
                               }
                            })
                            respuesta.push({
                                response_type: "image",
                                title: `*${num}) ${nombreProducto}*\n${carTexto}`,
                                source: urlImagen
                            })
                        num++;
                    })

                    respuesta.push({
                        response_type: "text",
                        text: `Por favor, selecciona el número del producto que te interesa`
                    });
                    if(contexto.hasOwnProperty('menuMostradoProductos')){
                        delete contexto.menuMostradoProductos
                    }
                    contexto['menuMostradoProductos'] = menuMostradoProductos;
                }
            })
        }*/
        console.log(respuesta)
        return respuesta
}

watsonController.RegistrarMensajes = async (idClienteCanalMensajeria, msgUser, outputWatson,intenciones,entidades,contextoConversacion) => {
    
    var textoMsgWatson = '';
    var concatenaIntenciones = '';
    var concatenaEntidades = '';
    var coincidencia;
    var respuesta ="";
    var imagenRespuesta = '';

    (async () => {
        for (const item of outputWatson) {
            if(item.response_type =='text'){
                textoMsgWatson = textoMsgWatson + '\n' +  item.text  
            }else if(item.response_type =='option'){
                respuesta = '-'+item.title
                item.options.forEach(element => {
                    respuesta = respuesta +'+'+ element.label
                });
            }else if(item.response_type =='image' ){
                    imagenRespuesta = '-titulo:'+item.title+' Url:'+item.source
            }
            textoMsgWatson = textoMsgWatson +' '+ respuesta+' '+imagenRespuesta
        }

        for(const itemIntents of intenciones){
            if(itemIntents == ' '){
                concatenaIntenciones = 'Irrelevante'
                coincidencia = 0
            }else{
                concatenaIntenciones = itemIntents.intent
                coincidencia = itemIntents.confidence
            }
            
        }  
        
            if(entidades == ' '){
                concatenaEntidades = 'Sin Entidades'
            }else{
                entidades.forEach(element => {
                    concatenaEntidades = concatenaEntidades+'#'+element.entity + ':'+element.value
                }) 
            }
        
    })();
    
    contextoConversacion = JSON.stringify(contextoConversacion)

    await sqlController.gestionMensajes(idClienteCanalMensajeria,msgUser,textoMsgWatson,concatenaIntenciones,coincidencia,concatenaEntidades,contextoConversacion,'')
}


//comentado por nueva version reporteria
// watsonController.RegistrarMensajes = async (idClienteCanalMensajeria, msgUser, outputWatson) => {

//     var textoMsgWatson = '';

//     (async () => {
//         for (const item of outputWatson) {
//             if(item.response_type =='text' ){
//                 textoMsgWatson = textoMsgWatson + '\n' +  item.text
//             }else if(item.response_type =='option' ){
//                 let respuesta = item.title + '\n'
//                 item.options.forEach(element => {
//                     respuesta = respuesta + element.label + '\n'
//                 });
//             }else if(item.response_type =='image' ){

//             }
//         }
//     })();

//     await sqlController.gestionMensajes(idClienteCanalMensajeria,msgUser,textoMsgWatson)
// }



module.exports = watsonController;


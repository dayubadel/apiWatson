const mssql = require('mssql');
const { sql } = require('../config/config');
var request = new mssql.Request();

var sqlController = {}

//Funciones SQL

sqlController.gestionContexto = async(contexto, idClienteCanalMensajeria, idCanal, idConversacionCanal, opcion) =>{
    //opcion = 1 => registrar contexto
    //opcion = 2 => obtener contexto
    //opcion = 3 => eliminar contexto
    
    var query
    var resultSQL = {}
    if(opcion == 1){
        query = `EXEC [dbo].[sp_GestionContexto]
                    @identificadorCanal = ${idCanal},
                    @idConversacionCanal = N'${idConversacionCanal}',
                    @opcion = ${opcion}`
    }else if(opcion == 2){
        let idConversacionWatson = contexto.conversation_id
        query = `EXEC [dbo].[sp_GestionContexto]
                    @idClienteCanalMensajeria = ${idClienteCanalMensajeria},
                    @identificadorCanal = ${idCanal},
                    @idConversacionCanal = N'${idConversacionCanal}',
                    @idConversacionWatson = N'${idConversacionWatson}',
                    @contexto = N'${JSON.stringify(contexto)}',
                    @opcion = ${opcion}`
    }


    await request.query(query)
    .then(async data => {
        if (data.recordset != undefined && data.recordset.length > 0) {
            resultSQL = {
                idClienteCanalMensajeria : data.recordset[0].idClienteCanalMensajeria,
                idCliente : data.recordset[0].idCliente,
                contexto : data.recordset[0].contexto,
                nombres : data.recordset[0].nombres,
                numeroTelefono: data.recordset[0].numeroTelefono,
                idConversacionWatson : data.recordset[0].idConversacionWatson,
                numeroReferencia : data.recordset[0].numeroReferencia
            }
        } else {
            resultSQL = {}
        }
    })
    .catch(err => {

        console.log("error al gestionar el contexto base")
        console.log(err)
        throw new Error('Error al registrar en BD')
    })


    return resultSQL
}

sqlController.gestionMensajes = async(idClienteCanalMensajeria, msgUser, msgWatson) => {
    let query
    let resultSQL
    
    query = `EXEC [dbo].[sp_GestionMensajes]
                @idClienteCanalMensajeria = ${idClienteCanalMensajeria},
                @textoMensaje = N'${msgUser}',
                @fromChatbot = 0
                
            EXEC [dbo].[sp_GestionMensajes]
                @idClienteCanalMensajeria = ${idClienteCanalMensajeria},
                @textoMensaje = N'${msgWatson}',
                @fromChatbot = 1`

    // console.log(query)
    await request.query(query)
    .then(async data => {
     //   console.log(JSON.stringify(data,null,4))
    
        // }
    })
    .catch(err => {

        console.log("error al registrar mensaje en bd")
        console.log(err)
        throw new Error('Error al registrar en BD')
    })

}


 sqlController.consultarTiendasPorCiudad = async(ciudad) => {
     
    let query
    var resultSQL = []
    var datos = {}
    
    query = `EXEC [dbo].[sp_ConsultarTiendasPorCiudad]
                @ciudad = N'${ciudad}'`

    await request.query(query)
    .then(async data => {
        if (data.recordset != undefined && data.recordset.length > 0) {
           data.recordset.forEach(element => 
            {
               datos = {
                   idTienda: element.idTienda,
                   nombreTienda: element.nombreTienda,
                   direccionEspecifica: element.direccionEspecifica,
                   telefonos: element.telefonos,
                   horaApertura: element.horaApertura,
                   horaCierre: element.horaCierre,
                   atiendeSabado: element.atiendeSabado,
                   atiendeDomingo: element.atiendeDomingo,
                   horaAperturaSabado: element.horaAperturaSabado,
                   horaCierreSabado: element.horaCierreSabado,
                   horaAperturaDomingo: element.horaAperturaDomingo,
                   horaCierreDomingo: element.horaCierreDomingo
               }
               resultSQL.push(datos)
            })
          
        }
    })
    .catch(err => {
        console.log("Ha ocurrido un error al consultar las tiendas por ciudad")
        console.log(err)
        throw new Error('Error al registrar en BD')
    })
    return resultSQL
}


sqlController.consultarSectoresAgrupadosPorCiudad = async(ciudad) => {
   let query
   var resultSQL = []
   var datos = {}
   
   query = `EXEC [dbo].[sp_ConsultarSectoresAgrupadosPorCiudad]
               @ciudad = N'${ciudad}'`

   await request.query(query)
   .then(async data => {
       if (data.recordset != undefined && data.recordset.length > 0) {
          data.recordset.forEach(element => 
           {
              datos = {
                  sector: element.sector
              }
              resultSQL.push(datos)
           })
         
       }
   })
   .catch(err => {
       console.log("Ha ocurrido un error al consultar los sectores agrupados por ciudad")
       console.log(err)
       throw new Error('Error al registrar en BD')
   })
   return resultSQL
}

sqlController.consultarTiendasPorCiudadPorSector = async(ciudad, sector) => {

   let query
   var resultSQL = []
   var datos = {}
   
   query = `EXEC [dbo].[sp_ConsultarTiendaPorCiudadPorSector]
               @ciudad = N'${ciudad}',
               @sector = N'${sector}'`
               
   await request.query(query)
   .then(async data => {
       if (data.recordset != undefined && data.recordset.length > 0) {
          data.recordset.forEach(element => 
           {
              datos = {
                  idTienda: element.idTienda,
                  nombreTienda: element.nombreTienda,
                  direccionEspecifica: element.direccionEspecifica,
                  telefonos: element.telefonos,
                  horaApertura: element.horaApertura,
                  horaCierre: element.horaCierre,
                  atiendeSabado: element.atiendeSabado,
                  atiendeDomingo: element.atiendeDomingo,
                  horaAperturaSabado: element.horaAperturaSabado,
                  horaCierreSabado: element.horaCierreSabado,
                  horaAperturaDomingo: element.horaAperturaDomingo,
                  horaCierreDomingo: element.horaCierreDomingo
              }
              resultSQL.push(datos)
           })
         
       }
   })
   .catch(err => {
       console.log("Ha ocurrido un error al consultar las tiendas por ciudad y por sector")
       console.log(err)
       throw new Error('Error al registrar en BD')
   })
   return resultSQL
}


sqlController.actualizarCliente = async(idCliente, nombres, cedula, numeroTelefono,
                                            direccion, correo, clienteVerificado) => {

    let query
    var resultSQL = []
    var datos = {}
    
    query = `EXEC [dbo].[sp_ActualizarCliente]
                @idCliente = ${idCliente},
                @nombres = N'${nombres}',
                @cedula = N'${cedula}',
                @numeroTelefono = N'${numeroTelefono}',
                @direccion = N'${direccion}',
                @correo = N'${correo}',
                @clienteVerificado = ${clienteVerificado}`
                
    await request.query(query)
    .then(async data => {
        if (data.recordset != undefined && data.recordset.length > 0) {
            data.recordset.forEach(element => 
                {
                   datos = {
                       idCliente: element.idCliente,
                       nombres: element.nombres,
                       cedula: element.cedula,
                       numeroTelefono: element.numeroTelefono,
                       direccion: element.direccion,
                       correo: element.correo,
                       fechaRegistro: element.fechaRegistro,
                       fechaUltimaModificacion: element.fechaUltimaModificacion,
                       clienteVerificado: element.clienteVerificado,
                   }
                   resultSQL.push(datos)
                })
        }
    })
    .catch(err => {
        console.log("Ha ocurrido un error al actualizar el cliente")
        console.log(err)
        throw new Error('Error al registrar en BD')
    })
    return resultSQL
 }

 sqlController.consultarClientePorId = async(idCliente) => {

    let query
    var resultSQL = []
    var datos = {}
    
    query = `EXEC [dbo].[sp_ConsultarClientePorId]
                @idCliente = ${idCliente}`
                
    await request.query(query)
    .then(async data => {
        if (data.recordset != undefined && data.recordset.length > 0) {
           data.recordset.forEach(element => 
            {
               datos = {
                   idCliente: element.idCliente,
                   nombres: element.nombres,
                   cedula: element.cedula,
                   numeroTelefono: element.numeroTelefono,
                   direccion: element.direccion,
                   correo: element.correo,
                   fechaRegistro: element.fechaRegistro,
                   fechaUltimaModificacion: element.fechaUltimaModificacion,
                   clienteVerificado: element.clienteVerificado,
               }
               resultSQL.push(datos)
            })
          
        }
    })
    .catch(err => {
        console.log("Error al consultar cliente por id")
        console.log(err)
        throw new Error('Error al registrar en BD')
    })
    return resultSQL
 }

 sqlController.insertarValoracion = async(idClienteCanalMensajeria, valor, intencionComentario, comentarioCliente) => {

    let query
    var resultSQL = []
    var datos = {}
    
    query = `EXEC [dbo].[sp_InsertarValoracion]
                @idClienteCanalMensajeria = ${idClienteCanalMensajeria},
                @valor = ${valor},
                @intencionComentario = ${intencionComentario},
                @comentarioCliente = N'${comentarioCliente}'`
                
    await request.query(query)
    .then(async data => {
        if (data.recordset != undefined && data.recordset.length > 0) {
           data.recordset.forEach(element => 
            {
               datos = {
                   idValoracion: element.idValoracion
               }
               resultSQL.push(datos)
            })
          
        }
    })
    .catch(err => {
        console.log("Ha ocurrido un error al ingresar la valoracion")
        console.log(err)
        throw new Error('Error al registrar en BD')
    })
    return resultSQL
 }

 sqlController.consultarCategoriasPorCategoria = async(nombreCategoria) => {
    let query
    var resultSQL = []
    var datos = {}
    
    query = `EXEC [dbo].[sp_ConsultarCategoriasPorCategoria]
    @nombreCategoria = N'${nombreCategoria}'`
                
    await request.query(query)
    .then(async data => {
        if (data.recordset != undefined && data.recordset.length > 0) {
           data.recordset.forEach(element => 
            {
               datos = {
                nombreCategoriaHija : element.nombreCategoriaHija,
                tipoCategoria : element.tipoCategoria
               }
               resultSQL.push(datos)
            })
          
        }
    })
    .catch(err => {
        console.log("Error al consultar categorias hijos por nombre categoria")
        console.log(err)
        throw new Error('Error al registrar en BD')
    })
    return resultSQL
 }


 sqlController.consultarCategoriasNivelMasBajo = async () => {
    let query
    var resultSQL = []
    var datos = {}
    
    query = `EXEC [dbo].[sp_ConsultarCategoriasNivelMasBajo]`

    await request.query(query)
    .then(async data => {
        if (data.recordset != undefined && data.recordset.length > 0) {
           data.recordset.forEach(element => 
            {
                datos = {
                    nombreCategoria : element.nombreCategoria 
                }
                resultSQL.push(datos)
            })
        }
    })
    .catch(err => {
        console.log("Error al ejecutar [dbo][sp_ConsultarCategoriasNivelMasBajo]")
        console.log(err)
        throw new Error('Error al registrar en BD')

    })
    return resultSQL
 }


 sqlController.consultarMarcasPorCategoriaUltimoNivel = async(nombreCategoriaUltimoNivel) => {
    let query
    var resultSQL = []
    var datos = {}
    query = `EXEC [dbo].[sp_ConsultarMarcasPorCategoriaUltimoNivel]
    @categoriaUltimoNivel = N'${nombreCategoriaUltimoNivel}'`
    await request.query(query)
    .then(async data => {
        if (data.recordset != undefined && data.recordset.length > 0) {
           data.recordset.forEach(element => 
            {
               datos = {
                idMarca : element.idMarcaBot,
                nombreMarca : element.nombreMarca,
                totalProductos: element.totalProductos,
                tipoResultado: element.tipoResultado,
                idProducto : element.idProductoBot,
                nombreCaracteristicaK : element.nombreCaracteristicaKey,
                caracteristicaValue : element.caracteristicaValue
               }
               resultSQL.push(datos)
            })
          
        }
    })
    .catch(err => {
        console.log("Error al consultar marcas por categoria ultimo nivel")
        console.log(err)
        throw new Error('Error al registrar en BD')
    })
    return resultSQL
 }

 sqlController.consultarProductosPorMarcaPorCategoriaUltimoNivel = async (categoriaUltimoNivel, marcaProducto) => {
    let query
    var resultSQL = []
    var datos = {}
    query = `EXEC [dbo].[sp_ConsultarProductosPorMarcaPorCategoriaUltimoNivel]
    @categoriaUltimoNivel = N'${categoriaUltimoNivel}',
    @marca = N'${marcaProducto}'`
    await request.query(query)
    .then(async data =>{
        if (data.recordset != undefined && data.recordset.length > 0) {
            data.recordset.forEach(element => 
             {
                datos = {
                 idProducto : element.idProductoBot,
                 nombreCaracteristicaK : element.nombreCaracteristicaKey,
                 caracteristicaValue : element.caracteristicaValue,
                 idMarcaBot: element.idMarcaBot,
                 nombreMarca: element.nombreMarca,
                 tipoResultado: element.tipoResultado,
                 totalProductos: element.totalProductos
                }
                resultSQL.push(datos)
             }) 
         }
     })
     .catch(err => {
        console.log("Error al consultar los productos por marca y por categoria ultimo nivel")
        console.log(err)
        throw new Error('Error al registrar en BD')
    })
    return resultSQL
 }

 sqlController.consultarInfoProducto = async (nombreProducto) => {
    let query
    var resultSQL = {}
    query = `[dbo].[sp_consultarInfoProducto]
                @nombreProducto = N'${nombreProducto}'`
    await request.query(query)
    .then(async data =>{
        if (data.recordset != undefined && data.recordset.length > 0) {
            resultSQL = {
                idProductoBot : data.recordset[0].idProductoBot,
                nombre : data.recordset[0].nombre,
                modelo : data.recordset[0].modelo,
                idVtex : data.recordset[0].idVtex,
                stockCC : data.recordset[0].stockCC,
                stockOtroPago : data.recordset[0].stockOtroPago,
                precioCC : data.recordset[0].precioCC,
                precioOtroPago : data.recordset[0].precioOtroPago,
                cuotasPrecioCC : data.recordset[0].cuotasPrecioCC,
                plazoGarantia : data.recordset[0].plazoGarantia,
                arrayImagenes : JSON.parse(data.recordset[0].arrayImagenes),
                arrayCarac : '',
                isMarketplace : data.recordset[0].isMarketplace
            }

            data.recordset.forEach(element => 
             {
                resultSQL.arrayCarac =  `${resultSQL.arrayCarac}  \n *-${element.nombreCara}:* ${element.caracteristicaValue.replace(/\\/g,' \\')}`
                // let caracteristicas = {
                // caracKey : element.nombreCara,
                // caracVal : element.caracteristicaValue,
                // }
                // resultSQL.arrayCarac.push(caracteristicas)
             }) 
         }
     })
     .catch(err => {
        console.log("Error al consultar los productos por marca y por categoria ultimo nivel")
        console.log(err)
        throw new Error('Error al registrar en BD')
    })
    return resultSQL
 }

 sqlController.ConsultarProductoAlterno = async (metodoPago, productoSelected) => {
    let query
    var resultSQL = []
    var datos = {}
    query = `EXEC [dbo].[sp_ConsultarProductoAlterno]
                @metodoPago = N'${metodoPago}',
                @nombreProducto = N'${productoSelected}'`
    await request.query(query)
    .then(async data =>{
        if (data.recordset != undefined && data.recordset.length > 0) {
            data.recordset.forEach(element => 
                {
                datos = {
                    idProducto : element.idProductoBot,
                    nombreCaracteristicaK : element.nombreCaracteristicaKey,
                    caracteristicaValue : element.caracteristicaValue,
                    idMarcaBot: element.idMarcaBot,
                    nombreMarca: element.nombreMarca,
                    tipoResultado: element.tipoResultado,
                    totalProductos: element.totalProductos
                }
                resultSQL.push(datos)
                }) 
            }
        })
        .catch(err => {
        console.log("Error al consultar los productos por marca y por categoria ultimo nivel")
        console.log(err)
        throw new Error('Error al registrar en BD')
    })
    return resultSQL
 }

 sqlController.gestionCarritoCompras = async (idClienteCanalMensajeria, idDetalleVenta, idProductoBot, metodoPago, cantidad, opcion) =>
 {
     let query
     let datos = {}
     let resultSQL = []
     if(opcion==1) //insertar producto al carrito
     {
         query = `[dbo].[sp_GestionCarritoDeCompras]
                 @idClienteCanalMensajeria=${idClienteCanalMensajeria},
                 @idProductoBot=${idProductoBot},
                 @metodoPago=N'${metodoPago}',
                 @cantidad=${cantidad},
                 @opcion=${opcion}`
     }
     else if(opcion==2) //consultar carrito
     {
         query = `[dbo].[sp_GestionCarritoDeCompras]
                 @idClienteCanalMensajeria=${idClienteCanalMensajeria},
                 @opcion=${opcion}`
     }
     else if(opcion==3) //eliminar producto de carrito
     {
         query = `[dbo].[sp_GestionCarritoDeCompras]
                 @idClienteCanalMensajeria=${idClienteCanalMensajeria},
                 @idDetalleVenta=${idDetalleVenta},
                 @opcion=${opcion}`
     }
 
     await request.query(query)
     .then(async data => {
         if (data.recordset != undefined && data.recordset.length > 0) {
                data.recordset.forEach(element =>
                     {
                         datos = {
                             idProductoBot : element.idProductoBot,
                             nombreProducto : element.nombreProducto,
                             cantidad : element.cantidad,
                             precioProducto : element.precioProducto,
                             metodoPago : element.metodoPago,
                             identificadorMetodoPago: element.identificadorMetodoPago,
                             idDetalleVenta : element.idDetalleVenta,
                             numeroReferencia : element.numeroReferencia
                         }
                         resultSQL.push(datos)
                     })             
            }
     })
     .catch(err => {
         console.log("Error al gestionar el carrito de compras")
         console.log(err)
         throw new Error('Error al registrar en BD')
     })
     return resultSQL
 }
 
//  sqlController.consultarCategoriasMarcasGeneral = async (marca, nombreCategoria) =>
//  {
//     let resultSQL = []
//     let datos = {}
//     let query

//     query = `[dbo].[sp_ConsultaCategoriasMarcasGeneral] 
//             @marca = N'${marca}', @nombreCategoria = N'${nombreCategoria}'`

//     await request.query(query)
//     .then(async data =>{
//         if (data.recordset != undefined && data.recordset.length > 0) {
//             data.recordset.forEach(element => 
//              {
//                 datos = {
//                  idProducto : element.idProductoBot,
//                  nombreCaracteristicaK : element.nombreCaracteristicaKey,
//                  caracteristicaValue : element.caracteristicaValue,
//                  tipoResultado: element.tipoResultado,
//                  tipoCategoria : element.tipoCategoria,
//                  idMarcaBot: element.idMarcaBot,
//                  nombreMarca: element.nombreMarca,
//                  totalProductos: element.totalProductos,
//                  idCategoriaHija: element.idCategoriaHija,
//                  nombreCategoriaHija: element.nombreCategoriaHija
//                 }
//                 resultSQL.push(datos)
//              }) 
//          }
//      })     
//      .catch(err => {
//         console.log("Error al consultar categorias marcas generales")
//         console.log(err)
//         throw new Error('Error al registrar en BD')
//     })
//     return resultSQL
//  }

sqlController.gestionCabeceraVenta = async (idClienteCanalMensajeria, numeroReferencia, nombresCabecera, apellidosCabecera, tipoIdentificacion, numIdentificacion, numeroTelefono, opcion) =>
{
    
    let resultSQL = []
    let datos = {}
    let query

    if(opcion==1)
    {
        query =`[dbo].[sp_GestionCabeceraVenta]
            @numeroReferencia = N'${numeroReferencia}',
            @nombresCabecera = N'${nombresCabecera}',
            @apellidosCabecera = N'${apellidosCabecera}',
            @tipoIdentificacion = N'${tipoIdentificacion}',
            @numIdentificacion = N'${numIdentificacion}',
            @numeroTelefono = N'${numeroTelefono}',
            @opcion = ${opcion}`
    }
    
    await request.query(query)
    .then( async data => {
         if (data.recordset != undefined && data.recordset.length > 0) {
                data.recordset.forEach(element => 
                {
                    datos = 
                    {
                             numeroReferencia : element.numeroReferencia
                    }
                    resultSQL.push(datos)
                }
                )
        }
    })
    .catch(err => {
            console.log("Error al gestionar cabecera venta")
            console.log(err)
            throw new Error('Error al registrar en BD')
    })
}
module.exports = sqlController

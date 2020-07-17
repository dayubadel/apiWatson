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
                contexto : data.recordset[0]. contexto
            }

        } else {
            resultSQL = {}
        }
    })
    .catch(err => {

        console.log("error al gestionar el contexto base")
        console.log(err)
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
    })
    return resultSQL
}


sqlController.consultarSectoresAgrupadosPorCiudad = async(ciudad) => {
    console.log(ciudad)
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
       console.log("Ha ocurrido un error al consultar las tiendas por ciudad")
       console.log(err)
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
       console.log("Ha ocurrido un error al consultar las tiendas por ciudad")
       console.log(err)
   })
   return resultSQL
}


module.exports = sqlController

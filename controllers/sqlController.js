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
        console.log(JSON.stringify(data,null,4))
    
        // }
    })
    .catch(err => {

        console.log("error al registrar mensaje en bd")
        console.log(err)
    })

}


module.exports = sqlController

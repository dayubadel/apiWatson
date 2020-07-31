class Caracteristica{
    constructor(nombre,descripcion){
        this.nombre = nombre;
        this.descripcion =  descripcion;
    }
}

module.exports = Caracteristica;


// await (async () => {
//     for (const key of entidadesArray) {
//         let objParams = await sqlProductoController.ObtenerEntidades(key)
//         .then(results => {
//             let params = { 
//                 workspaceId: id_workspace,
//                 entity: key,
//                 newValues: []
//             }
//             results.forEach(result => {
//                 params.newValues.push({
//                     'value': result.valorEntidad.toString().split('|')[0].slice(0,63).trim(),
//                     'type' : 'synonyms',
//                     'synonyms' : [result.valorEntidad.toString().split('|')[0].slice(0,63).trim()]
//                 })
//             })
//             return params
//         })
//         await assistant.updateEntity(objParams)

//         console.log(objParams)

//     }
//     console.log('1')
//     res.send("ok")
// })();


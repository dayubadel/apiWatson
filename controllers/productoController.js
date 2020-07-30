const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const config = require("../config/config.js");

const sqlProductoController = require('./sqlProductoController')
const Producto = require("../models/productoModel");
const Marca = require("../models/marcaModel");
const Caracteristica = require("../models/caracteristicaModel")
const Categoria = require("../models/categoriaModel")


const id_workspace = config.Watson.id_workspace
const apikey = config.Watson.apikey
const url = config.Watson.url
const version = config.Watson.version

const assistant = new AssistantV1({
    version: version,
    authenticator: new IamAuthenticator({
      apikey: apikey,
    }),
    url: url,
  });

var productoController = {}

productoController.RegistrarProductos = async (req, res) => {
    try {
        var prodcutosReq =  [],
            arrayProductos = [];

        prodcutosReq = req.body;


        prodcutosReq.forEach(producto => {
            let objProducto = new Producto({}),
                objMarca = new Marca({}),
                caracteristicas = {},
                arrayCategorias = [],
                imgArr;

            objMarca.idMarca = producto.BrandId;
            objMarca.marca = producto.BrandName;

            imgArr = JSON.parse(producto.imagen);
            
            if(producto.hasOwnProperty("especificacion") && producto.especificacion != ''){
                caracteristicas = JSON.parse(producto.especificacion)
                for (const key in caracteristicas) {
                    caracteristicas[key] = caracteristicas[key].replace(/[,:]+/g,'')
                }
            }
            
            if(producto.ProductCategories != ''){
                var i = 0,
                    objCate = JSON.parse(producto.ProductCategories)
                for (const key in objCate) {
                    let nivel = (producto.hasOwnProperty(`Nivel${i}`) && producto[`Nivel${i}`] == objCate[key]) ? i : null;
                    //por ahora, el nivel va a definir i por problemas con las tildes
                    arrayCategorias.push(new Categoria(key, objCate[key],i))

                    i += 1
                }
            }

            objProducto.idVitex = producto.Id
            objProducto.nombre = producto.ProductName
            objProducto.idRefSAP = producto.RefId
            objProducto.stockOtroPago = producto.stock
            objProducto.stockCC = producto.stockcc

            objProducto.precioOtroPago = producto.Price_bot
            objProducto.precioCC = producto.PriceC_bot
            objProducto.cuotasPrecioCC = producto.Cuotas_PriceC_bot
            objProducto.plazoGarantia = producto.plz_garantiaext

            objProducto.imagenes = imgArr
            objProducto.caracteristicas = caracteristicas
            objProducto.marca = objMarca
            objProducto.categorias = arrayCategorias
            objProducto.isMarketPlace = producto.Marketplace
            objProducto.url = producto.url
            arrayProductos.push(objProducto)
            // console.log(objProducto)


        });

        await sqlProductoController.gestionProductos(arrayProductos)

        //aqui crea otro hilo para que haga actualizacion en watson

        // productoController.ActualizarEntidades()

        // res.send(arrayProductos)
        res.send({success:1})
    } catch (error) {
        console.log(error)
        res.status(500).send({success:0})
            
    }

}


productoController.ActualizarEntidades = (req, res) =>{
    var paramsProducto = {
        workspaceId: id_workspace,
        entity: 'nonbreProductos',
        newValues: []
    }
    var paramsMarca = { 
        workspaceId: id_workspace,
        entity: 'marcaProductos',
        newValues: []
    }
    var paramsCaracK = {
        workspaceId: id_workspace,
        entity: 'caracteristicaKProducto',
        newValues: []
    }
    var paramsCaracV = { 
        workspaceId: id_workspace,
        entity: 'caracteristicaVProducto',
        newValues: []
    }
    var paramsCateg0 = { 
        workspaceId: id_workspace,
        entity: 'categoriaNivel0',
        newValues: []
    }
    var paramsCateg1 = { 
        workspaceId: id_workspace,
        entity: 'categoriaNivel1',
        newValues: []
    }
    var paramsCateg2 = { 
        workspaceId: id_workspace,
        entity: 'categoriaNivel2',
        newValues: []
    }
    var paramsCateg3 = { 
        workspaceId: id_workspace,
        entity: 'categoriaNivel3',
        newValues: []
    }
    var paramsCateg4 = { 
        workspaceId: id_workspace,
        entity: 'categoriaNivel4',
        newValues: []
    }
    var paramsCategUltimoNivel = { 
        workspaceId: id_workspace,
        entity: 'categoriaUltimoNivel',
        newValues: []
    }
    var paramsCiudad = { 
        workspaceId: id_workspace,
        entity: 'Ciudad',
        newValues: []
    }
    var paramsCiudadTienda = { 
        workspaceId: id_workspace,
        entity: 'CiudadTienda',
        newValues: [
            {
                value: 'BABAHOYO',
                type : 'synonyms',
                synonyms : ['BABAHOYO']
            },
            {
                value: 'LA TRONCAL',
                type : 'synonyms',
                synonyms : ['LA TRONCAL']
            },
            {
                value: 'MILAGRO',
                type : 'synonyms',
                synonyms : ['MILAGRO']
            },
            {
                value: 'MACHALA',
                type : 'synonyms',
                synonyms : ['MACHALA']
            },
            {
                value: 'LA JOYA',
                type : 'synonyms',
                synonyms : ['LA JOYA']
            },
            {
                value: 'GUAYAQUIL',
                type : 'synonyms',
                synonyms : ['GUAYAQUIL']
            },
            {
                value: 'DAULE',
                type : 'synonyms',
                synonyms : ['DAULE']
            },
            {
                value: 'DURÁN',
                type : 'synonyms',
                synonyms : ['DURÁN']
            },
            {
                value: 'EL CARMEN',
                type : 'synonyms',
                synonyms : ['EL CARMEN']
            },
            {
                value: 'QUEVEDO',
                type : 'synonyms',
                synonyms : ['QUEVEDO']
            },
            {
                value: 'SANTO DOMINGO',
                type : 'synonyms',
                synonyms : ['SANTO DOMINGO','STO DOMINGO']
            },
            {
                value: 'PLAYAS',
                type : 'synonyms',
                synonyms : ['PLAYAS']
            },
            {
                value: 'LA LIBERTAD',
                type : 'synonyms',
                synonyms : ['LA LIBERTAD']
            },
            {
                value: 'MANTA',
                type : 'synonyms',
                synonyms : ['MANTA']
            },
            {
                value: 'PORTOVIEJO',
                type : 'synonyms',
                synonyms : ['PORTOVIEJO']
            },
            {
                value: 'SAN VICENTE',
                type : 'synonyms',
                synonyms : ['SAN VICENTE']
            },
            {
                value: 'CAYAMBE',
                type : 'synonyms',
                synonyms : ['CAYAMBE']
            },
            {
                value: 'IBARRA',
                type : 'synonyms',
                synonyms : ['IBARRA']
            },
            {
                value: 'OTAVALO',
                type : 'synonyms',
                synonyms : ['OTAVALO']
            },
            {
                value: 'RIOBAMBA',
                type : 'synonyms',
                synonyms : ['RIOBAMBA']
            },
            {
                value: 'AMBATO',
                type : 'synonyms',
                synonyms : ['AMBATO']
            },
            {
                value: 'QUITO',
                type : 'synonyms',
                synonyms : ['QUITO']
            },
            {
                value: 'LA CONCORDIA',
                type : 'synonyms',
                synonyms : ['LA CONCORDIA']
            },
            {
                value: 'NARANJAL',
                type : 'synonyms',
                synonyms : ['NARANJAL']
            },
            {
                value: 'CUENCA',
                type : 'synonyms',
                synonyms : ['CUENCA']
            }
        ]
    }
    // var paramsCiudad = { 
    //     workspaceId: id_workspace,
    //     entity: 'Ciudad',
    //     newValues: [
    //         {
    //         'value': 'BABAHOYO',
    //         'type' : 'synonyms',
    //         'synonyms' : ['BABAHOYO']
    //         }
    //     ]
    // }
    sqlProductoController.ObtenerEntidades()
    .then(arrayEntidades => {
        arrayEntidades.forEach(entidad => {
            // console.log(entidad.tipoEntidad)
            if(entidad.tipoEntidad == 'producto'){
                paramsProducto.newValues.push({
                    'value': entidad.valorEntidad.toString().split('|')[0].slice(0,63).trim(),
                    'type' : 'synonyms',
                    'synonyms' : [entidad.valorEntidad.toString().split('|')[0].slice(0,63).trim()]
                })
            }else if(entidad.tipoEntidad == 'marca'){
                paramsMarca.newValues.push({
                    'value': entidad.valorEntidad.toString().slice(0,63).trim(),
                    'type' : 'synonyms',
                    'synonyms' : [entidad.valorEntidad.toString().slice(0,63).trim()]
                })
            }else if(entidad.tipoEntidad == 'caracteristicaK'){
                paramsCaracK.newValues.push({
                    'value': entidad.valorEntidad.toString().slice(0,63).trim(),
                    'type' : 'synonyms',
                    'synonyms' : [entidad.valorEntidad.toString().slice(0,63).trim()]
                })
            }else if(entidad.tipoEntidad == 'caracteristicaV'){
                paramsCaracV.newValues.push({
                    'value': entidad.valorEntidad.toString().slice(0,63).trim(),
                    'type' : 'synonyms',
                    'synonyms' : [entidad.valorEntidad.toString().slice(0,63).trim()]
                })
            }else if(entidad.tipoEntidad == 'categoriaNivel0'){
                paramsCateg0.newValues.push({
                    'value': entidad.valorEntidad.toString().slice(0,63).trim(),
                    'type' : 'synonyms',
                    'synonyms' : [entidad.valorEntidad.toString().slice(0,63).trim()]
                })
            }
            else if(entidad.tipoEntidad == 'categoriaNivel1'){
                paramsCateg1.newValues.push({
                    'value': entidad.valorEntidad.toString().slice(0,63).trim(),
                    'type' : 'synonyms',
                    'synonyms' : [entidad.valorEntidad.toString().slice(0,63).trim()]
                })
            }
            else if(entidad.tipoEntidad == 'categoriaNivel2'){
                paramsCateg2.newValues.push({
                    'value': entidad.valorEntidad.toString().slice(0,63).trim(),
                    'type' : 'synonyms',
                    'synonyms' : [entidad.valorEntidad.toString().slice(0,63).trim()]
                })
            }
            else if(entidad.tipoEntidad == 'categoriaNivel3'){
                paramsCateg3.newValues.push({
                    'value': entidad.valorEntidad.toString().slice(0,63).trim(),
                    'type' : 'synonyms',
                    'synonyms' : [entidad.valorEntidad.toString().slice(0,63).trim()]
                })
            }
            else if(entidad.tipoEntidad == 'categoriaNivel4'){
                paramsCateg4.newValues.push({
                    'value': entidad.valorEntidad.toString().slice(0,63).trim(),
                    'type' : 'synonyms',
                    'synonyms' : [entidad.valorEntidad.toString().slice(0,63).trim()]
                })
            }
            else if(entidad.tipoEntidad == 'categoriaUltimoNivel'){
                paramsCategUltimoNivel.newValues.push({
                    'value': entidad.valorEntidad.toString().slice(0,63).trim(),
                    'type' : 'synonyms',
                    'synonyms' : [entidad.valorEntidad.toString().slice(0,63).trim()]
                })
            }
            else if(entidad.tipoEntidad == 'ciudad'){
                paramsCiudad.newValues.push({
                    'value': entidad.valorEntidad.toString().slice(0,63).trim(),
                    'type' : 'synonyms',
                    'synonyms' : [entidad.valorEntidad.toString().slice(0,63).trim()]
                })
            }
        });
        res.send(paramsProducto)
        return

        return assistant.updateEntity(paramsProducto)
    })
    .then((hola) => {
        console.log(hola)
        return assistant.updateEntity(paramsMarca)
    })
    .then(() => {
        return assistant.updateEntity(paramsCaracK)
    })
    .then(() => {
        return assistant.updateEntity(paramsCaracV)
    })
    .then(() => {
        return assistant.updateEntity(paramsCateg0)
    })
    .then(() => {
        return assistant.updateEntity(paramsCateg1)
    })
    .then(() => {
        return assistant.updateEntity(paramsCateg2)
    })
    .then(() => {
        return assistant.updateEntity(paramsCateg3)
    })
    .then(() => {
        return assistant.updateEntity(paramsCateg4)
    })
    .then(() => {
        console.log(JSON(paramsCategUltimoNivel,null,4))
        return assistant.updateEntity(paramsCategUltimoNivel)
    })
    .then(() => {
        return assistant.updateEntity(paramsCiudad)
    })
    .then(() => {
        return assistant.updateEntity(paramsCiudadTienda)
    })
    .catch(err => {
        console.log('Error al actualizar entidades')
        console.log(JSON.stringify(err,null,4))
    })

}


module.exports = productoController;
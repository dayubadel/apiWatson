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


productoController.ActualizarEntidades = async (req, res) =>{ 
    try {
                    
        entidadesArray = [
            'nombreProductos',
            'marcaProductos',
            // 'caracteristicaKProducto',
            // 'caracteristicaVProducto',
            'categoriaNivel0',
            'categoriaNivel1',
            'categoriaNivel2',
            'categoriaNivel3',
            'categoriaNivel4',
            'categoriaUltimoNivel',
            'Ciudad'
        ];

        await (async () => {
            for (const key of entidadesArray) {
                console.log(key)
                let objParams = await sqlProductoController.ObtenerEntidades(key)
                .then(results => {
                    let params = { 
                        workspaceId: id_workspace,
                        entity: key,
                        newValues: []
                    }
                    results.forEach(result => {
                        params.newValues.push({
                            'value': result.valorEntidad.toString().split('|')[0].slice(0,63).trim(),
                            'type' : 'synonyms',
                            'synonyms' : [result.valorEntidad.toString().split('|')[0].slice(0,63).trim()]
                        })
                    })
                    return params
                })
                await assistant.updateEntity(objParams)

                // console.log(objParams)

            }
            res.send("ok")
        })();

    } catch (error) {
        console.log(error)
        res.status(500).send("no")
    
    }
}


module.exports = productoController;
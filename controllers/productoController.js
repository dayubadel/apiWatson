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
                modelo = '',
                objMarca = new Marca({}),
                caracteristicas = {},
                arrayCategorias = [],
                imgArr;

            objMarca.idMarca = producto.BrandId;
            objMarca.marca = producto.BrandName;

            imgArr = JSON.parse(producto.imagen);
            
            if(producto.hasOwnProperty("especificacion") && producto.especificacion != ''){
                caracteristicas = JSON.parse(producto.especificacion)
                if(caracteristicas.hasOwnProperty("Resumen")){
                    delete caracteristicas.Resumen
                }
                if(caracteristicas.hasOwnProperty('Specs')){
                    delete caracteristicas.Specs
                }
                if(caracteristicas.hasOwnProperty('Specss')){
                    delete caracteristicas.Specss
                }
                if(caracteristicas.hasOwnProperty('VIDEOS')){
                    delete caracteristicas.VIDEOS
                }
                if(caracteristicas.hasOwnProperty('Modelo')){
                    modelo = caracteristicas.Modelo
                    delete caracteristicas.modelo
                }
                for (const key in caracteristicas) {
                    caracteristicas[key] = caracteristicas[key].replace(/[,:]+/g,'').replace(/[']+/g,"")
                }
            }
            
            if(producto.ProductCategories != ''){
                var i = 0,
                    objCate = [];
                    arrayCateStr = producto.ProductCategories.replace(/[{}]/g,'').replace(/[']+/g,"").split(',');

                for (let index = arrayCateStr.length; index > 0; index--) {

                    var varKey = arrayCateStr[index - 1].split(':')[0];
                    var varValue = arrayCateStr[index - 1].split(':')[1];
                    if(varValue == 'Motos' && index != 0){
                        varValue = 'Motocicletas'
                    }
                    objCate.push(JSON.parse(`{${varKey} : ${varValue}}`))
                }

                
                var nivel = 0
                for (const iterator of objCate) {
                    arrayCategorias.push(new Categoria(Object.keys(iterator)[0], Object.values(iterator)[0],nivel))
                    nivel++
                }
            }

            objProducto.idVitex = producto.Id
            objProducto.modelo = modelo.replace(/[']+/g,"")
            objProducto.nombre = producto.ProductName
            objProducto.idRefSAP = producto.RefId
            objProducto.stockOtroPago = producto.stock
            objProducto.stockCC = producto.stockcc

            objProducto.precioConIntereses = producto.Price_bot_con_int
            objProducto.precioSinIntereses = producto.Price_bot_sin_int
            objProducto.precioCC = producto.PriceC_bot
            objProducto.cuotasPrecioCC = producto.Cuotas_PriceC_bot
            objProducto.plazoGarantia = producto.plz_garantiaext

            objProducto.imagenes = imgArr
            objProducto.caracteristicas = caracteristicas
            objProducto.marca = objMarca
            objProducto.categorias = arrayCategorias
            objProducto.isMarketPlace = producto.Marketplace
            objProducto.url = producto.url
            objProducto.isActive = producto.IsActive
            objProducto.iva = producto.IVA
            arrayProductos.push(objProducto)
            //console.log(objProducto)


        });

        await sqlProductoController.gestionProductos(arrayProductos)

        //aqui crea otro hilo para que haga actualizacion en watson

        // productoController.ActualizarEntidades()

        // res.send(arrayProductos)
        res.send({success:1})
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:0,
            msg: error.message
        })
            
    }

}


productoController.ActualizarEntidades = async (req, res) =>{ 
    try {
        
        
       entidadesArray = [
            'nombreProductos',
            'marcaProductos',
            'caracteristicaKProducto',
            'caracteristicaVProducto',
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
                console.log("entidad",key)
                let objParams = await sqlProductoController.ObtenerEntidades(key)
                .then(results => {
                    let params = { 
                        workspaceId: id_workspace,
                        entity: key,
                        newValues: []
                    }
                    results.forEach(result => {
                        let arrSino = (result.hasOwnProperty('sinonimos')) ? result.sinonimos : [result.valorEntidad.toString().split('|')[0].slice(0,63).trim()];
                        params.newValues.push({
                            'value': result.valorEntidad.toString().split('|')[0].slice(0,63).trim(),
                            'type' : 'synonyms',
                            'synonyms' : arrSino//[result.valorEntidad.toString().split('|')[0].slice(0,63).trim()]
                        })
                    })
                    return params
                })
            
               // console.log(JSON.stringify(objParams,null,4))
                await assistant.updateEntity(objParams)


            }
            if(req != undefined){
                res.send({success:1})
            }
        })();

    } catch (error) {
        console.log(error)
        if(req != undefined){
            res.status(500).send({
                success:0,
                msg: error.message
            })
        }
    }
}


module.exports = productoController;
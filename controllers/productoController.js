const sqlProductoController = require('./sqlProductoController')
const Producto = require("../models/productoModel");
const Marca = require("../models/marcaModel");
const Caracteristica = require("../models/caracteristicaModel")
const Categoria = require("../models/categoriaModel")


var productoController = {}

productoController.RegistrarProductos = async (req, res) => {
    var prodcutosReq =  [],
        arrayProductos = [];

    prodcutosReq = req.body.productos;

    prodcutosReq.forEach(producto => {
        let objProducto = new Producto({}),
            objMarca = new Marca({}),
            // arrayCaracteristicas = [],
            caracteristicas = {},
            arrayCategorias = [],
            imgArr;

        objMarca.idMarca = producto.BrandId;
        objMarca.marca = producto.BrandName;

        imgArr = JSON.parse(producto.imagen);

        if(producto.especificacion != ''){
            caracteristicas = JSON.parse(producto.especificacion)
            // let objEspe = JSON.parse(producto.especificacion);
            for (const key in caracteristicas) {
                caracteristicas[key] = caracteristicas[key].replace(/[,:]+/g,'')
                // arrayCaracteristicas.push(new Caracteristica(key,objEspe[key]))
            }
        }
        
        if(producto.ProductCategories != ''){
            var i = 0,
                objCate = JSON.parse(producto.ProductCategories)
            for (const key in objCate) {
                console.log(producto[`Nivel${i}`])
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
        
        objProducto.imagenes = imgArr
        objProducto.caracteristicas = caracteristicas
        objProducto.marca = objMarca
        objProducto.categorias = arrayCategorias
        arrayProductos.push(objProducto)

        // console.log(JSON.stringify(objProducto.caracteristicas).replace(/[{}"]+/g,''))

    });

    // await sqlProductoController.gestionProductos(arrayProductos)
    res.send(arrayProductos)
    res.send({success:1})


}

module.exports = productoController;
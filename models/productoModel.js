
class Producto {
    constructor(idVitex, modelo, nombre, idRefSAP, stockCC, stockOtroPago, 
        precioCC, precioOtroPago, cuotasPrecioCC, plazoGarantia, 
        imagenes, marca, caracteristicas, categorias, isMarketPlace, url, isActive){
            this.idVitex = idVitex || "";
            this.modelo = modelo || "";
            this.nombre = nombre || "";
            this.idRefSAP = idRefSAP || "";
            this.stockCC = stockCC || 0;
            this.stockOtroPago = stockOtroPago || 0;
            this.precioCC = precioCC || 0;
            this.precioOtroPago = precioOtroPago || 0;
            this.cuotasPrecioCC = cuotasPrecioCC || 0;
            this.plazoGarantia = plazoGarantia || 0;

            this.imagenes = imagenes || [];
            this.marca = marca || {}
            this.caracteristicas = caracteristicas || {};
            this.categorias = categorias || [{}]
            this.isMarketPlace = isMarketPlace || 0;
            this.url = url || ''
            this.isActive = isActive || 0;

        }
}

module.exports = Producto
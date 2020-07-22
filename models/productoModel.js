
class Producto {
    constructor(idVitex, nombre, idRefSAP, stockCC, stockOtroPago, descuentoCC, descuentoOtroPago,
        precioCC, precioOtroPago, cuotasPrecioCC, plazoGarantia, activo, visible, fechaCreacionWS, fechaModificaWS,
        imagenes, marca, caracteristicas, categorias, isMarketPlace, url){
            this.idVitex = idVitex || "vacio";
            this.nombre = nombre || "vacio";
            this.idRefSAP = idRefSAP || "vacio";
            this.stockCC = stockCC || 0;
            this.stockOtroPago = stockOtroPago || 0;
            // this.descuentoCC = descuentoCC || 0;
            // this.descuentoOtroPago = descuentoOtroPago || 0;
            this.precioCC = precioCC || 0;
            this.precioOtroPago = precioOtroPago || 0;
            this.cuotasPrecioCC = cuotasPrecioCC || 0;
            this.plazoGarantia = plazoGarantia || 0;

            // this.activo = activo || 0;
            // this.visible = visible || 0;
            // this.fechaCreacionWS = fechaCreacionWS || null;
            // this.fechaModificaWS = fechaModificaWS || null;
            this.imagenes = imagenes || [];
            this.marca = marca || {}
            this.caracteristicas = caracteristicas || {};
            this.categorias = categorias || [{}]
            this.isMarketPlace = isMarketPlace || 0;
            this.url = url || ''
        }
}

module.exports = Producto
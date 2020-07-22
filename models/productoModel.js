
class Producto {
    constructor(idVitex, nombre, idRefSAP, stockCC, stockOtroPago, descuentoCC, descuentoOtroPago,
        precioCC, precioOtroPago, interesCC, interesOtroPago, activo, visible, fechaCreacionWS, fechaModificaWS,
        imagenes, marca, caracteristicas, categorias){
            this.idVitex = idVitex || "vacio";
            this.nombre = nombre || "vacio";
            this.idRefSAP = idRefSAP || "vacio";
            this.stockCC = stockCC || 0;
            this.stockOtroPago = stockOtroPago || 0;
            this.descuentoCC = descuentoCC || 0;
            this.descuentoOtroPago = descuentoOtroPago || 0;
            this.precioCC = precioCC || 0;
            this.precioOtroPago = precioOtroPago || 0;
            this.interesCC = interesCC || 0;
            this.interesOtroPago = interesOtroPago || 0;
            this.activo = activo || 0;
            this.visible = visible || 0;
            this.fechaCreacionWS = fechaCreacionWS || null;
            this.fechaModificaWS = fechaModificaWS || null;
            this.imagenes = imagenes || [];
            this.marca = marca || {}
            this.caracteristicas = caracteristicas || {};
            this.categorias = categorias || [{}]
        }
}

module.exports = Producto
//clase de ejemplo
class Pedido {
    constructor(codigoUsuario, valorTotal, items, codPedido) {
        // always initialize all instance properties
        this.codigoUsuario = codigoUsuario;
        this.codPedido = codPedido;
        this.valorTotal = valorTotal;
        this.items = [new Item];
    }
}



class Item{
    constructor(cantidad, valorItem){
        //this.itemRow = [new Producto];
        this.cantidad = cantidad;
        this.valorItem = valorItem;
    }
}

class Producto{
    constructor(nombreProducto, sku, precio){
        this.nombreProducto = nombreProducto;
        this.sku = sku;
        this.precio = precio;
    }
}

class DatosCard{
    constructor(nombre, numerotarjeta, fechaExp, codSeg, sub12, sub0, iva, montoTotal){
        this.nombre = nombre;
        this.numerotarjeta = numerotarjeta;
        this.fechaExp = fechaExp;
        this.codSeg = codSeg;
        this.sub12 = sub12;
        this.sub0 = sub0;
        this.iva = iva;
        this.montoTotal = montoTotal;
    }
}

module.exports.Pedido = Pedido 
module.exports.Item = Item 
module.exports.Producto = Producto 
module.exports.DatosCard = DatosCard

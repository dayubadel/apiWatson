class Categoria{
    constructor(idCategoria, nombreCategoria, nivel){
        this.idCategoria = idCategoria || 'vacio';
        this.nombreCategoria = nombreCategoria || "vacio";
        this.nivel = nivel
    }
}

module.exports = Categoria
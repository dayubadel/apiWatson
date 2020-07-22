const { map } = require("mssql");

class Marca{
    constructor(idMarca, marca){
        this.idMarca = idMarca || 0;
        this.marca = marca || 'vacio';
    }
}

module.exports = Marca;
const { response } = require("../app");

const paymentezController = {}



paymentezController.GetFormulario = (req, res) => {
    res.sendFile('indexPago.html', { root: `${__dirname}\\..\\dist\\` })
}

paymentezController.RespuestaPago = (req, res) => {
    console.log(req.body)
    const resPay = req.body;

    if(resPay.hasOwnProperty("error")){
        
    }
    if(resPay.hasOwnProperty("transaction")){
        if(resPay.status == "failure"){

        }
        else{
            
        }
    }
    
}

module.exports = paymentezController;
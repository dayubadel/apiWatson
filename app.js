process.title = "API WATSON COMANDATO";
const express  = require('express');
const bodyParser = require('body-parser')
const configFile = require('./config/config.js')
const mssql = require("mssql")
require('tls').DEFAULT_MIN_VERSION = 'TLSv1'
// const ejs = require('ejs');

//middlewares
const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// app.use(
//   bodyParser.urlencoded({
//     extended: true
//   })
// );
// app.use(bodyParser.json());

// app.use(express.json({limit: '50mb'}));
// app.use(express.urlencoded({limit: '50mb'}));


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));





//conexion a bd
mssql.connect(configFile.sql.config_sql, (err) =>{
  if(err){
    console.log(err);
  }else{console.log('Conectado a BD');}
  
});


//routes
var watsonModule = require("./routes/watsonRoute")
var productModule = require("./routes/productoRoute")
var paymentezModule = require("./routes/paymentezRoute")



app.use("/watson", watsonModule)
app.use("/producto", productModule)
app.use("/pago", paymentezModule)



app.listen(8000, ()=> {
    console.log('Server is listen on port 8000')
});

module.exports = app;


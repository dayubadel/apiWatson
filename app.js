process.title = "API WATSON COMANDATO";
const express  = require('express');
const bodyParser = require('body-parser')
const configFile = require('./config/config.js')
const mssql = require("mssql")
require('tls').DEFAULT_MIN_VERSION = 'TLSv1'
// const ejs = require('ejs');

//middlewares
const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());



//conexion a bd
mssql.connect(configFile.sql.config_sql, (err) =>{
  if(err){
    console.log(err);
  }
  
});


//routes
var watsonModule = require("./routes/watsonRoute")



app.use("/watson", watsonModule)



app.listen(8000, ()=> {
    console.log('Server is listen on port 8000')
});

module.exports = app;


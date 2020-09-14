module.exports = {
    Watson : {
        id_workspace : '29851276-e5af-4b72-a57a-9a8b3aa449f4',
        apikey: 'h0LrRCijnu_DYMmKHdF4HgyJdmVW705fTjBZMjRvRGGU',
        url: 'https://api.us-south.assistant.watson.cloud.ibm.com',
        version: '2020-09-07'
    },
    valorGlobales :{
        IVAPercent : 12,
        valorEnvio : 3.99,
        urlSoapFactuacion : 'https://appchatbot.comandato.com:4433/wsChatBot_Orden.asmx?WSDL'
    },
    wsFacturacion: {
        token: 'WaOeSuob9n9jhZMkSuuCq+bo3PHpL9oYrzlBbFM1OcKrBHyr871R3Q==',
        urlSoapFactuacion : 'https://appchatbot.comandato.com:4433/wsChatBot_Orden.asmx?WSDL'
    },
    sql: {
        config_sql : {
            user : 'sa',
            password: '1234',
            server: 'DESKTOP-TU6JTR4\\SQLEXPRESS',
            port: 1433,
            database: 'chatbotComandato',
            options:{
              'encrypt' : true,
              'enableArithAbort': true
            }
        }
      } 
    //  sql: {
    //      config_sql : {
    //          user : 'sa',
    //          password: 'dayu2020',
    //          server: 'DESKTOP-5G64M37\\DAYUSQLSERVER',
    //          port: 1433,
    //          database: 'DchatbotComandato',
    //          options:{
    //            'encrypt' : true,
    //            'enableArithAbort': true
    //          }
    //      }
    //     }
    // sql: {
    //     config_sql : {
    //         user : 'userGaia',
    //         password: 'Gaia2020',
    //         server: '192.168.100.3',
    //         port: 8282,
    //         database: 'chatbotComandato',
    //         options:{
    //           'encrypt' : true,
    //           'enableArithAbort': true
    //         }
    //     }
}
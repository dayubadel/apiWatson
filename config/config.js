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
        urlSoapFactuacion : 'https://appchatbot.comandato.com:4433/wsChatBot_Orden.asmx?WSDL',
        uriWhatsapp : 'http://localhost:8011/sendmessage',
        uriMessenger : 'https://186.3.247.227:8443/wts',
        idPaginaFacebook : '1977616389118850'
    },
    wsFacturacion: {
        token: 'WaOeSuob9n/Su6erRro8Nlr+cj/4c2g14G3rZWvbouEgPt+CbkC6ljLrNo27aokC',
       // token: 'WaOeSuob9n9jhZMkSuuCq+bo3PHpL9oYrzlBbFM1OcKrBHyr871R3Q==',
        urlSoapFactuacion : 'https://appchatbot.comandato.com:4433/wsChatBot_Orden.asmx?WSDL'
    },
    wsTickets: {
        token: 'WaOeSuob9n/Su6erRro8Nlr+cj/4c2g14G3rZWvbouEgPt+CbkC6ljLrNo27aokC',
        urlSoapTickets : 'https://appchatbot.comandato.com/wsChatBot.asmx?WSDL'
    },   
    subdominioComandato : {
        url : 'https://api.df1.app:8010'
    },
    refoundPaymentez : {
        // apiLogin: 'CHATBOTSTG-EC-SERVER',
        // apiKey: 'gNSpExwDkOEeqich5Jc9A3QJg7fqES',
        // url : 'ccapi-stg.paymentez.com',
        apiLogin: 'CHATBOT-EC-SERVER',
        apiKey: 'ZsWJNYnTEr6kle7N8fauU6qrJshQJG',
        url : 'ccapi.paymentez.com',
        path : '/v2/transaction/refund/'
    },
    destinatarios : {
        equipoGaia : 'dayana.bailon@gaiaconsultores.biz;',//bryan.garcia@gaiaconsultores.biz;luismiguel.patino@gaiaconsultores.biz;jessica.obrien@gaiaconsultores.biz;',
        ventas : '',//'ventasweb@comandato.com;michael.guerrero@comandato.com;ventasweb1@comandato.com;cabad@comandato.com;julian.munoz@comandato.com;avarenius@comandato.com;',
        caja: '',//'caja1.tiendaweb@comandato.com;caja2.tiendaweb@comandato.com;caja3.tiendaweb@comandato.com;mrodriguez@comandato.com;',
        servicioCliente:'',// 'sac@comandato.com;',
        soporteTecnico: '',//'egranja@comandato.com;nelson.villegas@comandato.com;fjaccini@hotmail.com;',
        grupoWhatsApp: '',//'593987648370-1606160160@g.us',
        grupoWhatsAppDesarrolladora:'',// '593963206990-1601935738@g.us'
    },
    // sql: {
    //     config_sql : {
    //         user : 'sa',
    //         password: '1234',
    //         server: 'DESKTOP-TU6JTR4\\SQLEXPRESS',
    //         port: 1433,
    //         database: 'chatbotComandato',
    //         options:{
    //           'encrypt' : true,
    //           'enableArithAbort': true
    //         }
    //     }
    //   }
     sql: {
         config_sql : {
             user : 'sa',
             password: 'dayu2020',
             server: 'DESKTOP-5G64M37\\DAYUSQLSERVER',
             port: 1433,
             database: 'chatbotComandato',
             options:{
               'encrypt' : true,
               'enableArithAbort': true
             }
         }
        }
    // sql: {
    //     config_sql : {
    //         user : 'userGaia',
    //         password: 'Gaia2020',
    //         server: '192.168.100.3',
    //         port: 8282,
    //         database: 'chatbotComandatoV2',
    //         options:{
    //           'encrypt' : true,  
    //           'enableArithAbort': true
    //         }
    //     }
    // }   
}
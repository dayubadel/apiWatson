dim username : username = "userGaia"
dim password : password = "Gaia2020"
dim dataSource : dataSource = "192.168.100.3"
dim dataB : dataB = "chatbotComandato"

'var para reporte diario
dim objExcelReporte
dim excelBaseReporte
dim workSheetR1
dim workSheetR2
dim workSheetR3
dim nombreReporte

const initExcelReporte = 2 'fila fija. en esta se debe comenzar a escrir en el excel
dim excRowLog 'fila en la que se debe de escribir en workSheetLog
excRowLog = initExcelReporte

dim fechaReporte
fechaReporte = Day(NOW) & "-" & Month(NOW) & "-" & YEAR(NOW) &".xlsx"
nombreReporte = "C:\GAIA\APIs Chats\WatsonComandato\apiWatson\Reporte\Reportes_Generados\" & fechaReporte

Set objExcelReporte = CreateObject("Excel.Application")
objExcelReporte.Visible = True

set excelBaseReporte =  objExcelReporte.Workbooks.Open("C:\GAIA\APIs Chats\WatsonComandato\apiWatson\Reporte\REPORTES DORA.xlsx") 'abre excel en 2 plano

set workSheetR1 = excelBaseReporte.WorkSheets("Intenciones Clientes")
set workSheetR2 = excelBaseReporte.WorkSheets("INTENCION DE COMPRAR")
set workSheetR3 = excelBaseReporte.WorkSheets("SEGUIMIENTO CARRITO")
set workSheetR4 = excelBaseReporte.WorkSheets("CARRITOS OLVIDADOS")
set workSheetR5 = excelBaseReporte.WorkSheets("TICKETS")


excelBaseReporte.SaveAs(nombreReporte) 'guardo instancia del excel con la fecha actual


' Inicion seccion para pestaña Intecion Clientes reporte

dim totalCliente
dim intencionCliente
dim canalMensajeria


Set objConnection = CreateObject("ADODB.Connection")
Set rst = CreateObject("ADODB.RecordSet")
objConnection.open "Provider=SQLOLEDB; Data Source="&dataSource&"; uid="&username&"; pwd="&password&"; DATABASE=" &dataB

rst.Open "DECLARE	@return_value int EXEC @return_value = [dbo].[sp_ConsultarEstadisticasIntencionesClientesPorDia] SELECT	'Return Value' = @return_value", objConnection
Do While NOT rst.EOF

    totalCliente = rst.fields(0)
    intencionCliente = rst.fields(1)
    canalMensajeria = rst.fields(2)

    workSheetR1.Cells(excRowLog, 1) = totalCliente
    workSheetR1.Cells(excRowLog, 2) = intencionCliente
    workSheetR1.Cells(excRowLog, 3) = canalMensajeria

    rst.MoveNext
    excRowLog = excRowLog + 1
Loop
rst.Close
objConnection.close

' Fin seccion para pestaña Intecion Clientes reporte

' Inicio seccion para pestaña INTENCION DE COMPRAR

excRowLog = initExcelReporte
excRowLog = excRowLog - 1


Set rst = CreateObject("ADODB.RecordSet")
objConnection.open "Provider=SQLOLEDB; Data Source="&dataSource&"; uid="&username&"; pwd="&password&"; DATABASE=" &dataB

rst.Open "DECLARE	@return_value int EXEC @return_value = [dbo].[sp_ConsultarPistasClientesSinCarritoPorDia] SELECT	'Return Value' = @return_value", objConnection
Do While NOT rst.EOF

    ' totalCliente = rst.fields(0)
    ' intencionCliente = rst.fields(1)
    ' canalMensajeria = rst.fields(2)
    if(rst.fields(0) = "CANAL MENSAJERIA")then
        workSheetR2.Cells(excRowLog, 1).Interior.Color = RGB(0,86,179)
        workSheetR2.Cells(excRowLog, 2).Interior.Color = RGB(0,86,179)
        workSheetR2.Cells(excRowLog, 3).Interior.Color = RGB(0,86,179)
        
        workSheetR2.Cells(excRowLog, 1).Font.Bold = TRUE
        workSheetR2.Cells(excRowLog, 2).Font.Bold = TRUE
        workSheetR2.Cells(excRowLog, 3).Font.Bold = TRUE
        
        workSheetR2.Cells(excRowLog, 1).Font.ColorIndex = 2
        workSheetR2.Cells(excRowLog, 2).Font.ColorIndex = 2
        workSheetR2.Cells(excRowLog, 3).Font.ColorIndex = 2
    end if
    if(rst.fields(1) = "CATEGORIA")then
        workSheetR2.Cells(excRowLog, 2).Interior.Color = RGB(207,226,243)
        workSheetR2.Cells(excRowLog, 3).Interior.Color = RGB(207,226,243)
        workSheetR2.Cells(excRowLog, 4).Interior.Color = RGB(207,226,243)
        
        workSheetR2.Cells(excRowLog, 2).Font.Bold = TRUE
        workSheetR2.Cells(excRowLog, 3).Font.Bold = TRUE
        workSheetR2.Cells(excRowLog, 4).Font.Bold = TRUE

        workSheetR2.Cells(excRowLog, 2).Font.ColorIndex = 1
        workSheetR2.Cells(excRowLog, 3).Font.ColorIndex = 1
        workSheetR2.Cells(excRowLog, 4).Font.ColorIndex = 1
    end if
    workSheetR2.Cells(excRowLog, 1) = rst.fields(0)
    workSheetR2.Cells(excRowLog, 2) = rst.fields(1)
    workSheetR2.Cells(excRowLog, 3) = rst.fields(2)
    workSheetR2.Cells(excRowLog, 4) = rst.fields(3)
    workSheetR2.Cells(excRowLog, 5) = rst.fields(4)
    workSheetR2.Cells(excRowLog, 6) = rst.fields(5)
    workSheetR2.Cells(excRowLog, 7) = rst.fields(6)
    workSheetR2.Cells(excRowLog, 8) = rst.fields(7)
    workSheetR2.Cells(excRowLog, 9) = rst.fields(8)
    workSheetR2.Cells(excRowLog, 10) = rst.fields(9)

    rst.MoveNext
    excRowLog = excRowLog + 1
Loop
rst.Close
objConnection.close

' Fin  seccion para pestaña INTENCION DE COMPRAR


' Inicio seccion para pestaña SEGUIMIENTO CARRITO

excRowLog = initExcelReporte
excRowLog = excRowLog - 1

Set rst = CreateObject("ADODB.RecordSet")
objConnection.open "Provider=SQLOLEDB; Data Source="&dataSource&"; uid="&username&"; pwd="&password&"; DATABASE=" &dataB

rst.Open "DECLARE	@return_value int EXEC @return_value = [dbo].[sp_ConsultarClientesGestionCarritoPorDia] SELECT	'Return Value' = @return_value", objConnection
Do While NOT rst.EOF


    if(rst.fields(2) = "NOMBRE") then
        workSheetR3.Cells(excRowLog, 1).Interior.Color = RGB(0,86,179)
        workSheetR3.Cells(excRowLog, 2).Interior.Color = RGB(0,86,179)
        workSheetR3.Cells(excRowLog, 3).Interior.Color = RGB(0,86,179)
        workSheetR3.Cells(excRowLog, 4).Interior.Color = RGB(0,86,179)
        workSheetR3.Cells(excRowLog, 5).Interior.Color = RGB(0,86,179)
        workSheetR3.Cells(excRowLog, 6).Interior.Color = RGB(0,86,179)
        workSheetR3.Cells(excRowLog, 7).Interior.Color = RGB(0,86,179)

        workSheetR3.Cells(excRowLog, 1).Font.Bold = TRUE
        workSheetR3.Cells(excRowLog, 2).Font.Bold = TRUE
        workSheetR3.Cells(excRowLog, 3).Font.Bold = TRUE
        workSheetR3.Cells(excRowLog, 4).Font.Bold = TRUE
        workSheetR3.Cells(excRowLog, 5).Font.Bold = TRUE
        workSheetR3.Cells(excRowLog, 6).Font.Bold = TRUE
        workSheetR3.Cells(excRowLog, 7).Font.Bold = TRUE

        workSheetR3.Cells(excRowLog, 1).Font.ColorIndex = 2
        workSheetR3.Cells(excRowLog, 2).Font.ColorIndex = 2
        workSheetR3.Cells(excRowLog, 3).Font.ColorIndex = 2
        workSheetR3.Cells(excRowLog, 4).Font.ColorIndex = 2
        workSheetR3.Cells(excRowLog, 5).Font.ColorIndex = 2
        workSheetR3.Cells(excRowLog, 6).Font.ColorIndex = 2
        workSheetR3.Cells(excRowLog, 7).Font.ColorIndex = 2
    end if
    if(rst.fields(4) = "Cantidad") then
        workSheetR3.Cells(excRowLog, 3).Interior.Color = RGB(207,226,243)
        workSheetR3.Cells(excRowLog, 4).Interior.Color = RGB(207,226,243)
        workSheetR3.Cells(excRowLog, 5).Interior.Color = RGB(207,226,243)
        workSheetR3.Cells(excRowLog, 6).Interior.Color = RGB(207,226,243)
        workSheetR3.Cells(excRowLog, 7).Interior.Color = RGB(207,226,243)
        
        workSheetR3.Cells(excRowLog, 3).Font.Bold = TRUE
        workSheetR3.Cells(excRowLog, 4).Font.Bold = TRUE
        workSheetR3.Cells(excRowLog, 5).Font.Bold = TRUE
        workSheetR3.Cells(excRowLog, 6).Font.Bold = TRUE
        workSheetR3.Cells(excRowLog, 7).Font.Bold = TRUE

        workSheetR3.Cells(excRowLog, 3).Font.ColorIndex = 1
        workSheetR3.Cells(excRowLog, 4).Font.ColorIndex = 1
        workSheetR3.Cells(excRowLog, 5).Font.ColorIndex = 1
        workSheetR3.Cells(excRowLog, 6).Font.ColorIndex = 1
        workSheetR3.Cells(excRowLog, 7).Font.ColorIndex = 1
    end if

    workSheetR3.Cells(excRowLog, 1) = rst.fields(2)
    workSheetR3.Cells(excRowLog, 2) = rst.fields(3)
    workSheetR3.Cells(excRowLog, 3) = rst.fields(4)
    workSheetR3.Cells(excRowLog, 4) = rst.fields(5)
    workSheetR3.Cells(excRowLog, 5) = rst.fields(6)
    workSheetR3.Cells(excRowLog, 6) = rst.fields(7)
    workSheetR3.Cells(excRowLog, 7) = rst.fields(8)

    rst.MoveNext
    excRowLog = excRowLog + 1
Loop
rst.Close
objConnection.close

' Fin  seccion para pestaña INTENCION DE COMPRAR


' Inicio seccion para pestaña CARRITOS OLVIDADOS

excRowLog = initExcelReporte
excRowLog = excRowLog - 1


Set rst = CreateObject("ADODB.RecordSet")
objConnection.open "Provider=SQLOLEDB; Data Source="&dataSource&"; uid="&username&"; pwd="&password&"; DATABASE=" &dataB

rst.Open "DECLARE	@return_value int EXEC @return_value = [dbo].[sp_ConsultarCarritosAbandonados] SELECT	'Return Value' = @return_value", objConnection
Do While NOT rst.EOF

    if(rst.fields(2) = "NOMBRE") then
        workSheetR4.Cells(excRowLog, 1).Interior.Color = RGB(0,86,179)
        workSheetR4.Cells(excRowLog, 2).Interior.Color = RGB(0,86,179)
        workSheetR4.Cells(excRowLog, 3).Interior.Color = RGB(0,86,179)
        workSheetR4.Cells(excRowLog, 4).Interior.Color = RGB(0,86,179)
        workSheetR4.Cells(excRowLog, 5).Interior.Color = RGB(0,86,179)

        workSheetR4.Cells(excRowLog, 1).Font.Bold = TRUE
        workSheetR4.Cells(excRowLog, 2).Font.Bold = TRUE
        workSheetR4.Cells(excRowLog, 3).Font.Bold = TRUE
        workSheetR4.Cells(excRowLog, 4).Font.Bold = TRUE
        workSheetR4.Cells(excRowLog, 5).Font.Bold = TRUE

        workSheetR4.Cells(excRowLog, 1).Font.ColorIndex = 2
        workSheetR4.Cells(excRowLog, 2).Font.ColorIndex = 2
        workSheetR4.Cells(excRowLog, 3).Font.ColorIndex = 2
        workSheetR4.Cells(excRowLog, 4).Font.ColorIndex = 2
        workSheetR4.Cells(excRowLog, 5).Font.ColorIndex = 2
    end if
    if(rst.fields(4) = "Cantidad") then
        workSheetR4.Cells(excRowLog, 3).Interior.Color = RGB(207,226,243)
        workSheetR4.Cells(excRowLog, 4).Interior.Color = RGB(207,226,243)
        workSheetR4.Cells(excRowLog, 5).Interior.Color = RGB(207,226,243)
        
        workSheetR4.Cells(excRowLog, 3).Font.Bold = TRUE
        workSheetR4.Cells(excRowLog, 4).Font.Bold = TRUE
        workSheetR4.Cells(excRowLog, 5).Font.Bold = TRUE

        workSheetR4.Cells(excRowLog, 3).Font.ColorIndex = 1
        workSheetR4.Cells(excRowLog, 4).Font.ColorIndex = 1
        workSheetR4.Cells(excRowLog, 5).Font.ColorIndex = 1
    end if
    workSheetR4.Cells(excRowLog, 1) = rst.fields(2)
    workSheetR4.Cells(excRowLog, 2) = rst.fields(3)
    workSheetR4.Cells(excRowLog, 3) = rst.fields(4)
    workSheetR4.Cells(excRowLog, 4) = rst.fields(5)
    workSheetR4.Cells(excRowLog, 5) = rst.fields(6)
   

    rst.MoveNext
    excRowLog = excRowLog + 1
Loop
rst.Close
objConnection.close

' Fin  seccion para pestaña CARRITOS OLVIDADOS

' Inicio seccion para pestaña TICKETS

excRowLog = initExcelReporte
excRowLog = excRowLog - 1


Set rst = CreateObject("ADODB.RecordSet")
objConnection.open "Provider=SQLOLEDB; Data Source="&dataSource&"; uid="&username&"; pwd="&password&"; DATABASE=" &dataB

rst.Open "DECLARE	@return_value int EXEC @return_value = [dbo].[Sp_ConsultarNotificiacionesPorDia] SELECT	'Return Value' = @return_value", objConnection
Do While NOT rst.EOF

    if(rst.fields(2) = "NOMBRE") then
        workSheetR5.Cells(excRowLog, 1).Interior.Color = RGB(0,86,179)
        workSheetR5.Cells(excRowLog, 2).Interior.Color = RGB(0,86,179)
        workSheetR5.Cells(excRowLog, 3).Interior.Color = RGB(0,86,179)
        workSheetR5.Cells(excRowLog, 4).Interior.Color = RGB(0,86,179)
        workSheetR5.Cells(excRowLog, 5).Interior.Color = RGB(0,86,179)

        workSheetR5.Cells(excRowLog, 1).Font.Bold = TRUE
        workSheetR5.Cells(excRowLog, 2).Font.Bold = TRUE
        workSheetR5.Cells(excRowLog, 3).Font.Bold = TRUE
        workSheetR5.Cells(excRowLog, 4).Font.Bold = TRUE
        workSheetR5.Cells(excRowLog, 5).Font.Bold = TRUE

        workSheetR5.Cells(excRowLog, 1).Font.ColorIndex = 2
        workSheetR5.Cells(excRowLog, 2).Font.ColorIndex = 2
        workSheetR5.Cells(excRowLog, 3).Font.ColorIndex = 2
        workSheetR5.Cells(excRowLog, 4).Font.ColorIndex = 2
        workSheetR5.Cells(excRowLog, 5).Font.ColorIndex = 2
    end if
    if(rst.fields(4) = "MOTIVO") then
        workSheetR5.Cells(excRowLog, 3).Interior.Color = RGB(207,226,243)
        workSheetR5.Cells(excRowLog, 4).Interior.Color = RGB(207,226,243)
        workSheetR5.Cells(excRowLog, 5).Interior.Color = RGB(207,226,243)
        
        workSheetR5.Cells(excRowLog, 3).Font.Bold = TRUE
        workSheetR5.Cells(excRowLog, 4).Font.Bold = TRUE
        workSheetR5.Cells(excRowLog, 5).Font.Bold = TRUE

        workSheetR5.Cells(excRowLog, 3).Font.ColorIndex = 1
        workSheetR5.Cells(excRowLog, 4).Font.ColorIndex = 1
        workSheetR5.Cells(excRowLog, 5).Font.ColorIndex = 1
    end if

    workSheetR5.Cells(excRowLog, 1) = rst.fields(2)
    workSheetR5.Cells(excRowLog, 2) = rst.fields(3)
    workSheetR5.Cells(excRowLog, 3) = rst.fields(4)
    workSheetR5.Cells(excRowLog, 4) = rst.fields(5)
    workSheetR5.Cells(excRowLog, 5) = rst.fields(6)
   

    rst.MoveNext
    excRowLog = excRowLog + 1
Loop
rst.Close
objConnection.close

' Fin  seccion para pestaña TICKETS



excelBaseReporte.Close true
objExcelReporte.Quit
objExcelReporte = Empty
set excelBaseReporte = Nothing

Set emailObj      = CreateObject("CDO.Message")

emailObj.From = "chatbot1@comandato.com"
emailObj.To = "ventasweb@comandato.com;cabad@comandato.com;julian.munoz@comandato.com;sac@comandato.com;"
emailObj.Cc = "manuel.ramirez@comandato.com;diego.aviles@comandato.com;dayana.bailon@gaiaconsultores.biz;bryan.garcia@gaiaconsultores.biz;luismiguel.patino@gaiaconsultores.biz;jessica.obrien@gaiaconsultores.biz;"


        caja: 'caja1.tiendaweb@comandato.com;caja2.tiendaweb@comandato.com;caja3.tiendaweb@comandato.com;mrodriguez@comandato.com;',
        servicioCliente: 'sac@comandato.com;',

emailObj.Subject  = "Reporte Didario Dora"
' emailObj.TextBody = "Test kenvio ass"
' emailObj.TextBody = "Test envio masasail"
emailObj.HTMLBody = "<p>Estimados</p><br><p>En la presente se adjunta el reporte diario de chatbot con la informacion de intenciones de clientes, productos solicitados y carritos de compras creados.</p><p>Saludos</p>"
emailObj.AddAttachment (nombreReporte)  

Set emailConfig = emailObj.Configuration

emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/smtpserver") = "mail.comandato.com"
emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/smtpserverport") = 587
emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/sendusing")    = 2  
emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/smtpauthenticate") = 1  
emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/smtpusessl")      = false 
emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/sendusername")    = "chatbot1"
emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/sendpassword")    = "cmdchatbot#20"

emailConfig.Fields.Update

emailObj.Send
Set emailConfig = nothing











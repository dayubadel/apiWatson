dim username : username = "sa"
dim password : password = "1234"
dim dataSource : dataSource = "."
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


excelBaseReporte.SaveAs(nombreReporte) 'guardo instancia del excel con la fecha actual


' Inicion seccion para pestaña Intecion Clientes reporte

dim totalCliente
dim intencionCliente
dim canalMensajeria

msgbox("cerrar mensaje activacion")

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



Set rst = CreateObject("ADODB.RecordSet")
objConnection.open "Provider=SQLOLEDB; Data Source="&dataSource&"; uid="&username&"; pwd="&password&"; DATABASE=" &dataB

rst.Open "DECLARE	@return_value int EXEC @return_value = [dbo].[sp_ConsultarPistasClientesSinCarritoPorDia] SELECT	'Return Value' = @return_value", objConnection
Do While NOT rst.EOF

    ' totalCliente = rst.fields(0)
    ' intencionCliente = rst.fields(1)
    ' canalMensajeria = rst.fields(2)

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



Set rst = CreateObject("ADODB.RecordSet")
objConnection.open "Provider=SQLOLEDB; Data Source="&dataSource&"; uid="&username&"; pwd="&password&"; DATABASE=" &dataB

rst.Open "DECLARE	@return_value int EXEC @return_value = [dbo].[sp_ConsultarClientesGestionCarritoPorDia] SELECT	'Return Value' = @return_value", objConnection
Do While NOT rst.EOF

    ' totalCliente = rst.fields(0)
    ' intencionCliente = rst.fields(1)
    ' canalMensajeria = rst.fields(2)

    workSheetR3.Cells(excRowLog, 1) = rst.fields(0)
    workSheetR3.Cells(excRowLog, 2) = rst.fields(1)
    workSheetR3.Cells(excRowLog, 3) = rst.fields(2)
    workSheetR3.Cells(excRowLog, 4) = rst.fields(3)
    workSheetR3.Cells(excRowLog, 5) = rst.fields(4)
    workSheetR3.Cells(excRowLog, 6) = rst.fields(5)
    workSheetR3.Cells(excRowLog, 7) = rst.fields(6)
    workSheetR3.Cells(excRowLog, 8) = rst.fields(7)
    workSheetR3.Cells(excRowLog, 9) = rst.fields(8)
    workSheetR3.Cells(excRowLog, 10) = rst.fields(9)
    workSheetR3.Cells(excRowLog, 11) = rst.fields(10)
    workSheetR3.Cells(excRowLog, 12) = rst.fields(11)
    workSheetR3.Cells(excRowLog, 13) = rst.fields(12)
    workSheetR3.Cells(excRowLog, 14) = rst.fields(13)
    workSheetR3.Cells(excRowLog, 15) = rst.fields(14)
    workSheetR3.Cells(excRowLog, 16) = rst.fields(15)
    workSheetR3.Cells(excRowLog, 17) = rst.fields(16)
    workSheetR3.Cells(excRowLog, 18) = rst.fields(17)

    rst.MoveNext
    excRowLog = excRowLog + 1
Loop
rst.Close
objConnection.close

' Fin  seccion para pestaña INTENCION DE COMPRAR


excelBaseReporte.Close true
objExcelReporte.Quit
objExcelReporte = Empty
set excelBaseReporte = Nothing

Set emailObj      = CreateObject("CDO.Message")

emailObj.From = "bryanfgg@gmail.com"
emailObj.To = "bryan.garcia@gaiaconsultores.biz"
emailObj.Cc = "dayana.bailon@gaiaconsultores.biz"

emailObj.Subject  = "Test envio mail"
emailObj.TextBody = "Test envio ass"
emailObj.TextBody = "Test envio masasail"
emailObj.HTMLBody = "<p>Estimados</p><br><p>En la presente se adjunta el reporte diario de chatbot con la informacion de intenciones de clientes, productos solicitados y carritos de compras creados.</p><br><p>Saludos</p>"
emailObj.AddAttachment (nombreReporte)  

Set emailConfig = emailObj.Configuration

emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/smtpserver") = "smtp.gmail.com"
emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/smtpserverport") = 465
emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/sendusing")    = 2  
emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/smtpauthenticate") = 1  
emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/smtpusessl")      = true 
emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/sendusername")    = "bryanfgg"
emailConfig.Fields("http://schemas.microsoft.com/cdo/configuration/sendpassword")    = "infinitum1618"

emailConfig.Fields.Update

emailObj.Send
Set emailConfig = nothing






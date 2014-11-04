<?php 
session_start();
require_once("inc/Errores.php");
require_once("inc/Util.php");
require_once("inc/Bd.php");
require_once("inc/Estaciones.php");
require_once("inc/Ut.php");
require_once("inc/Rutas.php");
require_once("inc/Pdf.php");

if(!isset($_SESSION['IDUSER'])) 
{	
    echo "<br><br><center>Se ha acabado la sesión, se debe iniciar sesión de nuevo</center>";
    exit;
}
$idUser=$_SESSION['IDUSER'];
// creamos el pdf
$ruta=new Rutas();
$respuesta=array();
if(isset($_POST['idRuta']))
{
  $id=intval($_POST['idRuta']*1);
  $respuesta=$ruta->getTrayectosTramos($id,$idUser);  
} 
if(count($respuesta)>0)
{
	$fecha=$respuesta[0];
	$pdf=new Pdf();
	
	foreach ($respuesta[1] as $k => $v) 
	{
		   $ntr=$v[0];
		   $pdf->AddPage();
	       $pdf->Titulo($fecha);
		   $pdf->EncabezadoTabla($ntr);
		   $tramos=$v[1];
		   $pdf->Tabla($header,$tramos);		 	 
	}
	$pdf->Output();
}
?>
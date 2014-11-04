<?php
session_start();
require_once("inc/Errores.php");
require_once("inc/Util.php");
require_once("inc/Bd.php");
require_once("inc/Usuario.php");
require_once("inc/Estaciones.php");

if(!isset($_SESSION['IDUSER'])) 
{
  echo "{success: false, errores: { razon: 'false' }}";
  exit;
}
else {
   foreach($_POST as $k=>$v)     $$k=trim(strip_tags($v)); 
   $idUser=$_SESSION['IDUSER'];
   $datos=array('nombre'=>$nombre,'lat'=>$lat,'lon'=>$lon,'direccion'=>$direccion,'activo'=>$activo,'idUser'=>$idUser);        
   $es=new Estaciones();
   $res=$es->add($datos);	
   $datosD = json_decode($res,true);
}
// cuando hay errores
if( Errores::g()->num()!=0)  
{
   $errores=implode("<br><br>",Errores::g()->get());    
   echo "{success: false, errores: { razon: ' " . $errores . "' }}";
}
else
{   
   echo "{success: true, datos: { id: '" . $datosD['data'][0]['id_estaciones']  . "' }}";
}





/*
if($res==true)   echo "{success: true}";
else
{
   $errores=implode(",",$res->get());
   echo "{success: false, errores: { razon: ' " . $errores . "' }}";
}
*/
?>

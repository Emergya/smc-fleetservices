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
   foreach($_POST as $k=>$v)    $$k=trim(strip_tags($v)); 
   $idUser=$_SESSION['IDUSER'];
   $ide=$id_estaciones;
   //if(!isset($activo) || ($activo=="")) $activo="off";      
   $datos=array('nombre'=>$nombre,'direccion'=>$direccion,'lat'=>$lat,'lon'=>$lon,'activo'=>$activo,'idUser'=>$idUser);
   $es=new Estaciones();   
   $es->edit($ide,$datos);    
}



// cuando hay errores
if( Errores::g()->num()!=0)  
{
   $errores=implode(",",Errores::g()->get());       
   echo "{success: false, errores: { razon: ' " . $errores . "' }}";
}
else
{
   echo "{success: true}";
}




?>

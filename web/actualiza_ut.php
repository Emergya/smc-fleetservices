<?php
session_start();
require_once("inc/Errores.php");
require_once("inc/Util.php");
require_once("inc/Bd.php");
require_once("inc/Usuario.php");
require_once("inc/Ut.php");


if(!isset($_SESSION['IDUSER'])) 
{
    echo "{success: false, errores: { razon: false }}";
    exit;
}
else {
   foreach($_POST as $k=>$v)    $$k=trim(strip_tags($v)); 
   $idUser=$_SESSION['IDUSER'];
   $idT=$id_transportes;
   $datos=array('nombre'=>$nombre,'estacionInicio'=>$estacionInicio,'estacionFin'=>$estacionFin,'costeXkm'=>$coste_x_km,'costeXdia'=>$coste_x_dia,'activo'=>$activo,'idUser'=>$idUser);
   $ut=new Ut();
   $ut->edit($idT,$datos);    
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

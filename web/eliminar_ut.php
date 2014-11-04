<?php
session_start();
require_once("inc/Errores.php");
require_once("inc/Util.php");
require_once("inc/Bd.php");
require_once("inc/Usuario.php");
require_once("inc/Ut.php");

if(!isset($_SESSION['IDUSER']))
{ 
  echo "{success: false, errores: { razon: 'false' }}";
  exit;
}
else {
   foreach($_POST as $k=>$v)     $$k=trim(strip_tags($v)); 
   $idUser=$_SESSION['IDUSER'];
   $aT=explode(",",$_POST['id']);  // lista de transportes delimintados por "," (coma)        
   $ut=new Ut();
   $ut->delete($aT);	
}

// cuando hay errores
if( Errores::g()->num()!=0)  
{
   $errores=implode("<br><br>",Errores::g()->get());    
   echo "{success: false, errores: { razon: ' " . utf8_encode($errores) . "' }}";
}
else
{
   echo "{success: true}";
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

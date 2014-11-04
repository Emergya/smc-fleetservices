<?php
session_start();
require_once("inc/Errores.php");
require_once("inc/Util.php");
require_once("inc/Bd.php");
require_once("inc/Usuario.php");

foreach($_POST as $k=>$v)	 $$k=trim(strip_tags($v));
$datos=array('nombre'=>$nombre,'email'=>$email,'clave'=>$clave,'apellidos'=>$apellidos);	
	
$user=new Usuario();
$user->add($datos);
			




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

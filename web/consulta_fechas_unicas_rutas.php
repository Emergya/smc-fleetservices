<?php

header('Content-Type: application/json');

session_start();
require_once("inc/Errores.php");
require_once("inc/Util.php");
require_once("inc/Bd.php");
require_once("inc/Rutas.php");

if(isset($_SESSION['IDUSER'])) 
{
	$idUser=$_SESSION['IDUSER'];
    $ruta=new Rutas();                     
    echo $ruta->getRutas($idUser);
}
else 
{   
echo "{success: false, errores: { razon: 'false' }}";	
}
?>
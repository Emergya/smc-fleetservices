<?php

header("Content-Type: application/json");

session_start();
require_once("inc/Errores.php");
require_once("inc/Util.php");
require_once("inc/Bd.php");
require_once("inc/Estaciones.php");

if(isset($_SESSION['IDUSER'])) 
{
    $es=new Estaciones();     
    $idUser=$_SESSION['IDUSER'];
    
    if(isset($_POST['id'])) $id=intval($_POST['id']);
    else $id=0;
    echo $es->getJson($idUser,$id);
}
else {   
echo "{success: false, errores: { razon: 'false' }}";	
}
?>
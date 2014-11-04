<?php

header('Content-Type: application/json');

session_start();
require_once("inc/Errores.php");
require_once("inc/Util.php");
require_once("inc/Bd.php");
require_once("inc/Ut.php");

if(isset($_SESSION['IDUSER'])) 
{
    $ut=new Ut();
    // se recibe $activo=t-->true,$activo=f --> false 
    $idUser=$_SESSION['IDUSER'];
    
    if(isset($_POST["id"])) $id=intval($_POST['id']);
    else $id=0;
    // Para que nos devuelva todos los transportes o solo el json de un determinado transporte($id)
    echo $ut->getJson($idUser,$id);
}
else {  
echo "{success: false, errores: { razon: 'false' }}";	
}
?>
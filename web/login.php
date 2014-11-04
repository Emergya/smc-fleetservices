<?php
session_start();
require_once("inc/Errores.php");
require_once("inc/Util.php");
require_once("inc/Bd.php");
require_once("inc/Usuario.php");

$email=trim($_POST["email"]);
$clave=trim($_POST["clave"]);


$user=new Usuario();
// La variable  success siempre tiene que estar presente(no cambiar nombre variable) con valor true o false para que el Ext.FormPanel se de cuenta si ha habido fallo o no
if($user->login($email,$clave))  echo "{success: true}";
else echo "{success: false, errores: { razon: 'Error en el acceso. Intenta de nuevo.' }}";

?>

<?php

header("Content-Type: application/json");


session_start();
//ini_set("soap.wsdl_cache_enabled", 0);
require_once("inc/Errores.php");
require_once("inc/Util.php");
require_once("inc/Bd.php");
require_once("inc/Estaciones.php");
require_once("inc/Ut.php");
require_once("inc/Rutas.php");


if(!isset($_SESSION['IDUSER'])) 
{
    echo "{success: false, errores: { razon: 'false' }}";
    exit;
}

$input = $HTTP_RAW_POST_DATA;
//$input = '{"cantidad":"1","carga":"100","norma":"4","pendiente":"0%","tonelaje":60,"vehiculoCodigo":"tipo.1","velocidad":59.828520000000005,"urbana":"0","rural":4.98571,"highway":"0"}';

$url = 'http://www.isoin.es/emisiones-web/api/impactoAmbientalTransporteMercancias';

$ch = curl_init();


// set the target url
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
curl_setopt($sesion, CURLOPT_HEADER, false); 

// howmany parameter to post
curl_setopt($ch, CURLOPT_POST, true);

// parameters
curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($c, CURLOPT_FOLLOWLOCATION, true);


$result = curl_exec ($ch);
$result = json_decode($result);


curl_close ($ch);

$data = $result -> data;

 if(count($data) > 0) // si no está vacio, la respuesta es correcta
 {    
    $outData = $result;
   
 }
 else
 {
   Errores::g()->add('No se ha podido calcular el impacto ambiental');        
 }
 


if( Errores::g()->num()!=0)  
{
   $errores=implode("<br><br>",Errores::g()->get());    
   echo "{success: false, errores: { razon: ' " . utf8_encode($errores) . "' }}";
}
else
{
   
   echo "{success: true,datos:" . json_encode($outData)  . "}";
}

?>
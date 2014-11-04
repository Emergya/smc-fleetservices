<?php
ini_set("soap.wsdl_cache_enabled", 0);
$servicio="http://10.35.1.69:8080/webservice/services/tspRoute?wsdl"; //url del servicio
//$parametros=array(); //parametros de la llamada
//$parametros[]="21/12/2013,21:11:11,5,15,85,58,69";
$client = new SoapClient($servicio);
$param="01/01/1900,22:22:00,25,91,92,93,94,95,96,97,98";
$salWs=$client->hello(array("arg0"=>$param));
$salida=$salWs->return; // tengo ya el string xxx,xxxx,xxx|yyy,yyyy,yyy|..
$tablaPasos=explode('|',$salida); // array con indices automáticos(0,1,2...) de cada paso
$respuesta=array();
foreach($tablaPasos as $k=>$v) // por cada paso construimos la salida a base de datos y extjs 
{
    $tmp=explode(",",$v);
    $res=array();    
    $res['lat']=$tmp[0];
    $res['lon']=$tmp[1];
    $res['idEstacion']=$tmp[2];
    $res['tiempo']=$tmp[3];
    $res['distancia']=$tmp[4];
    $respuesta[]=$res;
}
 var_dump($respuesta);
 exit;
 $salida1=array($transporte,$respuesta); 
 $salidaWS=array($salida1);
?>
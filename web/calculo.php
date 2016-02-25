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
$idUser=$_SESSION['IDUSER'];

/* INICIO ENTRADA DE DATOS*/

$input = $HTTP_RAW_POST_DATA;
//$input = '{"fecha":"2014-12-15T00:00:00","hora":"00:00","vehicles":[{"id":2,"name":"Vehiculo 1","origin":{"id":2,"name":"Parada","latitude":"37.389510575541024","longitude":"-5.950781396473022"},"target":{"id":18,"name":"Nueva","latitude":"37.42852418375166","longitude":"-5.9772491455078125"},"costPerDistance":1,"costPerTime":1},{"id":3,"name":"Vehiculo 2","origin":{"id":13,"name":"Nueva parada","latitude":"37.356513484169476","longitude":"-5.961112976074219"},"target":{"id":18,"name":"Nueva","latitude":"37.42852418375166","longitude":"-5.9772491455078125"},"costPerDistance":2,"costPerTime":1},{"id":4,"name":"Vehiculo 3","target":{"id":25,"name":"Stop3","latitude":"37.41189149367013","longitude":"-5.931243896484375"},"costPerDistance":2,"costPerTime":3}],"stops":[{"id":2,"name":"Parada","latitude":"37.389510575541024","longitude":"-5.950781396473022"},{"id":13,"name":"Nueva parada","latitude":"37.356513484169476","longitude":"-5.961112976074219"},{"id":18,"name":"Nueva","latitude":"37.42852418375166","longitude":"-5.9772491455078125"},{"id":24,"name":"Stop2","latitude":"37.38488959341309","longitude":"-5.912361145019531"},{"id":25,"name":"Stop3","latitude":"37.41189149367013","longitude":"-5.931243896484375"},{"id":26,"name":"Stop4","latitude":"37.41052799460729","longitude":"-5.971755981445312"},{"id":29,"name":"Stop 7","latitude":"37.36388139021367","longitude":"-5.998535156249999"},{"id":30,"name":"Stop 8","latitude":"37.44024664683884","longitude":"-5.938110351562499"},{"id":31,"name":"Stop 9","latitude":"37.35951531098714","longitude":"-5.871162414550781"},{"id":32,"name":"Stop 1","latitude":"37.39170917324324","longitude":"-6.053810119628906"}]}';
$inputObj = json_decode($input);
$vehicles = $inputObj -> vehicles;
$stops = $inputObj -> stops;
$data = '{"vehicles":'.json_encode($vehicles).', "stops":'. json_encode($stops).'}';
$hora = $inputObj -> hora;
$fecha = explode ('T', $inputObj -> fecha)[0];



//$url = 'http://localhost:8084/mtsp-ga-webapp/v1/calculateMTSP';
//$url = 'http://localhost:8084/smartcity-mtsp/v1/calculateMTSP';
$url = 'http://178.62.197.215/smartcity-mtsp//v1/calculateMTSP';

$ch = curl_init();


// set the target url
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
curl_setopt($sesion, CURLOPT_HEADER, false); 

// howmany parameter to post
curl_setopt($ch, CURLOPT_POST, true);

// parameters
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($c, CURLOPT_FOLLOWLOCATION, true);


$result = curl_exec ($ch);

$output=((is_string($result) && 
         (is_object(json_decode($result)) || 
         is_array(json_decode($result))))) ? true : false;


curl_close ($ch);


 
 if($output) // si no está vacio, ha calculado la ruta
 {
    
  
    $af=explode("-",$fecha); 
    $ah=explode(":",$hora);   
    $fecha = $af[1].'/'.$af[2].'/'.$af[0]; 
     
    $ruta=new Rutas();
    // grabamos ruta
    
    $idRuta=$ruta->add($fecha,$hora,$idUser);
    $ut=new Ut();    
    $salida =json_decode($result); 
    $salida = $salida -> routes;
    foreach($salida as $k=>$v) 
    {
       $idt = $v -> vehicle -> id;
 
       $recorrido = $v -> instructions;
       
   
       $ut->get($idt);
        $costeT=floatval($ut->getCosteXkm());
        $pasos=array();
        $tramos=array();
        $tramo=array();                       
        $k=0;                      
        $num=count($recorrido); 
        $hora_partida=mktime($ah[0],$ah[1],0,$af[1],$af[2],$af[0]);
        $horaTramo=$hora_partida; // hora en mktime 
      
        
             
              
      
                   // almacenamos trayecto     
                   $idty=$ruta->addTrayecto($idt); // id del trayecto recien creado
                   $tramos = $v -> ways;

                  // Guardamos en base de datos los distintos tramos
                    foreach($tramos as $kt=>$vt) // cada tramo
                    {
                        
                        $inicio = $vt -> origin;
                        $fin = $vt -> target;
                        $time = $vt -> time;
                        $dist = ($vt -> distance)/1000;
                       /* $times = getTime($time, -1, -1, -1);
                        $timea = explode(':', $times);*/
                        //$time = mktime($timea[0] +$ah[0], $timea[1]+ $ah[1], $timea[2], $af[1], $af[2], $af[0]);
                       
                        $horaTramo += $time/1000;
                       
                        $coste=($v -> vehicle -> costPerDistance) * $dist;
                       
                        
                        $txt_pasos=json_encode($vt -> geometry -> coordinates);
                                              
                        $ruta->addTramo($inicio,$fin,$coste,$horaTramo,$dist,$txt_pasos);                        
                   }

  
    }

    
         
    
    $outData = $result;
 }
 else
 {
   Errores::g()->add('No se ha podido calcular la ruta');        
 }
 
 

if( Errores::g()->num()!=0)  
{
   $errores=implode("<br><br>",Errores::g()->get());    
   echo "{success: false, errores: { razon: ' " . utf8_encode($errores) . "' }}";
}
else
{
   
   echo "{success: true,datos:" . $outData  . ", idRuta: ".$idRuta."}";
}

/*function getTime($time, $hour, $minute, $second){
    if($hour == -1 || $minute == -1 || $second == -1){
        $h = explode('.', $time)[0];
        if($hour == -1){
            $hour = $h;
        }
        else if($minute == -1){
            $minute = $h;
        }
        else if($second == -1){
            $second = $h;
        }
        if ($h > 0){
            $time -= $h;
        }
        $m = $time * 60;
        $tramoTime = getTime($m, $hour, $minute, $second);
    }
    else{
        
        $tramoTime = $hour.':'.$minute.':'.$second;
        
       
    }
    
    return $tramoTime;
}*/

?>
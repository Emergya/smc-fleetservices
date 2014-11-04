<?php

header("Content-Type: application/json");

session_start();
ini_set("soap.wsdl_cache_enabled", 0);
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

$datos=json_decode($HTTP_RAW_POST_DATA,true);
$fecha=$datos[0]; // La fecha de inicio en formato (d/m/Y)
$hora=$datos[1].":00"; // La hora de inicio(hh:ss)
$inicios_fines=array(); // array temporal para guardar las estaciones de inicio y fin
$transporte=0;
$inicioEstacion=0;
$finEstacion=0;
$estaciones="";
if(count($datos[2]))
{
    foreach($datos[2] as $k=>$v)
    {
        $transporte=$v['id_transportes'];
        $inicioEstacion=intval($v['estacionInicio']);
        $finEstacion=intval($v['estacionFin']);        
        break;   // solo el primer transporte sin estar activo           
    } 
}   

//$estaciones.=$inicioEstacion . ",";

if(count($datos[3]))
{
     foreach($datos[3] as $k1=>$v1)
     {
         $ide=intval($v1['id_estaciones']);
         if(($ide!=$inicioEstacion)&&($ide!=$finEstacion)) 
         {
             $estaciones.=$ide . ",";
         }                 
     }     
}  
$estaciones=$inicioEstacion . "," . $estaciones . $finEstacion;
$param=$fecha . "," . $hora . "," . $transporte . "," . $estaciones; // parametros a pasar como string
/*----LLAMADA AL WEBSERVICE ----- */

// enviamos al web service
//$servicio="http://10.35.1.69:8080/webservice/services/tspRoute?wsdl"; //url del servicio local pc de antonio
$servicio="http://gofre:8080/webservice/services/tspRoute?wsdl"; //url del servicio local pc de antonio
try // probamos el servicio web
{
    $client = new SoapClient($servicio);
    //$param="01/01/1900,22:22:00,25,91,92,93,94,95,96,97,98";
    $salWs=$client->hello(array("arg0"=>$param));
    /*  salida del webservice */
    
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
        $tiempo=$tmp[3]; // en milisegundos
        $distancia=$tmp[4]; // en metros
        $res['tiempo']=floatval($tiempo/1000); // pasamos a segundos       
        $res['distancia']=floatval($distancia/1000); // pasamos a km
        $respuesta[]=$res;
    }
     
     $salida1=array($transporte,$respuesta); 
     $salidaWS=array($salida1);
}
catch(Exception $e)
{
    $salidaWS=array();
}


/* FIN DE ENTRADA DE DATOS*/  






/* SALIDA al Extjs */



// Funcion para mapear el xml devuelto por el webservice a array asociativo
// $array=Util::obj2array($obj);
// ó Util::xml2array($obj) o Util::xmltojson


/*
// simulacion devolucion del WS
// DATOS DE SIMULACION 
    // Datos de paso y estaciones incluye inicio y fin(para sacar coste y demas datos)
    // el primero es el inicio y el ultimo es la estacion de fin
    $respuesta0=array();
    $respuesta0['lat']="1";
    $respuesta0['lon']="2";
    $respuesta0['idEstacion']="366";
    $respuesta0['tiempo']="";
    $respuesta0['distancia']="";
    $respuesta=array();
    $respuesta['lat']="1";
    $respuesta['lon']="2";
    $respuesta['idEstacion']="";
    $respuesta['tiempo']="";
    $respuesta['distancia']="";
    $respuesta1=array();
    $respuesta1['lat']="3";
    $respuesta1['lon']="4";
    $respuesta1['idEstacion']="";
    $respuesta1['tiempo']="";
    $respuesta1['distancia']="";
    $respuesta2=array();
    $respuesta2['lat']="5";
    $respuesta2['lon']="6";
    $respuesta2['idEstacion']="367";
    $respuesta2['tiempo']="5000";
    $respuesta2['distancia']="11.5";
    $respuesta3=array();
    $respuesta3['lat']="7";
    $respuesta3['lon']="8";
    $respuesta3['idEstacion']="";
    $respuesta3['tiempo']="";
    $respuesta3['distancia']="";
    $respuesta4=array();
    $respuesta4['lat']="9";
    $respuesta4['lon']="10";
    $respuesta4['idEstacion']="368";
    $respuesta4['tiempo']="10000";
    $respuesta4['distancia']="21.5";
    
    $respuesta5=array();
    $respuesta5['lat']="11";
    $respuesta5['lon']="12";
    $respuesta5['idEstacion']="369";
    $respuesta5['tiempo']="10000";
    $respuesta5['distancia']="53.5";
    
    
    
    $respuesta6=array();
    $respuesta6['lat']="13";
    $respuesta6['lon']="14";
    $respuesta6['idEstacion']="367";
    $respuesta6['tiempo']="";
    $respuesta6['distancia']="";
    $respuesta7=array();
    $respuesta7['lat']="15";
    $respuesta7['lon']="16";
    $respuesta7['idEstacion']="366";
    $respuesta7['tiempo']="1254";
    $respuesta7['distancia']="1.5";
    $respuesta8=array();
    $respuesta8['lat']="17";
    $respuesta8['lon']="18";
    $respuesta8['idEstacion']="";
    $respuesta8['tiempo']="";
    $respuesta8['distancia']="";
    $respuesta9=array();
    $respuesta9['lat']="19";
    $respuesta9['lon']="20";
    $respuesta9['idEstacion']="369";
    $respuesta9['tiempo']="214";
    $respuesta9['distancia']="2.5";
    $respuesta10=array();
    $respuesta10['lat']="19";
    $respuesta10['lon']="20";
    $respuesta10['idEstacion']="";
    $respuesta10['tiempo']="214";
    $respuesta10['distancia']="22.5";
    $respuesta11=array();
    $respuesta11['lat']="19";
    $respuesta11['lon']="20";
    $respuesta11['idEstacion']="368";
    $respuesta11['tiempo']="214";
    $respuesta11['distancia']="62.5";
    
    
    
    // seguimos simulacion
    $respuestas1=array($respuesta0,$respuesta,$respuesta1,$respuesta2,$respuesta3,$respuesta4,$respuesta5);
    $respuestas2=array($respuesta6,$respuesta7,$respuesta8,$respuesta9,$respuesta10,$respuesta11);
    
    $respuesta_transporte1=423; // id del transporte
    $respuesta_transporte2=419; // id del transporte,mTSP  
    
    
    $salida1=array($respuesta_transporte1,$respuestas1);
    $salida2=array($respuesta_transporte2,$respuestas2);
    $salidaWS=array($salida1,$salida2);
    
    */
 // FIN DATOS SIMULACION,se obtiene el salidaWS desde el WS
 
 // PASAMOS A HACERLO PERSISTENTE, en caso de no poder solucionarse se debe recibir array vacio
 if(count($salidaWS)>0) // si no está vacio, ha calculado la ruta
 {
    
    // PERSISTENCIA
    // se pasa hora, fecha,
    // array de trayectos[id_transportes]=array(tramos) donde tramos es:
    // tramos=array[](coste,hora,distancia,pasos) donde pasos es:
    // pasos=array[](lat1,lon1);
    $af=explode("/",$fecha); 
    $ah=explode(":",$hora);   
      
    
    $ruta=new Rutas();
    // grabamos ruta
    
    $idRuta=$ruta->add($fecha, $hora,$idUser);
    $ut=new Ut();          
    foreach($salidaWS as $k=>$v) 
    {
        // grabamos ruta en base de datos
             
        $idt=$v[0];        
        $recorrido=$v[1]; // array con cada pasos               
        $ut->get($idt);
        $costeT=floatval($ut->getCosteXkm());
        $pasos=array();
        $tramos=array();
        $tramo=array();                       
        $k=0;                      
        $num=count($recorrido); 
        $hora_partida=mktime($ah[0],$ah[1],0,$af[1],$af[0],$af[2]);
        $horaTramo=$hora_partida; // hora en mktime          
        foreach($recorrido as $k1=>$v1) // por cada trayecto de cada transporte
        {
                
                if($k==0) // si es el primero 
                {
                    $tramo['inicio']=$v1['idEstacion'];                    
                }
                else // el resto
                {
                   
                    $lat=$v1['lat'];
                    $lon=$v1['lon'];
                    $ide=$v1['idEstacion'];
                 
                
                    // calculamos datos de cada tramo                
                
                    if(($ide=="")||($ide==0)) // solo de paso
                    {
                        $pasos[]=$lat . "," . $lon;
                    }
                    else // es estacion, finalizamos tramo
                    {                                            
                        $tiempo=$v1['tiempo']; // solo para estaciones
                        $distancia=$v1['distancia']; // solo para estaciones                                            
                        $horaTramo+=$tiempo;
                         
                        $tramo['fin']=$ide;
                        $tramo['distancia']=$distancia;
                        $tramo['hora']=$horaTramo;
                        $tramo['coste']=floatval($costeT*$distancia); // suponiendo que son km
                        $tramo['pasos']=$pasos; // incluye estacion fin de tramo                    
                        $tramos[]=$tramo;
                       
                          
                       // restablecemos variable tramo
                        $tramo=array();
                        $tramo['inicio']=$ide;                                              
                        
                        $pasos=array();
                              
                    }
                     
                }
                $k++;
                  
        }
        
      /* FOR TEST
        
             foreach($tramos as $ktt=>$vtt)
                  {
                      echo $vtt['inicio'] . "->" . $vtt['fin'] . " pasos: "  ;
                      echo implode(";",$vtt['pasos']); 
                      //echo " distancia: " . $vtt['distancia'];
                      //echo " coste: " . $vtt['coste'] . "e";
                      echo "--> hora: " . date("d/m/Y H:i",$vtt['hora']) . "h";
                      
                      echo "<br>";                      
                  }
      END FOR TEST */
                   // almacenamos trayecto     
                    $idty=$ruta->addTrayecto($idt); // id del trayecto recien creado
                
                  // Guardamos en base de datos los distintos tramos
                    foreach($tramos as $kt=>$vt) // cada tramo
                    {
                        $inicio=$vt['inicio'];
                        $fin=$vt['fin'];
                        $coste=$vt['coste'];
                        $hora=$vt['hora'];
                        $dist=$vt['distancia'];
                        $txt_pasos="";
                        if(count($vt['pasos']>0)) $txt_pasos=implode(";",$vt['pasos']);                         
                        $ruta->addTramo($inicio,$fin,$coste,$hora,$dist,$txt_pasos);                        
                    }
        
        
       
                
       // limpiamos todo para un nuevo transporte(mTSP)
        $pasos=array();
        $tramo=array();
        $tramos=array(); 
        
     //   exit; // quitar despues       
        
    }

    
         
    
     // ADAPTAMOS SALIDA AL EXTS(con nombre de transportes y nombres de estaciones)
     // Lo recogemos de la base de datos para ser reutilizable para busquedas
     // de rutas
     
     // $idRuta; es el id de la ruta recien creada
          
    
    $datos1=$ruta->getDatos($idRuta,$idUser);    
    $resultado=array();
            
   // $resultado['success']=true;
    $resultado['count']=count($datos1); // numero de resultados
    $resultado['datos']=$datos1;
    
    $salida=json_encode($resultado);
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
   echo "{success: true,datos:" . $salida  . "}";
}

?>
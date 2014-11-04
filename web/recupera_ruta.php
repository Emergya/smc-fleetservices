<?php
session_start();
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

// Función para reemplazar nombres de keys de los arrays( parametro para el webservice )
//Util::array_change_key($array, $old_key, $new_key);




//echo $HTTP_RAW_POST_DATA // contiene el json que se envia desde extjs
// json_decode($HTTP_RAW_POST_DATA); // lo pasamos a array(2) para trabajar con ello, el primero es
// de transportes(en tsp solo 1) y el segundo indice es el array de objetos estaciones
// Para el servicio web mandar los arrays en el orden del webservice

if(!isset($_POST['id_ruta']))
{
    Errores::g()->add('No se ha seleccionado una ruta');   
}
else 
{
  	    $id_ruta=$_POST['id_ruta'];
        $ruta=new Rutas();        
        $datos1=$ruta->getDatos($id_ruta,$idUser);    
        $resultado=array();
                
       // $resultado['success']=true;
        $resultado['count']=count($datos1); // numero de resultados
        $resultado['datos']=$datos1;
        
        $salida=json_encode($resultado);
     
    
} // end del else del si existe variable post id_ruta

 
 

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
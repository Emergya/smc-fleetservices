<?php
session_start();
require_once("inc/Errores.php");
require_once("inc/Util.php");
require_once("inc/Bd.php");
require_once("inc/Usuario.php");
require_once("inc/Estaciones.php");


// Truncar
function truncar($datos)
{
    // Eliminamos todas las estaciones actuales
    $idUser=$_SESSION['IDUSER']; 
    $es=new Estaciones();
    $res=$es->getAll($idUser); // retoma todos los id de las estaciones
    if(count($res)>0)
    {
        $temp=array();
        foreach($res as $k=>$v) $temp[]=$v['id_estaciones'];
        $es->delete($temp);
    }
    // Se importa los datos    
    foreach($datos as $k=>$v)
    {
        $nombre=$v['nombre'];
        $direccion=$v['direccion'];
        $lat= $v['lat'];
        $lon= $v['lon'];
        
        if(strtolower($v['activo'])=='si') $activo="on";
        else $activo="off";
              
        $dat=array('nombre'=>$nombre,'lat'=>$lat,'lon'=>$lon,'direccion'=>$direccion,'activo'=>$activo,'idUser'=>$idUser);
        $es->add($dat);
    }
}

// Actualizar las existentes y guardar las nuevas
function actualizar($datos)
{
                      
    if(count($datos)>0)
    {
        
        $idUser=$_SESSION['IDUSER']; 
        $es=new Estaciones();
        $res=$es->getAll($idUser); // retoma todos los id y nombre de las estaciones
        $nombres=array();
        if(count($res)>0)
        {
            foreach($res as $k=>$v)
            {
                
               $ide=$v['id_estaciones'];  
               $nombres[$ide]=strtolower($v['nombre']);  
            }
        }
        
        // $nombres contiene los nombres de las estaciones no borradas en el sistema
        foreach($datos as $k=>$v)
        {
            
            // recogemos datos del csv 
            $nombre=strtolower($v['nombre']);
            $direccion=$v['direccion'];
            $lat= $v['lat'];
            $lon= $v['lon'];        
            if(strtolower($v['activo'])=='si') $activo="on";
            else $activo="off";            
           
             
            if(in_array($nombre, $nombres)) // ya existe la estacion, a actualizar
            {                   
                 $id=array_search($nombre, $nombres);                                
                 $datosM=array('nombre'=>$nombre,'direccion'=>$direccion,'lat'=>$lat,'lon'=>$lon,'activo'=>$activo,'idUser'=>$idUser);                    
                 $es->edit($id,$datosM);    
            }
            else // no existe, a crear
            {
                $datosM=array('nombre'=>$nombre,'lat'=>$lat,'lon'=>$lon,'direccion'=>$direccion,'activo'=>$activo,'idUser'=>$idUser);
                $es->add($datosM);     
            }
        }
    }
    // sacamos todos los nombres de las estaciones registradas y no borradas
}


if(!isset($_SESSION['IDUSER']))
{ 
    echo "{success: false, errores: { razon: 'false' }}";
    exit;
}
 
   foreach($_POST as $k=>$v)     $$k=trim(strip_tags($v));
     
   $idUser=$_SESSION['IDUSER'];
   $modo=$_POST['modoEs']; // "truncar" o "actualizar" es lo que devuelve
   $sep=$_POST['sep']; // caracter de separacion en el csv, devuelve el caracter(, o ;)
   $pfila=$_POST['pfila']; // saltarse o no la primera fila, devuelve on si esta activo y nada si esta inactivo
   
   if($pfila=='on') $pfila=true;
   else $pfila=false;    
    
   
   $nombref= $_FILES['fCsv']['name'];
   $tamanho=$_FILES['fCsv']['size'];
   $ext=$_FILES['fCsv']['type']; // text/csv
   
   $salida=array(); // Array de salida con datos importados
   if($ext!="text/csv") Errores::g()->add('El fichero no es archivo csv');
   else 
   {      
       if($nombref!="")
       {
            $destino="upload/" . time() . "_" . $nombref;
            chmod($destino, "777");
            //$sep="/";
            if (copy($_FILES['fCsv']['tmp_name'],$destino)) 
            {
               // estructura csv de estaciones  nombre/activo/direccion
               // la latitud y longuitud se extrae automáticamente de la direccion
               // COMPROBACION DE LA VALIDEZ DEL FICHERO CSV (En estructura y que no falte datos)
     
              if (($gestor = fopen($destino, "r")) !== FALSE) 
              {
                    // limpiamos la filas en blanco
                    
                    $text = "";
                    while (!feof($gestor)) {
                        $txt = trim(fgets($gestor));
                        if(!empty($txt)){
                            $text .= $txt."\n";
                        }
                    }
                    fclose($gestor);
              }
              else Errores::g()->add("No se puede abrir el fichero"); 
              
              if(($text!="")&&(Errores::g()->num()==0))  
              {
                   
                    $fila=1;      
                    $arrayFilas=str_getcsv($text,"\n");
                    if(count($arrayFilas)>0)
                    {            
                      foreach($arrayFilas as $k=>$v) // cada fila. $v contiene array cn campos 
                      {
                         $columnas=str_getcsv($v,$sep);// array con los valores d campos 
                         $numero=count($columnas);// nº de columnas    
                        // se elimina la primera fila( nombre de campos)
                        if($pfila)
                        {
                            // se elimina la primera fila( nombre de campos)                       
                           $fila++;
                           $pfila=false;  
                           continue;
                        }
                    
                        if($numero>2) //minimo son 3 col (nombre,actividad,direccion) 
                        {
                               
                            $nom=trim($columnas[0]); // nombre
                            $act=trim($columnas[1]); // actividad
                            $dir=trim($columnas[2]); // direccion
                            
                            if(($nom=="")||($act=="")||($dir=="")) 
                            {
                                Errores::g()->add('Faltan datos en la fila nº ' . $fila);
                                break;
                            }
                            if((strtolower($act)!="si")&&(strtolower($act)!="no")) 
                            {
                                Errores::g()->add("Incorrecto valor en columna \"Activo\" en la fila nº $fila");
                                break;
                            }
                            // comprobamos que las direcciones son reales
                            $resGeo=Util::geocode_address($dir);
                            
                            if($resGeo['status']!="OK")
                            {
                                Errores::g()->add("No se puede localizar la dirección de la fila " . $fila);
                                break;
                            }
                            // Todo ok
                            $temp=array();
                            $temp['nombre']=$nom; // nombre
                            $temp['activo']=$act; // actividad
                            $temp['direccion']=$dir; // direccion
                            $temp['lat']=$resGeo['latitude']; // latitud
                            $temp['lon']=$resGeo['longitude']; // longuitud                                                                                        
                            $salida[]=$temp;
                            // en $salida se va teniendo las nuevas estaciones                            
                            
                        }
                        else
                        {
                           Errores::g()->add('El archivo csv no tiene el formato adecuado');
                           break;     
                        }                          
                        $fila++;                        
                      } // end del foreach
                   } // end if count salida csv
                   else  Errores::g()->add('El archivo csv está vacio');                           
                    
                    
                } 
               
            }
           
             
         
       } 
       else Errores::g()->add('Se debe seleccionar un fichero csv');
   }
   
   // Se empieza la importación
   if( Errores::g()->num()==0)  
   {
       if(count($salida)>0)
       {
        if($modo=="truncar") truncar($salida);
        else actualizar($salida);
       }
       else   Errores::g()->add('El archivo csv no tiene contenido');
   }
   
         


// Se cierra la conexion al fichero y se borra el fichero csv recien subido
fclose($gestor);
unlink($destino);
// cuando hay errores 
if( Errores::g()->num()!=0)  
{
   $errores=implode("<br><br>",Errores::g()->get());    
   echo "{success: false, errores: { razon: '" . $errores . "' }}";
}
else
{
   echo "{success: true}";
}

?>

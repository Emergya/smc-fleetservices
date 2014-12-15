<?php
session_start();
require_once("inc/Errores.php");
require_once("inc/Util.php");
require_once("inc/Bd.php");
require_once("inc/Usuario.php");
require_once("inc/Estaciones.php");
require_once("inc/Ut.php");


function truncar($datos)
{
    // Eliminamos todas las estaciones actuales
    $idUser=$_SESSION['IDUSER']; 
    $ut=new Ut();
    $res=$ut->getAll($idUser); // retoma todos los id de los transportes
    if(count($res)>0)
    {
        $temp=array();
        foreach($res as $k=>$v) $temp[]=$v['id_transportes'];
        $ut->delete($temp);
    }
    // Se importa los datos    
    foreach($datos as $k=>$v)
    {
        $nombre=$v['nombre'];
        $inicio=$v['inicio'];
        $fin= $v['fin'];
        $coste_x_dia= $v['coste_x_dia'];
        $coste_x_km= $v['coste_x_km'];
        $tonelaje= $v['tonelaje'];
        $tipo= $v['tipo'];
        $norma= $v['norma'];
        
        if(strtolower($v['activo'])=='si') $activo="on";
        else $activo="off";
              
        $dat=array('nombre'=>$nombre,'estacionInicio'=>$inicio,'estacionFin'=>$fin,'costeXkm'=>$coste_x_km,'costeXdia'=>$coste_x_dia,'activo'=>$activo, 'tipo'=>$tipo, 'tonelaje'=>$tonelaje, 'norma'=>$norma,'idUser'=>$idUser);
        $ut->add($dat);
    }
}

// funcion par actualizar
function actualizar($datos)
{
    if(count($datos)>0)
    {
        
        $idUser=$_SESSION['IDUSER']; 
        $ut=new Ut();
        $res=$ut->getAll($idUser); // retoma todos los id y nombre de transportes
        $nombres=array();
        if(count($res)>0)
        {
            foreach($res as $k=>$v)
            {
                
               $ide=$v['id_transportes'];  
               $nombres[$ide]=strtolower($v['nombre']);  
            }
        }
        
        // $nombres contiene los nombres de los transportes no borrados en el sistema
        foreach($datos as $k=>$v)
        {
            
            // recogemos datos del csv 
            $nombre=strtolower($v['nombre']);
            $inicio=$v['inicio'];
            $fin= $v['fin'];
            $coste_x_dia= $v['coste_x_dia'];
            $coste_x_km= $v['coste_x_km'];
            $tonelaje= $v['tonelaje'];
            $tipo= $v['tipo'];
             $norma= $v['norma'];
                    
            if(strtolower($v['activo'])=='si') $activo="on";
            else $activo="off";            
           
             
            if(in_array($nombre, $nombres)) // ya existe la estacion, a actualizar
            {                   
                 $id=array_search($nombre, $nombres);                                
                 $datosM=array('nombre'=>$nombre,'estacionInicio'=>$inicio,'estacionFin'=>$fin,'costeXkm'=>$coste_x_km,'costeXdia'=>$coste_x_dia,'activo'=>$activo,'tipo'=>$tipo, 'tonelaje'=>$tonelaje, 'norma'=>$norma,'idUser'=>$idUser);                    
                 $ut->edit($id,$datosM);    
            }
            else // no existe, a crear
            {
                $datosM=array('nombre'=>$nombre,'estacionInicio'=>$inicio,'estacionFin'=>$fin,'costeXkm'=>$coste_x_km,'costeXdia'=>$coste_x_dia,'activo'=>$activo,'tipo'=>$tipo, 'tonelaje'=>$tonelaje, 'norma'=>$norma,'idUser'=>$idUser);
                $ut->add($datosM);     
            }
        }
    }
}

if(!isset($_SESSION['IDUSER'])) 
{
    echo "{success: false, errores: { razon: 'false' }}";
    exit;
}


   foreach($_POST as $k=>$v)     $$k=trim(strip_tags($v)); 
   $idUser=$_SESSION['IDUSER'];
   $modo=$_POST['modoUt']; // "truncar" o "actualizar" es lo que devuelve
   $sep=$_POST['sepUt']; // caracter de separacion en el csv, devuelve el caracter(, o ;)
   $pfila=$_POST['pfilaUt']; // saltarse o no la primera fila, devuelve on si esta activo y nada si esta inactivo
   
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
          //  $sep="/";
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
                  
                  // En $text se tiene el contenido del csv sin lineas vacias 
                  // Utilizamos esta variables en vez de ir estar leyendo del fichero     
                  if(($text!="")&&(Errores::g()->num()==0))  
                  {
                  
                      // Conseguimos los datos de las estaciones para las comprobaciones
                    
                       $es=new Estaciones();
                       $res=$es->getAll($idUser); // retoma todos los id y nombre de las estaciones
                             
                       $nombres=array();
                       $actividad=array();
                       if(count($res)>0)
                         {
                            foreach($res as $k=>$v)
                              {                                    
                                 $ide=$v['id_estaciones'];  
                                  $nombres[$ide]=strtolower($v['nombre']);
                                  $actividad[$ide]=strtolower($v['activo']);  
                               }
                          }
                                  
                        $fila=1;      
                        $arrayFilas=str_getcsv($text,"\n");
                        if(count($arrayFilas)>0)
                         {            
                              foreach($arrayFilas as $k=>$v) // cada fila. $v contiene array cn campos 
                              {
                                 $columnas=str_getcsv($v,$sep);// array con los valores d campos 
                                 $numero=count($columnas);// nº de columnas    
                                      
                                if($pfila)
                                {
                                    // se elimina la primera fila( nombre de campos)                       
                                   $fila++;
                                   $pfila=false;  
                                   continue;
                                }
                                        
                                if($numero>5) //minimo son 6 col (nombre/activo/inicio/fin/coste_x_dia/coste_x_km) 
                                {
                                    
                                    
                                       
                                    $nom=trim($columnas[0]); // nombre
                                    $act=strtolower(trim($columnas[1])); // actividad
                                    $inicio=trim(strtolower($columnas[2])); // nombre estacion inicio
                                    $fin=trim(strtolower($columnas[3])); // nombre estacion fin
                                    $coste_x_dia=trim($columnas[4]); // coste_x_dia
                                    $coste_x_km=trim($columnas[5]); // coste_x_km
                                    
                                    
                                    
                                 
                                    if(($nom=="")||($act=="")||($inicio=="")||($fin=="")||($tipo=="")||$norma=="") 
                                    {
                                        Errores::g()->add('Faltan datos en la fila nº ' . $fila);
                                        break;
                                    }
                                    if(!is_numeric($coste_x_dia)) 
                                    {
                                        Errores::g()->add('Debe especificar el coste al dia en la fila nº ' . $fila);
                                        break;
                                    }
                                    
                                    if(!is_numeric($coste_x_km)) 
                                    {
                                        Errores::g()->add('Debe especificar el coste por kilómetro en la fila nº' + $fila);
                                        break;
                                    }
                                     if(!is_numeric($tonaleje)) 
                                    {
                                        Errores::g()->add('Debe especificar el tonelaje del vehículo en la fila nº' + $fila);
                                        break;
                                    }
                                    if((strtolower($act)!="si")&&(strtolower($act)!="no")) 
                                    {
                                        Errores::g()->add("Incorrecto valor en columna \"Activo\" en la fila nº $fila");
                                        break;
                                    }
                                    // comprobamos que las estaciones de inicio y de fin existen y estan activas                            
                                    if(!in_array($inicio, $nombres))
                                    {
                                        Errores::g()->add("Estación " . $inicio . " no encontrada ");
                                        break;
                                    }
                                    if(!in_array($fin, $nombres))
                                    {
                                        Errores::g()->add("Estación " . $fin . " no encontrada ");
                                        break;
                                    }
                                    // todo ok, conseguimos los id de las estaciones y la actividad segun estaciones
                                    $id_inicio=array_search($inicio, $nombres);
                                    $id_fin=array_search($fin, $nombres);                                            
                                    
                                    // Todo ok
                                    $temp=array();
                                    $temp['nombre']=$nom; // nombre
                                    $temp['activo']=$act; // actividad
                                    $temp['inicio']=$id_inicio; // direccion
                                    $temp['fin']=$id_fin; // latitud
                                    $temp['coste_x_dia']=$coste_x_dia; // longuitud
                                    $temp['coste_x_km']=$coste_x_km; // longuitud
                                    $temp['tonelaje'] = $tonelaje;
                                    $temp['tipo'] = $tipo;
                                    $temp['norma'] = $norma;
                                                                                                                            
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

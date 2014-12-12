<? 
// Clase perteneciente a las Unidades de transporte
class Ut {
   
    private $id=0;
    private $nombre = "";
    private $estacionInicio =0; // id de estacion de inicio   
    private $estacionFin = 0; // id de estacion de fin
    private $id_usuario = 0; // id del usuario de la unidad de transporte
    private $activo=false;
    private $costeXkm=0.0;
    private $costeXdia=0.0; 
    private $tipo = "";
    private $tonelaje = 0.0; 
    private $norma = "";
   
	private $bd; // Conexion a base de datos
	
	function __construct()
	{
	    $this->bd=Bd::getInstancia();
		$this->bd->conectar();
	}
	
    function getNombre()
    {
        return $this->nombre;
    }
    
    function getActivo()
    {
        return $this->activo;
    }
    function getCosteXkm()
    {
        return $this->costeXkm;
    }
    function getCosteXdia()
    {
        return $this->costeXdia;
    }

     function getTipo()
    {
        return $this->tipo;
    }

     function getTonelaje()
    {
        return $this->tonelaje;
    }
    
    function getId()
    {
        return $this->id;
    }

	
	// Carga un nuevo objeto transporte desde la base de datos
	
	public  function get($id=0)
	{	 
	  if($id!=0)
	  {	   
	     $c="select * from transportes where id_transportes=$id limit 1";
         
		 $this->bd->put($c);
         
		 if($this->bd->num()>0)
		 {
		     
		     $res=$this->bd->get();
			 $this->nombre=$res[0]['nombre'];
			 $this->estacionInicio=$res[0]['estacion_inicio'];
			 $this->estacionFin=$res[0]['estacion_fin'];
             $this->id_usuario=$res[0]['id_usuario'];
             $this->costeXkm=$res[0]['coste_x_km'];
             $this->costeXdia=$res[0]['coste_x_dia'];
             $this->id=$res[0]['id_transportes'];        
             $this->activo=$res[0]['activo']; 
             $this->tipo=$res[0]['tipo']; 
             $this->tonelaje=$res[0]['tonelaje']; 
             $this->norma=$res[0]['norma'];                                                 			
             return $this;
               
             			 
		 }	
		 else 
		 {
		      Errores::g()->add('No existe esta unidad de transporte');
              return false; 
		 }
           
           
	  }
      else
      {
               Errores::g()->add('No existe esta unidad de transporte');
               return true;
      } 
	     
	}

	
   // Añadir transporte a la bd   
   function add($datos=array())
	{

		 foreach($datos as $k=>$v)          
		 {
		     
		     $$k=pg_escape_string(trim(strip_tags($v)));
             $datos[$k]=$$k; // para el json devuelto
         }
         
	    // comprobaciones
	    if(count($datos)!=10) 
		{
		    Errores::g()->add('Falta algún dato que indicar');
			return false; 
		}
		
		if($nombre=="")  
		{
		    Errores::g()->add('Falta indicar el nombre');
			return false;
		}
		
		if(($estacionInicio=="")||($estacionInicio==0)) 
		{
		    Errores::g()->add('Falta indicar la Estación de Inicio');
			return false;
		 }
        if(($estacionFin=="")||($estacionFin==0)) 
        {
            Errores::g()->add('Falta indicar la Estación de Fin');
            return false;
         }

          if($tipo=="")  
        {
            Errores::g()->add('Falta indicar el tipo de vehículo');
            return false;
         }

           if($norma=="")  
        {
            Errores::g()->add('Falta indicar la antigüedad del vehículo');
            return false;
         }
        
			
		
		if(!is_numeric($costeXdia)) 
		{
		    Errores::g()->add('Debe especificar el coste al dia');
			return false;
		}
        
        if(!is_numeric($costeXkm)) 
        {
            Errores::g()->add('Debe especificar el coste por kilómetro');
            return false;
        }

         if(!is_numeric($tonelaje)) 
        {
            Errores::g()->add('Debe especificar el tonelaje del vehículo');
            return false;
        }
		
		if(($idUser=="")||($idUser==0)) 
		{		 
		    Errores::g()->add('Fallo de autentificación');
			return false;
		}
        
	    if(Errores::g()->num()==0)
        {
            $nombre=strtolower($nombre); // para comparar en base de datos y registrar 	
    		// comprobamos que no existe un usuario ya registrado con mismo email 
    		$c="select id_transportes from transportes where nombre='$nombre' ";
            $c.=" and borrado='FALSE' and id_usuario=$idUser limit 1";				
    		if($this->bd->put($c))
    		{
    
    		    if($this->bd->num()!=0)
    			{
    			    
    			    $s="El transporte con nombre " . $nombre . " ya existe";
    		        Errores::g()->add($s);
                    return false;
    			}
       		    else
    			 {
    
    			      // registro
    				 if($activo=="on") $activo="true";
                     else $activo="false";
    				 $c="INSERT INTO transportes (nombre,estacion_inicio,estacion_fin,id_usuario,";
    				 $c.="activo,coste_x_km,coste_x_dia, tipo, tonelaje, norma) VALUES ";
    				 $c.="('$nombre',$estacionInicio,$estacionFin,$idUser,";
    				 $c.="$activo,$costeXkm,$costeXdia,'$tipo',$tonelaje, '$norma');";    
                    // Errores::g()->add($c);           
    				 $this->bd->put($c);
                     $this->id=$this->bd->uid('id_transportes','transportes');                     
                     // retomamos el json
                      $datos['id_transportes']=$this->id;		 
                      $info = array(  
                                'success'=>true, 
                                'count'=>1, 
                                'data'=> array($datos)  
                             ); 
        
    				  return json_encode($info);
                     		
    			}
    			
    		}
       }
       return false;
		
	}
   
   // 
   // Editamos un transporte a la bd   ($id es el id del transporte en bd y $datos los datos)
   function edit($id=0,$datos=array())
    {
        if($id==0) return false;
          
         foreach($datos as $k=>$v)          
         {
             
             $$k=pg_escape_string(trim(strip_tags($v)));
             $datos[$k]=$$k; // para el json devuelto
         }
         
        // comprobaciones
        if(count($datos)!=10) 
        {
            Errores::g()->add('Falta algún dato que indicar');
            return false; 
        }
        
        if($nombre=="")  
        {
            Errores::g()->add('Falta indicar el nombre');
            return false;
        }
        
        if(($estacionInicio=="")||($estacionInicio==0)) 
        {
            Errores::g()->add('Falta indicar la Estación de Inicio');
            return false;
         }
        if(($estacionFin=="")||($estacionFin==0)) 
        {
            Errores::g()->add('Falta indicar la Estación de Fin');
            return false;
         }

        if($tipo=="") 
        {
            Errores::g()->add('Falta indicar el tipo de vehículo');
            return false;
         }

            if($norma=="")  
        {
            Errores::g()->add('Falta indicar la antigüedad del vehículo');
            return false;
         }
        
        if(!is_numeric($costeXdia)) 
        {
            Errores::g()->add('Debe especificar el coste al dia');
            return false;
        }
        
        if(!is_numeric($costeXkm)) 
        {
            Errores::g()->add('Debe especificar el coste por kilómetro');
            return false;
        }

         if(!is_numeric($tonelaje)) 
        {
            Errores::g()->add('Debe especificar el tonelaje del vehículo');
            return false;
        }
        
        if(Errores::g()->num()==0)
        {
            $nombre=strtolower($nombre); // para comparar en base de datos y registrar    
            // comprobamos que no existe un transporte ya registrado con mismo nombre 
            $c="select id_transportes from transportes where nombre='$nombre'";
            $c.=" and id_usuario=$idUser and borrado='FALSE' and id_transportes<>$id limit 1";
            if($this->bd->put($c))
            {
    
                if($this->bd->num()!=0)
                {                   
                    $s="El transporte con nombre " . $nombre . " ya está registrado";
                    Errores::g()->add($s);
                }
                else
                 {
    
                      // registro                     
                     if($activo=="on") $activo="true";
                     else $activo="false";
                     
                     $c1="UPDATE transportes SET nombre='$nombre',estacion_inicio=$estacionInicio";
                     $c1.=",estacion_fin=$estacionFin,coste_x_km=$costeXkm";
                     $c1.=",coste_x_dia=$costeXdia ";
                     $c1.=",activo='$activo'";
                     $c1.=",tipo='$tipo'";
                     $c1.=",tonelaje='$tonelaje'";
                     $c1.=",norma='$norma'";
                     $c1.=" WHERE id_transportes=$id";
                     
                // Errores::g()->add($c1);
                // return false;         
                           
                     if($this->bd->put($c1))
                     {
                                          
                     // retomamos el json
                        $info = array(  
                          'success'=>true, 
                          'count'=>1, 
                          'data'=> array($datos)  
                            ); 
                        return json_encode($info);
                            
                     }                     
                
                   }
             }
             
         }
         return false;
    }

    
    // Eliminamos un transporte a la bd   ($id es el id del transporte en bd)
   function delete($id=array())
    {
        if(count($id)==0) return false;
      $ids=implode(",",$id); 
      $c="UPDATE transportes set borrado='TRUE',activo='FALSE' WHERE id_transportes in ($ids)";
      //   Errores::g()->add($c);           
        if($this->bd->put($c))
         {
          $info = array(  
                        'success'=>true, 
                        'count'=>1, 
                        'data'=> array()  
                        ); 
          return json_encode($info);   
         } 
        else return false;
     
    }
    
   // Funcion para recoger todos o solo un transporte($idu es el id del usuario,$id el id del transporte), retoma un json
   function getJson($idu=0,$id=0)
   {
       if($idu==0) return false; // si el user no está logeado
       
       $c="SELECT id_transportes,nombre,estacion_inicio,estacion_fin,coste_x_km,coste_x_dia,activo, tipo, tonelaje, norma";
       $c.=" FROM transportes ";
       $c.=" WHERE id_usuario=$idu and borrado='FALSE' ";
       if($id!=0) $c.=" and id_transportes=$id"; // Para un unico transporte
       $c.=" ORDER BY id_transportes";
       $this->bd->put($c);       
       $res="";
       $total=$this->bd->num();       
       if($total>0)
       {   $data=array();
                   
           $res=$this->bd->get(); // resultados de transportes
           
           
           foreach($res as $k=>$v)
           {
               $temp1=array();
               $temp2=array(); 
               $nEi=0;
               $nEi=0;
               $ci="SELECT nombre from estaciones where id_estaciones=" . $res[$k]['estacion_inicio'];
               $this->bd->put($ci);
               $temp1=$this->bd->get(); // en $temp1[0]['nombre'] tengo el nombre de la estacion de inicio
               $ci2="SELECT nombre from estaciones where id_estaciones=" . $res[$k]['estacion_fin'];
               $this->bd->put($ci2);
               $temp2=$this->bd->get(); // en $temp2[0]['nombre'] tengo el nombre de la estacion de fin
               // recogemos nombres de estaciones
               $nEi=ucfirst($temp1[0]['nombre']);
               $nEf=ucfirst($temp2[0]['nombre']);
               $v['nestacion_inicio']=$nEi;
               $v['nestacion_fin']=$nEf;
               $v['nombre']=ucfirst($v['nombre']);  
               if($v['estacion_inicio']==0) $v['estacion_inicio']='';
               if($v['estacion_fin']==0) $v['estacion_fin']='';
               $data[$k]=$v;               
                 
           }     
           $res=array("sucess"=>true,"count"=>$total,"data"=>$data);
       }
       else
       { 
           $res[0]=array("sucess"=>true,"count"=>0,"data"=>array());      
       }
       return json_encode($res);
   } 


// Funcion para recoger todos los id y nombre de estaciones no borradas en un array 
  function getAll($idu=0)
  {
       if($idu==0) return false;
       
       $c="SELECT id_transportes,nombre,activo";
       $c.=" FROM transportes ";
       $c.=" WHERE id_usuario=$idu and borrado='FALSE' ";
       $this->bd->put($c);
       $total=$this->bd->num();
       $data=array();       
       if($total>0)
       {                      
           $res=$this->bd->get();
           foreach($res as $k=>$v)
           {
               $temp=array();
               $temp['id_transportes']=$v['id_transportes'];
               $temp['nombre']=ucfirst($v['nombre']);   
               $temp['activo']=$v['activo'];                                         
               $data[$k]=$temp;               
                                               
           }     
           
       }
       return $data;       
  }
  

} // end of class
?>

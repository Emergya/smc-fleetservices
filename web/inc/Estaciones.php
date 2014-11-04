<? 
// Clase perteneciente a las Estaciones
class Estaciones {
   
    private $id=0; // id de la estacion
    private $nombre = "";
    private $lat =0; // latitud(coordenada)   
    private $lon = 0; // longuitud(coordenada)
    private $id_usuario = 0; // id del usuario de la estacion
    private $activo=false;
    private $direccion="";
      
   
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
    
    
    function getId()
    {
        return $this->id;
    }
	
    function getLat()
    {
        return $this->lat;
    }
    
    function getLon()
    {
        return $this->lon;
    }
    
	
	// Carga un nuevo objeto transporte desde la base de datos
	
	public function get($id=0)
	{	 
	  if($id!=0)
	  {	   
	     $c="select * from estaciones where id_estaciones=$id limit 1";
         
		 $this->bd->put($c);
         
		 if($this->bd->num()>0)
		 {
		     
		     $res=$this->bd->get();
			 $this->nombre=$res[0]['nombre'];
			 $this->lat=$res[0]['lat'];
			 $this->lon=$res[0]['lon'];
             $this->id_usuario=$res[0]['id_usuario'];
             $this->direccion=$res[0]['direccion'];             
             $this->id=$res[0]['id_estaciones'];        
             $this->activo=$res[0]['activo'];                                                 			
             return $this;
               
             			 
		 }	
		 else 
		 {
		      Errores::g()->add('No existe esta estación');
              return false; 
		 }
           
           
	  }
      else
      {
               Errores::g()->add('No existe esta estación');
               return true;
      } 
	     
	}

	
   // Añadir estación a la bd   
   function add($datos=array())
	{

		 foreach($datos as $k=>$v)          
		 {
		     
		     $$k=pg_escape_string(trim(strip_tags($v)));
             $datos[$k]=$$k; // para el json devuelto
         }
         
         
         
	    // comprobaciones
	    if(count($datos)!=6) 
		{
		    Errores::g()->add('Falta algún dato que indicar');
			return false; 
		}
		
		if($nombre=="")  
		{
		    Errores::g()->add('Falta indicar el nombre');
			return false;
		}
		
		if((($lat=="")||($lat==0)) || (($lon=="")||($lon==0))  ) 
		{
		    Errores::g()->add('Falta indicar las coordenadas(Latitud,Longuitud)');
			return false;
		 }
        if($direccion=="") 
        {
            Errores::g()->add('Falta indicar la Dirección');
            return false;
         }
        
		
		
		if(($idUser=="")||($idUser==0)) 
		{		 
		    Errores::g()->add('Fallo de autentificación');
			return false;
		}
        
	    if(Errores::g()->num()==0)
        {	
    		// comprobamos que no existe un usuario ya registrado con mismo email
    		$nombre=strtolower($nombre); // para comparar en base de datos y registrar 
    		$c="select id_estaciones from estaciones where nombre='$nombre' and id_usuario=$idUser and borrado='FALSE' limit 1";				
    		if($this->bd->put($c))
    		{
    
    		    if($this->bd->num()!=0)
    			{
    			    
    			    $s="La estación con nombre " . $nombre . " ya existe";
    		        Errores::g()->add($s);
                    return false;
    			}
       		    else
    			 {
                          
                        
                        
    			      // registro
    				 if($activo=="on") $activo="true";
                     else $activo="false";
   
                    
    				 $c="INSERT INTO estaciones (nombre,lat,lon,direccion,id_usuario,activo)";
    				 $c.=" VALUES ";
    				 $c.="('$nombre',$lat,$lon,'$direccion',$idUser,$activo)";
                         				 
                   
                     
                                
    				 $this->bd->put($c);
                     $this->id=$this->bd->uid('id_estaciones','estaciones');                     
                     // retomamos el json
                     $datos['id_estaciones']=$this->id;		
                      		 
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
   // Editamos una estación a la bd   ($id es el id de la estacion en bd y $datos los datos)
   function edit($id=0,$datos=array())
    {
        
         if($id==0) return false;
         
         foreach($datos as $k=>$v)          
         {
             
             $$k=pg_escape_string(trim(strip_tags($v)));
             $datos[$k]=$$k; // para el json devuelto
         }
         
        
        // comprobaciones
        if(count($datos)!=6) 
        {
            Errores::g()->add('Falta algún dato que indicar');
            return false; 
        }
        
        if($nombre=="")  
        {
            Errores::g()->add('Falta indicar el nombre');
            return false;
        }
        
        if((($lat=="")||($lat==0)) || (($lon=="")||($lon==0))  ) 
        {
            Errores::g()->add('Falta indicar las coordenadas(Latitud,Longuitud)');
            return false;
         }
        if($direccion=="") 
        {
            Errores::g()->add('Falta indicar la Dirección');
            return false;
         }
        
        
        if(Errores::g()->num()==0)
        {   
            // comprobamos que no existe un transporte ya registrado con mismo nombre 
            $nombre=strtolower($nombre);
            $c="select id_estaciones from estaciones where nombre='$nombre' ";
            $c.=" and id_usuario=$idUser and borrado='FALSE' and id_estaciones<>$id limit 1";         
            
            if($this->bd->put($c))
            {
                //Errores::g()->add($this->bd->num());    
                if($this->bd->num()!=0)
                {
                     // para comparar en base de datos y registrar                    
                    Errores::g()->add("La estación con nombre " . $nombre . " ya existe");   
                    return false;
                }
                else
                 {
                     
                      // registro actividad, 
                     if($activo=="on") $activo="true";
                     else 
                     {
                         $activo="false";
                         // actualizamos los transportes a inactivo si tiene de inicio o fin esta estacion
                         $c0="UPDATE transportes SET activo='$activo'";
                         $c0.=" WHERE estacion_inicio=$id or estacion_fin=$id";
                         $this->bd->put($c0);                           
                     } 
                     
                                          
                     $c1="UPDATE estaciones SET nombre='$nombre',lat=$lat";
                     $c1.=",lon=$lon,direccion='$direccion'";                     
                     $c1.=",activo='$activo'";
                     $c1.=" WHERE id_estaciones=$id";
                     
              //   Errores::g()->add($c1);
              //   return false;         
                           
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

    
    // Eliminamos una estaciona la bd   ($id es el id de la estación en bd)
   function delete($id=array())
    {
      if(count($id)==0) return false;
      $ids=implode(",",$id); 
      $c="UPDATE estaciones set borrado='TRUE',activo='FALSE' WHERE id_estaciones in ($ids)";
        // Errores::g()->add($c);           
        if($this->bd->put($c))
         {
             // Eliminamos los transportes cuyo origen o destino este en estas estaciones
                $c="UPDATE transportes set activo='FALSE' WHERE ";
                   $c.=" estacion_inicio in ($ids) or estacion_fin in ($ids) ";
                // Errores::g()->add($c);           
                if($this->bd->put($c))
                 {
                     $c="UPDATE transportes set estacion_inicio=0 WHERE ";
                         $c.=" estacion_inicio in ($ids) ";
                         $this->bd->put($c);
                         $c="UPDATE transportes set estacion_fin=0 WHERE ";
                         $c.=" estacion_fin in ($ids) ";
                         $this->bd->put($c);
                         
                        $info = array(  
                                'success'=>true, 
                                'count'=>1, 
                                'data'=> array()  
                                ); 
                  return json_encode($info);
            } else return false;
                         
         } 
        else return false;
     
    }
    
  // Funcion para recoger todos o solo un transporte($idu es el id del usuario,$id el id del transporte), retoma un json
   function getJson($idu=0,$id=0)
   {
       if($idu==0) return false; // si el user no está logeado
       
       $c="SELECT id_estaciones,nombre,lat,lon,direccion,activo";
       $c.=" FROM estaciones ";
       $c.=" WHERE id_usuario=$idu and borrado='FALSE' ";
       if($id!=0) $c.=" and id_estaciones=$id"; // Para un unico transporte
       $c.=" ORDER BY id_estaciones";
       $this->bd->put($c);       
       $res="";
       $total=$this->bd->num();       
       if($total>0)
       {   $data=array();
                   
           $res=$this->bd->get();
           foreach($res as $k=>$v)
           {
               $v['nombre']=ucfirst($v['nombre']);              
               $data[$k]=$v;                              
               $res=array("sucess"=>true,"count"=>$total,"data"=>$data);  
           }     
           
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
       
       $c="SELECT id_estaciones,nombre,activo";
       $c.=" FROM estaciones ";
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
               $temp['id_estaciones']=$v['id_estaciones'];
               $temp['nombre']=ucfirst($v['nombre']);  
               $temp['activo']=ucfirst($v['activo']);                           
               $data[$k]=$temp;               
                                               
           }     
           
       }
       return $data;       
  }

} // end of class
?>

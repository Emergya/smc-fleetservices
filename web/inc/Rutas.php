<? 
// Clase perteneciente a las rutas
class Rutas {
   
    private $id=0; // id de la ruta
    private $fecha = ""; // fecha
    private $hora =""; // hora       
    private $trayecto =0; // id de un trayecto en la ruta
    private $tramo =0; // id de un tramo de un trayecto de una ruta
    private $id_usuario = 0; // id del usuario de la estacion
    
    
      
   
	private $bd; // Conexion a base de datos
	
	function __construct()
	{
	    $this->bd=Bd::getInstancia();
		$this->bd->conectar();
	}
	
    function getFecha()
    {
        return $this->fecha;
    }
    
    function getHora()
    {
        return $this->hora;
    }
    
    
    function getId()
    {
        return $this->id;
    }
	
	
    function add($fecha,$hora,$idUser)
    {
        $i="insert into rutas (fecha,hora,id_usuario) values ";        
        $i.="('$fecha','$hora',$idUser)";                
        $this->bd->put($i);
        $this->id=$this->bd->uid('id_rutas','rutas');
        return $this->id;
    }
    // Añade un trayecto en la ruta(por cada transporte)
    function addTrayecto($idt)
    {
        $idr=$this->id; 
        $i="insert into trayectos (id_rutas,id_transportes) values ";
        $i.="($idr,$idt)";        
        $this->bd->put($i);
        $this->trayecto=$this->bd->uid('id_trayectos','trayectos');
        return $this->trayecto;
    }
    // Añade un tramo a un trayecto(de una estacion a otra)
    function addTramo($inicio,$fin,$coste,$hora,$distancia,$pasos)
    {
        $idty=$this->trayecto;
        if($pasos!="")
        {         
            $i="insert into tramos (id_trayectos,inicio,fin,coste,hora,distancia,pasos) values ";
            $i.="($idty,$inicio,$fin,$coste,$hora,$distancia,'$pasos')";
        }
        else
         {
            $i="insert into tramos (id_trayectos,inicio,fin,coste,hora,distancia) values ";
            $i.="($idty,$inicio,$fin,$coste,$hora,$distancia)";                
         }           
        $this->bd->put($i);
        $this->tramo=$this->bd->uid('id_tramos','tramos');
        return $this->tramo;
    }	
	
    // Consulta para devolver los datos de la ruta(para el grid extjs)
	function getDatos($id=0,$idUser=0)
    {
      if($id==0) $idr=$this->id;
      else $idr=$id;	
      if($idUser==0) return array();
	  else  // comprobamos que se esta accediendo a ruta de este usuario
	  { 
		  $c="select id_rutas from rutas where id_rutas=$idr and id_usuario=$idUser limit 1";
		  $this->bd->put($c);
		  if($this->bd->num()!=1) return array();
	  }	
      
      $salida=array();
      $trayectos=array();
      $transportes=array(); 
      // sacamos los trayectos afectados
      $t="select id_trayectos,id_transportes from trayectos where id_rutas=$idr order by id_trayectos desc";      
      $this->bd->put($t);      
      if($this->bd->num()>0)
      {
          // sacamos los trayectos
          foreach($this->bd->get() as $k=>$v)
          {
              $trayectos[]=$v['id_trayectos'];
              $transportes[]=$v['id_transportes'];
          }
          // sacamos los tramos
          $atrayectos=array(); // guarda los trayectos 
          foreach($trayectos as $k1=>$v1)
          {
                  
              $tramos=array();
              // sacamos el nombre y el id transporte
              $ut=new Ut();
              $ut->get($transportes[$k1]);
              $it=$transportes[$k1];
              $nt=$ut->getNombre();              
              
              $c="select * from tramos where id_trayectos=$v1 order by id_trayectos";              
              $this->bd->put($c);              
              if($this->bd->num()>0)
              {
                 $ct=$this->bd->get();
                 
                 foreach($ct as $k2=>$v2) // por cada tramo, trayecto
                 {
                     $tramo=array(); // array para almacenar datos de los tramos
                     $inicio=$v2['inicio']; // id de la estacion de inicio
                     $fin=$v2['fin']; // id de la estacion de fin
                     // construimos los objetos inicio y fin con array temporales
                     $ainicio=array();
                     $afin=array();
                     
                     $e=new Estaciones();
                     $e->get($inicio);
                     
                     $ainicio['nombre']=$e->getNombre();
                     $ainicio['id_estaciones']=$inicio;
                     $ainicio['lat']=$e->getLat();
                     $ainicio['lon']=$e->getLon();
                     $e->get($fin);
                     $afin['nombre']=$e->getNombre();
                     $afin['id_estaciones']=$fin;
                     $afin['lat']=$e->getLat();
                     $afin['lon']=$e->getLon();
                     
                     
                     // sacamos el coste, distancia y hora
                     
                     $tramo['objInicio']=$ainicio;
                     $tramo['objFin']=$afin;
                     $tramo['idtransporte']=$it;
                     $tramo['transporte']=$nt;
                     $tramo['hora']=date("m/d/Y H:i",$v2['hora']);
                     $tramo['coste']=$v2['coste'];
                     $tramo['km']=$v2['distancia'];
                     $tramo['pasos']=explode(";",$v2['pasos']);
                     $salida[]=$tramo;                                           
                     
                 }
                  //$salida=$tramos;
                  
              }
          }
          
          
      }
      return $salida;      
         
    }

   // Funcion que extrae todas las fechas con sus id(Un json)
   function getTodasRutas($fecha='Todas',$idUser)
   {
   	   if($idUser==0) return json_encode(array());
       if($fecha=='Todas')
       {
          $s="select * from rutas where id_usuario=$idUser order by id_rutas desc";    
       }
       else $s="select * from rutas where fecha='$fecha' and id_usuario=$idUser order by id_rutas desc";       
       $this->bd->put($s);
       $total=$this->bd->num();
       if($total>0)
       {
           $res=$this->bd->get();
           foreach($res as $k=>$v)
           {                             
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
   
    // Funcion que extrae todas las fechas con sus id(Un json) pero sin duplicados
    // (para buscador de fechas del historico)
     
   function getRutas($idUser=0)
   {
       if($idUser==0) return json_encode(array());
       $s="select distinct(fecha) as fecha,to_date(fecha,'MM/DD/YYYY') as f from rutas where id_usuario=$idUser order by f desc";
       $this->bd->put($s);
       $total=$this->bd->num();
       if($total>0)
       {
           $res=$this->bd->get();
           $item['fecha']="Todas";           
           $data[]=$item;
           // Lo ideal es ordenar por fechas
           foreach($res as $k=>$v)
           {
                              
               $data[]=array("fecha"=>$v['fecha']);
           }           
           $res=array("sucess"=>true,"count"=>$total,"data"=>$data);    
           
       }
       else
       {
           $res[0]=array("sucess"=>true,"count"=>0,"data"=>array());              
       }
       return json_encode($res);
   }
   
   // Funcion que extrae los datos de una ruta por tramos
   // se le pasa el id de la ruta
   function getTrayectosTramos($id=0,$idUser=0)
   {
   	   
   	   $salida=array();
   	   if($idUser==0) return $salida;
       if($id==0) return $salida;
       else
       {       	
       	   // consultamos fecha
       	   $f="select fecha from rutas where id_rutas=$id and id_usuario=$idUser";
		   $this->bd->put($f);
		   if($this->bd->num()>0)
		   {
		   	  $r=$this->bd->get();
			  $fecha=$r[0]['fecha'];
			  $salida[0]=$fecha;
			  
		   }
		   else return $salida;
       	   
           // conseguimos los trayectos(transportes en esta ruta)
           $s="select ty.id_trayectos,ty.id_transportes,tr.nombre from trayectos ty, transportes tr ";
		   $s.="  where ty.id_transportes=tr.id_transportes and ty.id_rutas=$id ";
		   $this->bd->put($s);
		   if($this->bd->num()>0)
		   {
		   	  			  
		   	  $res=$this->bd->get();
			  $trayectos=array();
			  foreach($res as $k=>$v)
			  {
			  	 // en $v['id_transportes'] se tiene el id del transporte
			  	 // en $v['nombre'] se tiene el nombre del transporte
			  	 // en $v['id_trayectos'] se tiene el nombre del transporte
			  	 
			  	 // Ahora conseguimos los distintos tramos por trayecto
			  	 $idty=$v['id_trayectos'];
			  	 $ntr=$v['nombre'];
				 $trayectos[0]=$ntr; 
			  	 //$salida[$ntr]
			  	 $c="select * from tramos where id_trayectos=$idty order by id_tramos";
				 $this->bd->put($c);
				 if($this->bd->num()>0)
		   		 {
		   		 	
		   		 	  $tramos=array();
				   	  $resT=$this->bd->get();
					  $e=new Estaciones();
					  foreach($resT as $k1=>$v1) // por cada tramo de cada trayecto
					  {
					  	
		            
					  	$tramo=array();
					  	 // en $v1 se tiene el array con los datos de cada tramo
						$tramo['coste']=$v1['coste'];
						$tramo['hora']=$v1['hora'];
						$tramo['distancia']=$v1['distancia'];
						$idInicio=$v1['inicio']; // id de estacion de inicio
						$idFin=$v1['fin']; // id de estacion de fin 
						// pasamos los nombres						
                        $e->get($idInicio);                     
                        $tramo['inicio']=$e->getNombre();
						$e->get($idFin);                     
                        $tramo['fin']=$e->getNombre();
						$tramos[]=$tramo; 						
					  }
					  $trayectos[1]=$tramos;
		   
				 }
				 
			  $salida[1][]=$trayectos;
			  		     	
		   }
		   		 
		   
       }
       
   }
    return $salida;
 }
    
} // end of class
?>

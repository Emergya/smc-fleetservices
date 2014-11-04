<? 
class Usuario {
   
    private $id=0;
    private $nombre = "";
    private $apellidos = "";    
    private $fecha = ""; // fecha de registro
    private $email = "";
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
    
    function getApellidos()
    {
        return $this->apellidos;
    }
    
    function getId()
    {
        return $this->id;
    }
	
	function login($email,$clave)
	{
	      // Recogemos los datos y protegemos contra xss e Inyeccion sql
	      $email=pg_escape_string(trim(strip_tags($email)));
		  $clave=pg_escape_string(trim(strip_tags($clave)));
		  $cclave=md5($clave);
		  
		  $c="select id_usuarios from usuarios where email='$email' and clave='$cclave'";	          		
		  if($this->bd->put($c))  
		    if($this->bd->num()==1) 
        		  {
        		      $res=$this->bd->get();                      
                      $_SESSION['IDUSER']=$res[0]['id_usuarios']; 
        		      return true;
                  }
		  else return false;
			
	}
	
	// Carga un nuevo usuario desde la base de datos
	
	public  function get($id=0)
	{	 
	  if($id!=0)
	  {	   
	     $c="select * from usuarios where id_usuarios=$id limit 1";
         
		 $this->bd->put($c);
         
		 if($this->bd->num()>0)
		 {
		     
		     $res=$this->bd->get();
             $this->id=$res[0]['id_usuarios'];
			 $this->nombre=$res[0]['nombre'];
			 $this->apellidos=$res[0]['apellidos'];
			 $this->email=$res[0]['email'];
             $this->id=$res[0]['id_usuarios'];
             $this->fecha=$res[0]['fecha'];                             			 
             return $this;
               
             			 
		 }	
		 else 
		 {
		      Errores::g()->add('No existe este usuario');
              return false; 
		 }
           
           
	  }
      else
      {
               Errores::g()->add('No existe este usuario');
               return true;
      } 
	     
	}

	
	
   function add($datos=array())
	{

		 foreach($datos as $k=>$v) $$k=pg_escape_string(trim(strip_tags($v)));
	    // comprobaciones
	    if(count($datos)!=4) 
		{
		    Errores::g()->add('Falta algún dato que indicar');
			return false; 
		}
		
		if($nombre=="")  
		{
		    Errores::g()->add('Falta indicar el nombre');
			return false;
		}
		
		if($apellidos=="") 
		{
		    Errores::g()->add('Falta indicar los apeliidos');
			return false;
		 }
		if(!Util::cEmail($email)) 
		{
		    Errores::g()->add('Email incorrecto');
			return false;
		}
		
		if($clave=="") 
		{		 
		    Errores::g()->add('Falta indicar la clave de acceso');
			return false;
		}
		
        if(Errores::g()->num()==0)
        {
        
    		// comprobamos que no existe un usuario ya registrado con mismo email 
    		$c="select id_usuarios from usuarios where email='$email' limit 1";				
    		if($this->bd->put($c))
    		{
    
    		    if($this->bd->num()!=0)
    			{
    			    
    			    $s="El usuario con email " . $email . " ya existe";
    		        Errores::g()->add($s);
                    return false;
    			}
    			else
    			{
    
    			      // registro
    				 $nclave=md5($clave);
                     $ahora=time();
    				 $c="INSERT INTO usuarios (nombre,apellidos,email,clave,fecha) VALUES ";
    				 $c.="('$nombre','$apellidos','$email','$nclave','$ahora');";                 
    				 $this->bd->put($c);
                     $this->id=$this->bd->uid('id_usuarios','usuarios');
                     $_SESSION['IDUSER']=$this->id; 		 
    				 return($this);
                     		
    			}
    			
    		}
        } else return false;
		
	}
   
	
}
?>

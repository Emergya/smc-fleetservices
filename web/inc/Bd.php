<? 
class Bd {
    
    private $conexion;
	private $query;
    private static $instancia;
	public static function getInstancia()
    {
        if (!isset(self::$instancia)) {
            $c = __CLASS__;
            self::$instancia = new $c;
        }
        return self::$instancia;
    }
	
	 public function __clone()
    {
       
    }
	
	function conectar()
	{	    
                
	        $host = "localhost";
            $user = "openfleetservices";
            $pass = "openfleetservices";
            $db = "openfleetservices";
            $port=5432;      
            
            
            /*$host = "postgresql-apps.emergya.es"; // 46.105.24.58 ip
            $user = "openfleetservices";
            $pass = "openfleetservices";
            $db = "openfleetservices_db";
            $port=5434;*/
                     
            $error=0;           
            $strCnx = "host=$host port=$port dbname=$db user=$user password=$pass";
			$error=0;			
			if(!$this->conexion=@pg_connect($strCnx))  $error=1;
			else 
			{
			       @pg_query("SET NAMES utf8");
			       return true;
			 } 
			 
			 if($error=1) 
			 {
				 Errores::g()->add('No se ha podido establecer conexión con el servidor de base de datos');
				 return false;
			 }
			
	}
	
	
   
    function  put($sql)
	{
	    
	    if(!$this->query=@pg_query($sql))
		{
		 // Errores::g()->add($sql); 
		  Errores::g()->add('No se ha podido realizar la consulta a la base de datos');
		  return false;
		 }
		else return true;
    }
    

 // devuelve array vacio si no encuenta nada y relleno con un array (cada ffila) de arrays(cada campo) con los datos,
    function get()
	{	  
	     if($this->num()>0)
		 {  	
		     $res=array(); 			 
			 while($R=@pg_fetch_assoc($this->query))
			 {
			    $res[]=$R;
			 }
			 return $res;
		 }
		 else return array();
    }

    function num()
	{	
	  return @pg_num_rows($this->query);	  
    }
	
	function uid($colname,$table_name)
	{
	   $s="select $colname from $table_name order by $colname DESC limit 1";
       $this->put($s);
       if($this->num()>0) 
       {
           $res=$this->get();
           return $res[0][$colname];
       }
       else return 1; // el primero   	   
	}
    
    
    function liberar($query){
        @pg_free_result($query);
    }
	
	
}
?>

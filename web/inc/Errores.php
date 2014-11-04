<? 
class Errores {

    private static $instancia;
    private static  $datos = array();
    
	private function __construct()
    {
        self::$datos=array();
    }
 
    // EL método singleton 
    public static function g()
    {
        if (!isset(self::$instancia)) {
            $c = __CLASS__;
            self::$instancia = new $c;
        }
 
        return self::$instancia;
    }
	
	public function add($error='')
	{
	   if($error!='')  self::$datos[]=$error;
	}
	
	public  function limpiar()
	{
	    self::$datos[]=array();
	}
	
	public function get()
	{
	    if($this->num()>0)  return  self::$datos;		
	    return false;
	}
	
	public function num()
	{
	    return count(self::$datos);		
	}
 
    // Clone no permitido
    public function __clone()
    {

    }
	public function __toString()
	{
	    var_dump(self::$datos);
	}
}
?>

<? 
class Util {

  
	 public function __clone()
    {
       
    }
	

	
    static function insertar_array(&$arr, $key, $val)
    {
        $arr = array_reverse($arr, true);
        $arr[$key] = $val;
        return array_reverse($arr, true);
    } 
    
	
	public static function cEmail($email='')
	{	

            if($email=='') return false;
			else
			{
			   $mail_correcto = false; 
				//compruebo unas cosas primeras 			
				if ((strlen($email) >= 6) && (substr_count($email,"@") == 1) && (substr($email,0,1) != "@") && (substr($email,strlen($email)-1,1) != "@")){ 
			
				   if ((!strstr($email,"'")) && (!strstr($email,"\"")) && (!strstr($email,"\\")) && (!strstr($email,"\$")) && (!strstr($email," "))) { 			
					  //miro si tiene caracter . 			
					  if (substr_count($email,".")>= 1){ 			
						 //obtengo la terminacion del dominio 			
						 $term_dom = substr(strrchr ($email, '.'),1); 			
						 //compruebo que la terminaci�n del dominio sea correcta 			
						 if (strlen($term_dom)>1 && strlen($term_dom)<5 && (!strstr($term_dom,"@")) ){ 			
							//compruebo que lo de antes del dominio sea correcto 			
							$antes_dom = substr($email,0,strlen($email) - strlen($term_dom) - 1); 			
							$caracter_ult = substr($antes_dom,strlen($antes_dom)-1,1); 			
							if ($caracter_ult != "@" && $caracter_ult != ".")  return true;
							   
						
						 } 
			
					  } 
			
				   } 
			
				} 
				
			}
			return false;
	   }
	
    // Retoma la Latitud y Longuitud de una direccion dada
	public static function geocode_address($address)
    {
        $address = str_replace (" ", "+", urlencode($address));   
        $details_url = "http://maps.googleapis.com/maps/api/geocode/json?address=".$address."&sensor=false";
     
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $details_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $response = json_decode(curl_exec($ch), true);
     
        // If Status Code is ZERO_RESULTS, OVER_QUERY_LIMIT, REQUEST_DENIED or INVALID_REQUEST we had an error.
        switch($response['status']) {
            case 'OVER_QUERY_LIMIT':
                   return array(
                       "errors"=>"se ha superado el número de usos diarios de la API de geolocalización de Google",
                       "status"=>"Límite API Google sobrepasado");
                case 'ZERO_RESULTS':
                   return array(
                       "errors"=>"no se obtuvo coordenadas, compruebe la dirección",
                       "status"=>"Geocodificación sin resultados");               
                case 'OK':             
                   break;
                default:
                   return array(
                       "errors"=>"la geolocalización fallá",
                       "status"=>"Error al geolocalizar" );
                   
        }
       
     
        $geometry = $response['results'][0]['geometry'];
        $longitude = $geometry['location']['lng'];
        $latitude = $geometry['location']['lat'];
     
        $array = array(   
            "status"=>"OK",
            "errors"=>"",
            'latitude' => $latitude,
            'longitude' => $longitude
        );
     
        return $array; 
       
  }
  
// Función para adaptar el xml devuelto del WS a array asociativo  
public static function obj2array($obj) {
  $out = array();
  foreach ($obj as $key => $val) {
    switch(true) {
        case is_object($val):
         $out[$key] = obj2array($val);
         break;
      case is_array($val):
         $out[$key] = obj2array($val);
         break;
      default:
        $out[$key] = $val;
    }
  }
  return $out;
}
  
// Función para renombrar keys de arrays asociativos  
public static function array_change_key(&$array, $old_key, $new_key)
{
    $array[$new_key] = $array[$old_key];
    unset($array[$old_key]);
    return;
}

// Otras funciones utiles por si no va las anteriores

   // xml to json
public static function xml2json(&$xml) {
        return json_encode(xml2ary($xml));
    }   
 
 
 
// xml to array
public static function xml2array(&$string) {
    $parser = xml_parser_create();
    xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
    xml_parse_into_struct($parser, $string, $vals, $index);
    xml_parser_free($parser);
     
    $mnary=array();
    $ary=&$mnary;
    foreach ($vals as $r) {
    $t=$r['tag'];
    if ($r['type']=='open') {
    if (isset($ary[$t])) {
    if (isset($ary[$t][0])) $ary[$t][]=array();
    else $ary[$t]=array($ary[$t], array());
    $cv=&$ary[$t][count($ary[$t])-1];
    } else $cv=&$ary[$t];
    if (isset($r['attributes'])) {
    foreach ($r['attributes'] as $k=>$v) $cv['_a'][$k]=$v;}
    $cv['_c']=array();
    $cv['_c']['_p']=&$ary;
    $ary=&$cv['_c'];
    } elseif ($r['type']=='complete') {
    if (isset($ary[$t])) { // same as open
    if (isset($ary[$t][0])) $ary[$t][]=array();
    else $ary[$t]=array($ary[$t], array());
    $cv=&$ary[$t][count($ary[$t])-1];
    } else $cv=&$ary[$t];
    if (isset($r['attributes'])) {
    foreach ($r['attributes'] as $k=>$v) $cv['_a'][$k]=$v;}
    $cv['_v']=(isset($r['value']) ? $r['value'] : '');
    } elseif ($r['type']=='close') {
    $ary=&$ary['_p'];
    }
    }
     
    _del_p($mnary);
    return $mnary;
}
 
// _Internal: Remove recursion in result array
public static function _del_p(&$ary) {
    foreach ($ary as $k=>$v) {
    if ($k==='_p') unset($ary[$k]);
    elseif (is_array($ary[$k])) _del_p($ary[$k]);
    }
}  
	
} // end de la clase
?>

<?php


if(isset($_GET['tipo'])){
	$tipo = $_GET['tipo'];
}
else{
	$tipo = 'tipo.0';
}



$datos= array(json_decode('{"id_norma": "1" , "norma": "Más de 20 años (1)"}'), json_decode('{"id_norma": "2" , "norma": "Entre 15 y 20 años (2)"}'), json_decode('{"id_norma": "3" , "norma": "Entre 12 y 15 años (3)"}'));
if($tipo != 'tipo.5'){
	array_push($datos,json_decode('{"id_norma": "4", "norma": "Entre 8 y 12 años(4)"}'), json_decode('{"id_norma": "5", "norma": "Entre 4 y 8 años (5)"}'), json_decode('{"id_norma": "6", "norma": "Menos de 4 años(6)"}'));

}
if (($tipo == 'tipo.5') || $tipo == "tipo.0"){
	array_push($datos,json_decode('{"id_norma": "EEV" , "norma": "Vehículo Ecológico Avanzado (EEV)"}'));
}


$data -> data = array();
$data -> data = $datos;

echo(json_encode($data));
?>
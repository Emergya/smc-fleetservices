<?php
require_once("comprobar.php");
require_once("inc/Errores.php");
require_once("inc/Util.php");
require_once("inc/Bd.php");
require_once("inc/Usuario.php");
$id=$_SESSION['IDUSER'];
$user=new Usuario();
$user=$user->get($id);
?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
<title>OpenFleetServices</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" type="text/css" href="extjs/resources/css/ext-all.css" />

 <link rel="stylesheet" type="text/css" href="extjs/resources/css/xtheme-slate.css" />   
<!-- 
<link rel="stylesheet" type="text/css" href="extjs/resources/css/xtheme-azenis.css" />
<link rel="stylesheet" type="text/css" href="extjs/resources/css/xtheme-dcs.css" /> -->


<link rel="stylesheet" type="text/css" href="css/estilos.css">
<link rel="stylesheet" type="text/css" href="GeoExt/resources/css/geoext-all-debug.css"></link>

<script type="text/javascript" src="extjs/adapter/ext/ext-base.js"></script>
<script type="text/javascript" src="extjs/ext-all-debug.js"></script>
<script type="text/javascript" src="extjs/locale/ext-lang-es.js"></script>
<script type="text/javascript" src="OpenLayers/OpenLayers.js" ></script>
<script type="text/javascript" src="GeoExt/lib/GeoExt.js"></script>
<link rel="stylesheet" type="text/css" href="GeoExt/resources/css/geoext-all-debug.css"></link>

<script language="javascript" src="js/app.js"></script>
<script src="http://maps.googleapis.com/maps/api/js?key=AIzaSyBZWy7pS-g4PggB7yUWHHF41s4-8CeivK8&sensor=true" type="text/javascript"></script>

</head>
    
    <body>    
            
         <div id="header">
             <div id="logo"></div>
             <div id="info">
                 
                 <div id="exit">      
                    <a href="salir.php">
                        <img alt="salir" title="salir" src="img/salir.png"/ width="24" >
                    </a>
                 </div>
                 <div id="name">
                     <?=ucfirst($user->getNombre()). " " . ucfirst($user->getApellidos()) ?>
                 </div>
             </div>
         </div>
         <div id="content">
             
         </div>
       
    </body>
</html>

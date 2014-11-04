<?php            
            $host = "postgresql-apps.emergya.es"; // 46.105.24.58 ip
            $user = "openfleetservices";
            $pass = "openfleetservices";
            $db = "openfleetservices_db";
            $port=5434;
                     
              
              
            $strCnx = "host=$host port=$port dbname=$db user=$user password=$pass";
            $error=0;           
            if(!pg_connect($strCnx))  echo "No conectado";
            else 
            {
                   //borramos todos los tramos,trayectos y rutas
                   /*
                   $d="delete from tramos";
                   pg_query($d);
                   $d="delete from trayectos";
                   pg_query($d);
                   $d="delete from rutas";
                   pg_query($d);
                   */
                    
             } 
phpinfo();
?>

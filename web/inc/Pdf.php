<? 
require('pdf/fpdf.php');
class Pdf extends FPDF
{

   	
   //Cabecera de página
   function Header()
   {

       $this->SetFont('Arial','B',12);
       $this->Cell(40,10,'OpenFleetServices',0,0,'C');

   }
   
   //Pie de página
   function Footer()
    {    
        $this->SetY(-10);
        $this->SetFont('Arial','I',8);
        $this->Cell(0,10, utf8_decode("Página") . ": " . $this->PageNo(),0,0,'C');    
    }
    
	
	
/*
    function AcceptPageBreak()
	{
		//Método que acepta o no el salto automático de página
		if($this->col<4)
		{
		//Ir a la siguiente columna
		$this->SetCol($this->col+1);
		//Establecer la ordenada al principio
		$this->SetY($this->y0);
		//Seguir en esta página
		return false;
		}
		else
		{
		//Volver a la primera columna
		$this->SetCol(0);
		//Salto de página
		return true;
		}
    } 
   */
	
   // Titulo
   function Titulo($fecha)
    {
        $this->SetY(30);
        //Arial 12
        $this->SetFont('Arial','',12);
        //Color de fondo
        $this->SetFillColor(200,220,255);
        //Título
        $this->Cell(0,10,utf8_decode("Cálculo Ruta de $fecha"),0,1,'L',true);
        //Salto de línea
        $this->Ln(4);
     }
  
  function EncabezadoTabla($nombre)
    {        
        //Arial 12     
        $this->Image("img/transporte.jpg" , 10 ,50, 10 , 7 , "JPG" );
        $this->SetFont('Arial','',12);
        $this->SetFillColor(255,255,255);
        $this->SetFont('Arial','',12);
        $this->Ln(5);
        $this->Cell(11);        
        $this->SetTextColor(98,132,234);
        $this->Cell(0,10,$nombre,0,1,'L',true);
        $this->SetTextColor(0,0,0); 

     }

  function Tabla($header,$datos)
   {
    //Cabecera
       
      $this->SetTextColor(234,42,80);
      $this->SetFont('Arial','',10);
      // CABECERA
      $this->Cell(98,7,"RECORRIDO",1,0,'C');
      $this->Cell(35,7,"HORA",1,0,'C');
      $this->Cell(30,7,"COSTE",1,0,'C');
      $this->Cell(30,7,"DISTANCIA",1,0,'C');
          
      // DATOS DE LA TABLA    
      //$this->Ln();
    
      $inicioY=70;
      foreach ($datos as $k => $v) 
      {
      	
      	  $euro = iconv('UTF-8', 'windows-1252', '€');
		     
      	  $recorrido=utf8_decode($v['inicio']  .  "\na\n" . $v['fin']);
      	  $hora=date("d/m/yy",$v['hora']) . "\n" . date("H:i",$v['hora']) . " h";
		  $coste=$v['coste'] .  " " . $euro;
		  $distancia=$v['distancia'] . " km";		            		       	   
          $this->SetTextColor(0,0,0);
		  
		 
		  
		  $this->SetY($inicioY);
		  
	      $this->MultiCell(98,5,$recorrido,1);
		  $sig_Y=$this->GetY();
		  $this->SetY($inicioY);		  		  
	      $x=$this->GetX();		  
		  $this->SetLeftMargin($x+98);  	
	      $this->MultiCell(35,5,$hora,0,'C');
		  $this->SetY($inicioY);		  
		  $x=$this->GetX();		  
		  $this->SetLeftMargin($x+35);	   
		  $this->MultiCell(30,5,$coste,0,'C');
		  $this->SetY($inicioY);
		  $x=$this->GetX();		  
		  $this->SetLeftMargin($x+30);			     
		  $this->MultiCell(30,5,$distancia,0,'C');
		  $inicioY=$sig_Y+5; // separacion entre tramos
		  $this->SetLeftMargin(10);
      }
      
     
      
      
   }  
   function Salto()
   {
        $this->Cell(100,5,"hola",1);
        $this->Ln(15);
        $this->Ln(15);
   }
}
?>

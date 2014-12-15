// JavaScript Document

//Variables para el control y visualización del mapa
var map, layer;


var actualIcon;
var iconHome = new L.icon({
        			iconUrl: "./img/home.png",
        			iconSize: [25,41]
        		})
var iconStation =  new L.icon({
        			iconUrl: "./img/station.png",
        			iconSize: [25,30],
        			iconAnchor:[25,30]
        		})
var iconTruck = new L.icon({
        			iconUrl: "./img/truck.png",
        			iconSize: [25,41]
        		})




var ruta = new L.LayerGroup();
var rutaParcial = new L.Polyline("rutasParciales");
var stylesheetStations = '* {iconUrl: "./img/station.png";markerWidth: 22;markerHeight: 30; anchorLeft:13; anchorTop:30; disableClustering:true;} * [activo="f"] {iconUrl: "./img/station_inactive.png";markerWidth: 22;markerHeight: 30; anchorLeft:13; anchorTop:30; disableClustering:true;} * [tipo="Origen"] {iconUrl: "./img/station-origin.png";markerWidth: 22;markerHeight: 30; anchorLeft:13; anchorTop:30; disableClustering:true;} * [tipo="Destino"] {iconUrl: "./img/station-target.png";markerWidth: 22;markerHeight: 30; anchorLeft:13; anchorTop:30; disableClustering:true;}';
var markers = new SMC.layers.markers.MarkerLayer({
	label: 'Estaciones actuales',
	stylesheet: stylesheetStations
});

var optionColor = ["blue", "red","green", "yellow"];
var vector;
var vectorSelected = { 
		  color: 'aqua', 
		  opacity: 1,
		  weight: 5
};
var hora_inicio, tipoV, tonelajeV, normaV;
var arrTrans = [];

var markerClick;

var toolbarItems = [];



	/*
	 * Formulario busqueda mapa 
	 * 
	 * */
var direccionMapa = new Ext.form.TextField({   
    fieldLabel:'Dirección',   
    name:'direccionMapa',   
    emptyText:'Dirección...',   
    id:"direccionMapa",
    width: '300px'
});
      
var searchbutton = new  Ext.Button ({
    xtype: 'button',
    text: 'Buscar',     
    id:'boton_buscar',
    handler: function() {
        showAddress(null);
    },
    style: 'padding-left: 20px;'
});



var searchform = new Ext.FormPanel({
	layout : {
	 		type : 'table',
		columns : 2
	},
	frame : true,
	defaults : {
		xtype : 'textfield'
	},
	items : [direccionMapa, searchbutton]
});

Ext.onReady(function(){
	
    Ext.QuickTips.init();
    Ext.form.Field.prototype.msgTarget = 'side';  
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
    var altoCab=Ext.get('header').getHeight(); // alto de la cabecera   
    var alto=Ext.getBody().getViewSize().height - altoCab; // alto del área de trabajo
   //console.log(altoCab);
    
    toolbarItems.push(searchform);
    
 

  var mapPanel = new Ext.Panel({
  		
      	title: 'Callejero',
        stateId: "mappanel",
        region  :  "center",
        html: "<div id='map' style='height:100%'></div>",
        tbar : toolbarItems,
                
    });

	
    
    
   
   //*****************************************************// 
   //**************** FUNCIONES GENERALES  ***************//
  //*****************************************************//
    
    // validacion de costes(dd.dd)
    Ext.apply(Ext.form.VTypes,{  
    	  
    	 VEntero: function(val, field){  
    		 return true;
    	 },
    	 VEnteroText: 'Debe ser una cantidad(€): Ej: 10.05€', //mensaje de error  
    	 VEnteroMask: /[\d\.]/i
  
    });



  
    
    function desconectar()
    {
    	Ext.Msg.show({
            title:'Alerta del sistema',
            msg:'Acabo la sesión,necesita ser identificado',
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.ERROR,
            closable:false,
            fn: function()
            {            	   
	               window.location = 'index.php';
            }
         });
    }
    
    function falloServidor()
    {
    	Ext.Msg.show({
            title:'Alerta del sistema',
            msg:'No se ha podido establecer conexión con servidor',
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.ERROR,
            closable:false,
            fn: function()
            {            	   
	          
            }
         });
    }
        
	function codBoolean(value, metaData, record, rowIndex, colIndex, store)
	{	//alert(record.get('activo'));	
		if(value=='t') return "SI";
		else return "NO";
	}
  //*****************************************************//
   // *************** FIN DE FUNCIONES GENERALES ********//
  //*****************************************************//
    
  
   
   // *****************************************************// 
   // ***************** TRANSPORTES ************************ //
  //*****************************************************//
	var mySelectionModel1 = new Ext.grid.CheckboxSelectionModel({singleSelect: false}); 
    var index=0; // indice para coger la fila de transporte(de storeUt) a modificar  	   
 
    
    // Store para unidades de transportes-->Grid de transportes
    var storeUt = new Ext.data.JsonStore({
    	url: 'consulta_transportes.php',
    	root: 'data',
    	totalProperty: 'count',
    	fields: [
    	         {name:'id_transportes',type:'float'},
    	         {name:'nombre',type:'string'},
    	         {name:'estacionInicio',mapping:'estacion_inicio'},
    	         {name:'estacionFin',mapping:'estacion_fin'},
    	         {name:'activo',mapping:'activo',type:'string'},
    	         {name:'coste_x_km',type:'float'},
    	         {name:'coste_x_dia',type:'float'},
    	         {name:'tipo',mapping:'tipo', type:'string'},
    	         {name:'tonelaje',mapping:'tonelaje',type:'float'},
    	         {name:'norma',mapping:'norma', type:'string'},
    	         {name:'nestacion_inicio',mapping:'nestacion_inicio',type:'string'}, // nos traemos tb los nombres para el grid
    	         {name:'nestacion_fin',mapping:'nestacion_fin',type:'string'},
    	             	         
    	         ]
    });
   // storeUt.load(); ->no se puede poner aqui por si editan cambian las estaciones
    
    
 // paginación para transportes
    var pagerUt = new Ext.PagingToolbar({  
        store: storeUt, // <--grid and PagingToolbar using same store (required)  
        displayInfo: true,  
        displayMsg: '{0} - {1} de {2} Transportes',  
        emptyMsg: 'No hay transportes',  
        pageSize: 1        
    });

    var storeType = new Ext.data.JsonStore({
    	url: 'consulta_tipos.php',
    	root:'data',
    	fields: [
    	         {name:'id_type', mapping:'id_type',type:'string'},
    	         {name:'tipo',mapping: 'tipo',type:'string'}, 
    	         {name:'min',mapping: 'min',type:'float'}, 
    	         {name:'max',mapping: 'max',type:'float'},         	         
    	],
    	autoLoad: true

    	
	});
	 

	 
	  var storeNorma= new Ext.data.JsonStore({
    	url: 'consulta_norma.php',
    	root:'data',
    	fields: [
    	         {name:'id_norma', mapping:'id_norma',type:'string'},
    	         {name:'norma',mapping: 'norma',type:'string'},          	         
    	] ,
    	autoLoad:true

    	
	});
	 
	
	

	 function getType(value){
	 	var type = '';
		 storeType.each(function(record,index)
	  		 { 
	  		    if(record.get('id_type')==value)
	  		    	type =  record.get('tipo');
	  		  });
		 return type;
	}

	

  //Creando el objeto Ext.grid.GridPanel para listar transportes
	var gridUt = new Ext.grid.GridPanel({		
		store: storeUt,
		id:'gridUt',
		columns: [			
		  	mySelectionModel1, //checkbox for 
		  	{id:'nombre',header:'Nombre', dataIndex:'nombre', width:67,sortable: true},
			{id:'estacion_inicio',header:'Inicio', dataIndex:'nestacion_inicio', width:63,sortable: true},			
			{id:'estacion_fin',header:'Fin', dataIndex:'nestacion_fin', width:63, sortable: true},			
			{id:'coste_x_km',header:'€/km', dataIndex:'coste_x_km', width:35,sortable: true},
			{id:'coste_x_dia',header:'€/dia', dataIndex:'coste_x_dia', width:35,sortable: true},
			{id:'tipo',header:'Tipo', dataIndex:'tipo', width:68,sortable: true, renderer: getType},
			{id:'tonelaje',header:'Tonelaje', dataIndex:'tonelaje', width:51,sortable: true},
			{id:'norma',header:'Norma', dataIndex:'norma', width:38,sortable: true},
			{id:'activo',header:'Activo', dataIndex:'activo', width:41,sortable: true,renderer:codBoolean},
			{
                xtype: 'actioncolumn',
                width: 68,
                items: 
                	[
                	 {
                		icon: 'img/edit.png',                 	 
 	                    tooltip: 'Editar',
 	                    handler: editarUt
                 	 },
                 	 {
                 		icon: 'img/delete.png', 
 	                    tooltip: 'Eliminar', 	                    
 	                    handler: eliminarUt
                 	 }
                    ]
            }
			
		],
		sm: mySelectionModel1,
		stripeRows: true,
		height:250,
		width:alto,		
	});



	 
	 // Elimina unidad de transporte	
	  function eliminarUt(grid, rowIndex, colIndex)
	  {

		  //alert("Eliminando.. " + rec.get('id_transportes'));
		   var rec = storeUt.getAt(rowIndex);	   
		   var nt=rec.get('nombre');	  
		   Ext.Msg.confirm('Confirmación','¿Estás seguro de querer eliminar el transporte ' + nt + '?',function(btn){  
		      if(btn === 'yes'){  
		    	  
		    	     // Se pone campo borrado del transporte a true
	                 var idt=rec.get('id_transportes');
	                 Ext.Ajax.request({  
	                     url: 'eliminar_ut.php',  
	                     params:{id:idt}, //se envia el id del transporte  
	                     success: function()
	                     {
	                    	 // se borra del store
	        	    	     storeUt.remove(rec);		 
	                     },  
	                     failure:function(form, action){ 
	                         if(action.failureType == 'server'){ 
	                             obj = Ext.util.JSON.decode(action.response.responseText);
	                             if(obj.errores.razon=='false') // usuario no logeado
	                             {
	                             	desconectar();
	                             }
	                             else
	                             {
	                             Ext.Msg.show({
	                                 title:'Fallo de registro',
	                                 msg:obj.errores.razon,
	                                 buttons: Ext.Msg.OK,
	                                 icon: 'icoFail'
	                              });
	                             }
	                         }else{ 
	                        	 falloServidor();
	                         } 
	                   
	                     } ,  
	                     scope:this  
	                 });
	                    	     
		              
		        }  
		    }); 
		    
	      
	  }
	
		// Editar info de transportes
	  function editarUt(grid, indice, colIndex)
	  {
	  	 Ext.apply(Ext.form.VTypes,{  
    	  
		    	 VRange: function(val, field){ 
		    	 if(val >= 1 && val <= 60) 
		    		 return true;
		    		else
		    			return false;
		    	 },
		    	 VRangeText: 'Entre 1 y 60', //mensaje de error  
		    	 VRangeMask: /[\d\.]/i
		  
	   });
	  	 
	  	Ext.apply(Ext.form.VTypes,{  
    	  
    	     VNorma: function(val, field){ 
  				return true;
	    	 },
	    	 VNormaText: 'Norma no válida para este tipo de vehículo', //mensaje de error  
	    	 VNormaMask: /[\d\.]/i
	  
	    }); 


		index=indice; 
		function extraeNombre2(combo) {
	        var value = combo.getValue();
	        var valueField = combo.valueField;
	        var record;
	        combo.getStore().each(function(r){
	            if(r.data[valueField] == value){
	                record = r;
	                return false;
	            }
	        });

	        return record ? record.get(combo.displayField) : null;
	    }

	   
		
		function guardaStoreUt()
		{		
	        
			
			var idUt = storeUt.getAt(index);
			idUt.set('nombre', formEditUt.getForm().getValues().nombre);
	    	idUt.set('estacionInicio', formEditUt.getForm().getValues().estacionInicio);
	    	idUt.set('nestacion_inicio',  extraeNombre2(formEditUt.getForm().findField('estacionInicio')));
	    	idUt.set('nestacion_fin',  extraeNombre2(formEditUt.getForm().findField('estacionFin')));
	    	idUt.set('estacionFin', formEditUt.getForm().getValues().estacionFin);
	    	var vactivo="f";
	    	if (formEditUt.getForm().getValues().activo=="on") vactivo="t";	                        		                        	
	    	idUt.set('activo', vactivo);
	    	idUt.set('coste_x_km', formEditUt.getForm().getValues().coste_x_km);	                        	
	    	idUt.set('coste_x_dia', formEditUt.getForm().getValues().coste_x_dia);
	    	idUt.set('tipo', formEditUt.getForm().getValues().tipo);
	    
	    	idUt.set('tonelaje', formEditUt.getForm().getValues().tonelaje);
	    	storeNorma.each(function(record, index){
	  		 	 if(record.get('id_norma') == formEditUt.getForm().getValues().norma || record.get('norma') == formEditUt.getForm().getValues().norma ) {	
	  		 	 	idUt.set('norma',record.get('id_norma'));
	  		 	 }
	    	});
	    	//idUt.set('norma', formEditUt.getForm().getValues().norma);
	    	WEditUt.close();
		}
		
			

		 var fila = storeUt.getAt(indice); // storeUt->recogemos la fila afectada
		 var valueNorma = fila.get('norma');
	     storeNorma.each(function(record, index){
	  		 	 if(record.get('id_norma') == fila.get('norma')) {
	  		 	    valueNorma = record.get('id_norma');	
	  		 	 	fila.set('norma',record.get('norma'));
	  		 	 }
	  	});
		 
		 overrideStore(fila.get('tipo'));
			
		  var formEditUt = new Ext.FormPanel({ 
		        labelWidth:130,		
		        url:'actualiza_ut.php', 
		        frame:true, 
		        title:'Editar Unidad de Transporte',         
		        monitorValid:true,
				defaults    : {allowBlank: false,width:'300px'}, 
				defaultType:'textfield',
				bodyStyle:'padding: 15px',
				items:[
					   {name:'nombre',fieldLabel:'Nombre', width: 300},
					   {xtype:'checkbox',name:'activo',fieldLabel:'Activo',renderer:codBoolean},
					   {
						   xtype:'combo',
						   name:'estacionInicio',
						   triggerAction: 'all',  				   
						   fieldLabel:'Inicio',
						   editable:false,
						   forceSelection:true,  
						   store:storeEs,
						   hiddenName: 'estacionInicio',
						   valueField: 'id_estaciones',
						   displayField:'nombre'  
					       
					   },
					   {
						   xtype:'combo',
						   name:'estacionFin',
						   triggerAction: 'all',  				   
						   fieldLabel:'Fin',
						   editable:false,
						   forceSelection:true,  
						   store:storeEs,
						   hiddenName: 'estacionFin',
						   valueField: 'id_estaciones',
						   displayField:'nombre'  
					       
					   },
					   {name:'coste_x_km',fieldLabel:'Coste/Km(€)',vtype:'alfa',width:'60px',vtype:'VEntero'},
					   {name:'coste_x_dia',fieldLabel:'Coste/dia(€)',vtype:'alfa',width:'60px',vtype:'VEntero'},
					   {
						   xtype:'combo',
						   name:'tipo',
						   triggerAction: 'all',  				   
						   fieldLabel:'Tipo vehículo',
						   editable:false,
						   forceSelection:true,  
						   store:storeType,
						   hiddenName: 'tipo',
						   valueField: 'id_type',
						   displayField:'tipo', 
						   listeners:{select: function(){
						     //setStoreNormaEdit();   
						   	 //overrideStore(this.value);
						   	 formEditUt.getForm().findField('norma').focus();
						   	 formEditUt.getForm().findField('tonelaje').focus();
 

						   },
						 
						}

					       
					   },
					   {name:'tonelaje',fieldLabel:'Tonelaje',width:'60px', vtype:'VRange',listeners:{focus:setRangeEdit}},
					    {
						   xtype:'combo',
						   name:'norma',
						   triggerAction: 'all',  				   
						   fieldLabel:'Antigüedad del vehículo',
						   editable:false,
						   forceSelection:true,  
						   store: storeNorma,
						   hiddenName: 'norma',
						   valueField: 'id_norma',
						   displayField:'norma',
						   vtype: 'VNorma',
						   focusOnToFront: false,
						   listeners: {
						     focus: function(){
						     	setStoreNormaEdit();
						     },
						     select: setStoreNormaEdit
						 }
					       
					   },
					   {xtype:'hidden',name:'id_transportes',id:'id_transportes'}
					   ],
					  
					   
				buttons:[{ 
		                text:'Guardar',
		                formBind: true,  
		                handler:function(){ 	                	
		                	formEditUt.getForm().findField('id_transportes').setValue(storeUt.getAt(index).get('id_transportes'));
						    storeNorma.each(function(record, index){
					  		 	 if(record.get('id_norma') == formEditUt.getForm().getValues().norma || record.get('norma') == formEditUt.getForm().getValues().norma ) {	
					  		 	 	formEditUt.getForm().findField('norma').setValue(record.get('id_norma'));
					  		 	 }
					    	});
		                	//formEditUt.getForm().findField('norma').setValue(storeUt.getAt(index).get('id_norma'));
		                	overrideStore('tipo.0');
		                	formEditUt.getForm().submit({ 
		                        method:'POST', 
		                        waitMsg:'Enviando datos...',
								waitTitle:'Espere por favor..', 
		                        success:guardaStoreUt,
		                        failure:function(form, action){ 
		                            if(action.failureType == 'server'){ 
		                                obj = Ext.util.JSON.decode(action.response.responseText);
		                                if(obj.errores.razon=='false') // usuario no logeado
		                                {
		                                	desconectar();
		                                }
		                                else
		                                {
		                                Ext.Msg.show({
		                                    title:'Fallo de registro',
		                                    msg:obj.errores.razon,
		                                    buttons: Ext.Msg.OK,
		                                    icon: 'icoFail'
		                                 });
		                                }
		                            }else{ 
		                            	falloServidor(); 
		                            } 
		                      
		                        } 
		                    }); 
		                } 
		            },
		            { 
		                text:'Cancelar',                 
		                handler:function(){
		                	fila.set('norma',valueNorma);
		                	overrideStore('tipo.0');
		                	if(storeUt.getAt(indice).get('activo')==1) storeUt.getAt(indice).set('activo','t');
		                	else storeUt.getAt(indice).set('activo','f');
		                	formEditUt.destroy();
		                	WEditUt.hide();                 
		                }
		            }
				] 
		       });  
		  // Ventana para crear nuevas unidades de transportes
		    var WEditUt = new Ext.Window({
		        layout:'fit',
		        width:500,
		        x:10,		      
		        closable: false,
		        resizable: false,
		        plain: true,
		        border: false,  
				layout: 'form',        
		        modal: true, //set the Window to modal  
		        items: [formEditUt]
		    });
		    
		   
		  
		  
	     

	     // acomodo del valor de activo para el checkbox del formulario de editar
		  var valorActivo=0;
		  if(fila.get('activo')=='t') valorActivo=1;
		  fila.set('activo',valorActivo);
		  //fila.set('norma', fila.get('norma'));
		  
		
		  formEditUt.getForm().loadRecord(fila);
		  WEditUt.show();


		
		 
		  function setStoreNormaEdit(){
			  var param = formEditUt.getForm().getValues().tipo;
		      	Ext.Ajax.request({  
		                     url: 'consulta_norma.php?tipo=' +param,  
		                     success: function(response)
		                     {
		                     	obj = Ext.util.JSON.decode(response.responseText);
		                     	storeNorma.loadData(obj);
		                     	setNormaEdit();

		                     }
		          });


	      }

	       function setRangeEdit(){
	  		 var tipo = formEditUt.getForm().getValues().tipo;
	  		 calculateRange(tipo);
	  		
	 	   }

	 	    function setNormaEdit(){
	  		  var norma = formEditUt.getForm().getValues().norma;
	  		  calculateNorma(norma);

	  		
	 	   }

	
		  
	  } // end editarUt
	  
	  function reloadStore(param){
	  	
			  	Ext.Ajax.request({  
		                     url: 'consulta_norma.php?tipo=' +param,  
		                     success: function(response)
		                     {
		                     	obj = Ext.util.JSON.decode(response.responseText);
		                     	storeNorma.loadData(obj);
		                     	

		                     }
		          });
		}

	  function overrideStore(param){
	  	storeNorma= new Ext.data.JsonStore({
	    	url: 'consulta_norma.php?tipo=' +param,
	    	root:'data',
	    	fields: [
	    	         {name:'id_norma', mapping:'id_norma',type:'string'},
	    	         {name:'norma',mapping: 'norma',type:'string'},          	         
	    	] ,
	    	autoLoad:true,
	    	listeners:{load:function(){
	    		this.each(function(record, index){console.log(index)});

	    	}}

	    	
		});
	  }

	  function calculateRange(tipo){
	  		 var min, max;
	  		 storeType.each(function(record, index){
	  		 	 if(record.get('id_type') == tipo){
	  		 	 	min = record.get('min');
	  		 	 	max = record.get('max');
	  		 	 }
	  		 

		  		 Ext.apply(Ext.form.VTypes,{  
	    	  
			    	 VRange: function(val, field){ 
			    	 	if(val >= min && val <= max) 
			    		 	return true;
			    		else
			    			return false;
			    	 },
			    	 VRangeText: 'Para este tipo de vehículo ha de ser entre ' + min +' y ' +max, //mensaje de error  
			    	 VRangeMask: /[\d\.]/i
			  
			    });
	  		});
	  }

 		function calculateNorma(norma){

	 	  	var valido = false;
	 	  	 storeNorma.each(function(record, index){
	  		 	if((record.get('id_norma') == norma) || (record.get('norma') == norma)) {
	  		 	 	valido = true;
	  		 	 }
	  		 

		  		 Ext.apply(Ext.form.VTypes,{  
	    	  
			    	 VNorma: function(val, field){ 
			    	 	if(valido){
			    		 return true;
			    	 }
			    	 else return false;
			    	 },
			    	VNormaText: 'Norma no válida para este tipo de vehículo', //mensaje de error  
			    	VNormaMask: /[\d\.]/i
			  
			    });
	  		});
		}

	  
	  
	  // Funcion importar unidades de transportes
	  function importarUt()
	  {
		  
		  // form para importar ut
		  var modos=['Truncar','Actualizar'];
		  var modosUt = new Ext.form.RadioGroup({   
			    fieldLabel: 'Modo',                         
			     columns: 1, //muestra los radiobuttons en dos columnas   
			     items: [   
			          {boxLabel: 'Truncar (Se eliminarán las existentes)', name: 'modoUt', inputValue: 'truncar', checked: true},
			          {boxLabel: 'Actualizar (Se actualizará las existentes)', name: 'modoUt', inputValue: 'actualizar'}
			     ]   
			});
		  var formImporartUt = new Ext.FormPanel({ 
			  labelWidth:110,	
	          url:'importar_ut.php', 
	          frame:true,
	          fileUpload: true,
	          title:'Importar Unidades de Transportes',         
	          monitorValid:true,
	  		  defaults    : {allowBlank: false,width:'300px'},   		  
	  		  bodyStyle:'padding: 15px',
	  		  items:[  			   
				   modosUt,
				   {xtype: 'spacer',height: 10},
				   {
					   xtype:'combo',
	  				   fieldLabel:'Cáracter separación', 	  				      				    
	  				   name:'sepUt', 
	  				   width:125, 
	  				   allowBlank:false,
	  				   store: new Ext.data.SimpleStore({
	  					    fields: ['txt','val'],
	  					    data : [['Coma ( , )',','],['Punto y coma ( ; )',';']]
	  					}),
	  			       valueField: 'val',
	  			       displayField: 'txt',
	  			       hiddenName: 'sepUt',
	  			       mode:'local',
	  			       triggerAction: 'all',  
					   //hideTrigger:true,  
					   editable:false, 
				   },
				   {xtype:'checkbox',name:'pfilaUt',fieldLabel:'Saltar primera fila (nombre campos)'},
	  			   {
	  				   xtype:'textfield',
	  				   fieldLabel:'Archivo CSV', 
	  				   inputType: 'file',   				    
	  				   name:'fCsv', 
	  				   width:200, 
	  				   allowBlank:false
	  				   } 
	  			   ],
	  		buttons:[{ 
	                  text:'Importar',
	                  formBind: true,  
	                  handler:function(){ 
	                	  formImporartUt.getForm().submit({ 
	                          method:'POST', 
	                          waitMsg:'Importando datos...',
	  						  waitTitle:'Espere por favor..',   						
	                          success:function(){                             	 
	                        	  
	                        	  Ext.Msg.show({
	                                  title:'Importación de Transportes',
	                                  fn: function(){
	                                	  WImportarUt.close();
	                                  },
	                                  msg:'Se ha importado con éxito',
	                                  buttons: Ext.Msg.OK,
	                                  icon: 'icoOK'                                
	                               });
	                        	 // Actualizamos el store y grid
	                        	  storeUt.reload();
	                          },
	   
	                          failure:function(form, action){ 
	                              if(action.failureType == 'server'){ 
	                                  obj = Ext.util.JSON.decode(action.response.responseText);
	                                  if(obj.errores.razon=='false') // usuario no logeado
	                                  {
	                                	  desconectar();
	                                  }
	                                  else
	                                  {
	                                  Ext.Msg.show({
	                                      title:'Fallo en la importación',
	                                      msg:obj.errores.razon,
	                                      buttons: Ext.Msg.OK,
	                                      icon: 'icoFail'
	                                   });
	                                  }
	                              }else{ 
	                                  falloServidor(); 
	                              } 
	                        
	                          } 
	                      }); 
	                  } 
	              },
	              { 
	                  text:'Cancelar',                 
	                  handler:function(){	                    
	                	WImportarUt.close();
	                  	 
	                  }
	              }
	  		] 
	             }); 
		  // ventana para importar Ut
		  var WImportarUt = new Ext.Window({	      
	          width:500,
	          closable: false,
	          resizable: false,
	          plain: true,
	          border: false,  
	  		  layout: 'form',        
	          modal: true, //set the Window to modal  
	          items: [formImporartUt]
	      });
	      WImportarUt.show();
	     	  
	  } // end importarUt




	

	
	 
	// Formulario par registrar nuevas unidades de transportes    
	
  function registraUt()
   {  
   	 Ext.apply(Ext.form.VTypes,{  
    	  
		    	 VRange: function(val, field){ 
		    	 if(val >= 1 && val <= 60) 
		    		 return true;
		    		else
		    			return false;
		    	 },
		    	 VRangeText: 'Entre 1 y 60', //mensaje de error  
		    	 VRangeMask: /[\d\.]/i
		  
	   });

   	 	Ext.apply(Ext.form.VTypes,{  
    	  
    	     VNorma: function(val, field){ 
  				return true;
	    	 },
	    	 VNormaText: 'Norma no válida para este tipo de vehículo', //mensaje de error  
	    	 VNormaMask: /[\d\.]/i
	  
	    }); 
	  
	// Formulario para crear nuevas unidades de transportes
      var formNuevoUt = new Ext.FormPanel({ 
          labelWidth:70,		
          url:'registro_ut.php', 
          frame:true, 
          title:'Nueva Unidad de Transporte',         
          monitorValid:true,
  		  defaults    : {allowBlank: false,width:'300px'}, 
  		  defaultType:'textfield',
  		  bodyStyle:'padding: 15px',
  		  items:[
  			   {name:'nombre',fieldLabel:'Nombre'},
  			   {xtype:'checkbox',name:'activo',fieldLabel:'Activo'},
  			   {
  				   xtype:'combo',
  				   id: 'estacionInicio',
  				   name:'estacionInicio',
  				   triggerAction: 'all',  
  				   emptyText:'Selecciona una estación de inicio...',
  				   fieldLabel:'Inicio',
  				   editable:false,
  				   forceSelection:true,  
  				   store:storeEs,
  				   hiddenName: 'estacionInicio',
  				   displayField:'nombre',
  				   valueField: 'id_estaciones'
  			   },
  			   {
  				   xtype:'combo',
  				   id: 'fEF',
  				   name:'estacionFin',
  				   triggerAction: 'all',  
  				   emptyText:'Selecciona una estación de fin...',
  				   fieldLabel:'Fin',
  				   editable:false,
  				   forceSelection:true,  
  				   store:storeEs,
  				   hiddenName: 'estacionFin',    				       				         				   
  				   displayField:'nombre',
      			   valueField: 'id_estaciones'	   
  			       
  			   },
  			   {name:'costeXkm',fieldLabel:'Coste/Km(€)',vtype:'alfa',width:'60px',vtype:'VEntero'},
  			   {name:'costeXdia',fieldLabel:'Coste/dia(€)',vtype:'alfa',width:'60px',vtype:'VEntero'},
  			   {
						   xtype:'combo',
						   name:'tipo',
						   emptyText: 'Selecciona el tipo de vehículo...',
						   triggerAction: 'all',  				   
						   fieldLabel:'Tipo vehículo',
						   editable:false,
						   forceSelection:true,  
						   store:storeType,
						   hiddenName: 'tipo',
						   valueField: 'id_type',
						   displayField:'tipo',
						   listeners:{select:function(){
						   	    formNuevoUt.getForm().findField('norma').focus();
							   	formNuevoUt.getForm().findField('tonelaje').focus();
							   } 
						   } 
					       
				},
				{name:'tonelaje',fieldLabel:'Tonelaje',vtype:'alfa',width:'60px',vtype:'VRange', listeners:{focus:setRange}},
				{
						   xtype:'combo',
						   name:'norma',
						   triggerAction: 'all',  				   
						   fieldLabel:'Antigüedad del vehículo',
						   editable:false,
						   forceSelection:true,  
						   store: storeNorma,
						   hiddenName: 'norma',
						   valueField: 'id_norma',
						   displayField:'norma',
						   vtype:'VNorma',
						   listeners: {
						     focus: function(){
						     	setStoreNorma();
						     },
						     select: setStoreNorma
						 }
					       
					   },
  			   ],
  		buttons:[{ 
                  text:'Guardar',
                  formBind: true,  
                  handler:function(){ 
                  	formNuevoUt.getForm().submit({ 
                          method:'POST', 
                          waitMsg:'Enviando datos...',
  						waitTitle:'Espere por favor..', 
  						
  						 success:function(form, action){
	                            	obj = Ext.util.JSON.decode(action.response.responseText);
	                            //	console.log(obj.datos.id);                        	 
  						    // Se tiene que guardar en el store del grid de transportes
                          	 // Se tiene que guardar en el store del grid de transportes, ya se ha grabado en bd
                          	var vactivo="f";                            	
                          	if(formNuevoUt.getForm().getValues().activo=="on") vactivo="t";                            	
                          	var registro = new storeUt.recordType({  //step 2
                          		id_transportes: obj.datos.id,
                                  nombre   : formNuevoUt.getForm().getValues().nombre,  
                                  activo    : vactivo,  
                                  estacionInicio   : formNuevoUt.getForm().getValues().estacionInicio,  
                                  estacionFin : formNuevoUt.getForm().getValues().estacionFin,                                   
                                  nestacion_inicio   : extraeNombre(formNuevoUt.getForm().findField('estacionInicio')),
                                  nestacion_fin   : extraeNombre(formNuevoUt.getForm().findField('estacionFin')),
                                  coste_x_km   : formNuevoUt.getForm().getValues().costeXkm,
                                  coste_x_dia   : formNuevoUt.getForm().getValues().costeXdia,
                                  tipo : formNuevoUt.getForm().getValues().tipo,                                   
                                  tonelaje   : formNuevoUt.getForm().getValues().tonelaje,

                                  
                              });  
                          	// Insertamos nuevo registro en el store->grid
                          	
                          	storeUt.insert(0,registro);
                          	// Muestra mensaje de exito
                          	Ext.Msg.show({
                                  title:'Registro',
                                  fn: function(){
                                  	WCrearUt.close();
                                  },
                                  msg:'Se ha registrado con éxito',
                                  buttons: Ext.Msg.OK,
                                  icon: 'icoOK'                               
                               });
                          },
   
                          failure:function(form, action){ 
                              if(action.failureType == 'server'){ 
                                  obj = Ext.util.JSON.decode(action.response.responseText);
                                  if(obj.errores.razon=='false') // usuario no logeado
                                  {
                                	  desconectar();
                                  }
                                  else
                                  {
                                  Ext.Msg.show({
                                      title:'Fallo de registro',
                                      msg:obj.errores.razon,
                                      buttons: Ext.Msg.OK,
                                      icon: 'icoFail'
                                   });
                                  }
                              }else{ 
                                  falloServidor(); 
                              } 
                        
                          } 
                      }); 
                  } 
              },
              { 
                  text:'Cancelar',                 
                  handler:function(){
                	formNuevoUt.destroy(); // destruye formulario para que no se duplique campos
                  	WCrearUt.hide();
                  	 
                  }
              }
  		] 
             });  
      
	

      
      // Funcion auxiliar para extrar el name de un combo segun su id(valueField)
      function extraeNombre (combo) {
          var value = combo.getValue();
          var valueField = combo.valueField;
          var record;
          combo.getStore().each(function(r){
              if(r.data[valueField] == value){
                  record = r;
                  return false;
              }
          });

          return record ? record.get(combo.displayField) : null;
      }
      
      
      // Ventana para crear nuevas unidades de transportes
      var WCrearUt = new Ext.Window({	            
          width:500,    
           x:10,	    
          closable: false,
          resizable: false,
          plain: true,
          border: false,  
  		layout: 'form',        
          modal: true, //set the Window to modal  
          items: [formNuevoUt]
      });
      
 
	  	     
	        WCrearUt.show();

	       function setStoreNorma(){
			  var param = formNuevoUt.getForm().getValues().tipo;
			  Ext.Ajax.request({  
		                     url: 'consulta_norma.php?tipo=' +param,  
		                     success: function(response)
		                     {
		                     	obj = Ext.util.JSON.decode(response.responseText);
		                     	storeNorma.loadData(obj);
		                     	setNorma();

		                     }
		          });

	       }

		

	 	    function setNorma(){
	  		  var norma = formNuevoUt.getForm().getValues().norma;
	  		  calculateNorma(norma);

	  		
	 	   }


	       function setRange(){
	  		 var tipo = formNuevoUt.getForm().getValues().tipo;
	  		 calculateRange(tipo);

	 	   }
	    }// fin de registraUt
	    
	//*****************************************************//    
   // ***************** FIN DE TRANSPORTES *****************//
	  //*****************************************************//
	
	
	  
	//*****************************************************//  
   // ***************** ESTACIONES ************************//
   //*****************************************************//
    var mySelectionModel2 = new Ext.grid.CheckboxSelectionModel({singleSelect: false});    
    var index2=0; // indice para coger la fila de la estación(de storeEs) a modificar 
  // Store para estaciones-->Grid de estaciones
    var storeEs = new Ext.data.JsonStore({
    	url: 'consulta_estaciones.php',
    	root: 'data',
    	totalProperty: 'count',
    	fields: [
    	         {name:'id_estaciones',type:'float'},
    	         {name:'nombre',type:'string'},
    	         {name:'lat',type:'string'},
    	         {name:'lon',type:'string'},
    	         {name:'activo',type:'string'},
    	         {name:'direccion',type:'string'}     	         
    	         ] 
	});

    storeEs.load();
    storeUt.load();
 // paginación para estaciones
    var pagerEs = new Ext.PagingToolbar({  
        store: storeEs, // <--grid and PagingToolbar using same store (required)  
        displayInfo: true,  
        displayMsg: '{0} - {1} de {2} Estaciones',  
        emptyMsg: 'No hay estaciones',  
        pageSize: 1        
    }); 
  //creando grid para estaciones
	var gridEs = new Ext.grid.GridPanel({		
		store: storeEs,
		width:alto, // el ancho
	//	layout: 'fit', // para ajustar a todo el tamaño del panel
		columns: [			
		  	mySelectionModel2, //checkbox for 
		  	{id:'nombre',header:'Nombre', dataIndex:'nombre',sortable: true,width:150},
			{id:'dirección',header:'Dirección', dataIndex:'direccion',sortable: false,width:270},			
			{id:'activo',header:'Activo', dataIndex:'activo', width:50,sortable: true,renderer:codBoolean},
			{
                xtype: 'actioncolumn',
                width: 70,
                items: 
                	[
                	 {
                		icon: 'img/edit.png',                 	 
 	                    tooltip: 'Editar',
 	                    handler: editarEs
                 	 },
                 	 {
                 		icon: 'img/delete.png', 
 	                    tooltip: 'Eliminar', 	                    
 	                    handler: eliminarEs
                 	 }
                    ]
            }
			
		],
		sm: mySelectionModel2,
		stripeRows: true,
		height:250,
		width:650,
		listeners : {
			rowclick : function(grid,rowIndex,e){
					var estacion = gridEs.getStore().getAt(rowIndex).data;
					//showMarker(estacion.lon, estacion.lat, estacion.direccion);
					var layers = []; 
		            var markersCluster = markers.clusterGroup.getLayers();
		            var markersNoCluster = markers.noClusterGroup.getLayers();

		            // Recorrer cluster
		            var i;
		            for (i = 0; i < markersCluster.length; i++) {
		               layers.push(markersCluster[i]);               
		            }

		            for (i = 0; i < markersNoCluster.length; i++) {
		               layers.push(markersNoCluster[i]);
		            }
		            for(i= 0; i < layers.length;i++){
						if(layers[i].feature.id == estacion.id_estaciones){	
							map.setView(layers[i].getLatLng(),14);
						}
					}

			},

		}
		

	});


	

	
	 // Elimina una estacion	
	  function eliminarEs(grid, rowIndex, colIndex)
	  {
		  //alert("Eliminando.. " + rec.get('id_transportes'));
		   var rec = storeEs.getAt(rowIndex);	   
		   var nt=rec.get('nombre');	  
		   Ext.Msg.confirm('Confirmación','¿Estás seguro de querer eliminar la estación ' + nt + '?',function(btn){  
		      if(btn === 'yes'){  
		    	  
		    	     // Se pone campo borrado de la estación a true
	                 var idt=rec.get('id_estaciones');
	                 Ext.Ajax.request({  
	                     url: 'eliminar_es.php',  
	                     params:{id:idt}, //se envia el id de la estacion  
	                     success: function()
	                     {
	                    	 // se borra el record del store
	        	    	     storeEs.remove(rec);
	        	    	     // se recarga los transportes si sus estaciones (inicio o fin) tiene esta estacion a eliminar
	        	    	     storeUt.reload();
	        	    	     
	        	    	  //   console.log(c1);
	        	    	  var layers = []; 
			            var markersCluster = markers.clusterGroup.getLayers();
			            var markersNoCluster = markers.noClusterGroup.getLayers();

			            // Recorrer cluster
			            var i;
			            for (i = 0; i < markersCluster.length; i++) {
			               layers.push(markersCluster[i]);               
			            }

			            for (i = 0; i < markersNoCluster.length; i++) {
			               layers.push(markersNoCluster[i]);
			            }
			            for(i= 0; i < layers.length;i++){
							if(layers[i].feature.id == idt){	
								markers.removeLayer(layers[i]);
							}
						}
	        	    	     
	        	    	     
	                     },  
	                     failure:function(form, action){ 
	                         if(action.failureType == 'server'){ 
	                             obj = Ext.util.JSON.decode(action.response.responseText);
	                             if(obj.errores.razon=='false') // usuario no logeado
	                             {
	                            	 desconectar();
	                             }
	                             else
	                             {
	                             Ext.Msg.show({
	                                 title:'Fallo de registro',
	                                 msg:obj.errores.razon,
	                                 buttons: Ext.Msg.OK,
	                                 icon: 'icoFail'
	                              });
	                             }
	                         }else{ 
	                             falloServidor(); 
	                         } 
	                   
	                     } ,  
	                     scope:this  
	                 });
	                    	     
		              
		        }  
		    }); 
		    
	      
	  }
	  
	  // campo compuesto(Coordeanadas) para los formularios de estaciones
	  function coordenadas()
	    {
	    		return{
	    			xtype		: "compositefield",
	    			hideLabel : true,
	    			defaults	: {allowBlank: false},	    			
	    			width: 'auto',
	    			border		: false,
	    			items		: [	
	    			     		 
	    			     		{
									xtype : "displayfield", 
									value:" ",
									width:11,
									style:'margin-top:4;'
									
								},   
	    			     	  	{
	    			     			xtype : "displayfield", 
	    			     			value:"Latitud: ",
	    			     			width:39,
	    			     			style:'margin-top:4;'
	    			     			
	    			     	 	},
	    						{
	    			     	 		xtype : "textfield", 
	    			     	 		name : "lat",
	    			     	 		id: 'lat',
	    			     	 		width: 110,
	    			     	 		readOnly:true,    			     	 		
	    			     	 		cls: 'campoDeshabilitado',
	    			     	 		value: '',
	    			     	 		allowBlank: true
	    							
	    			     	 	},   
	    			     	 	{
	    			     			xtype : "displayfield", 
	    			     			value:" ",
	    			     			width:5,
	    			     			style:'margin-top:4;'
	    			     			
	    			     	 	},
	    						{
	    							xtype : "displayfield", 
	    						    value:" Longitud: ",
	    						    width:60,
	    						    style:'margin-top:4;'
	    						    
	    						},
	    						{
	    							xtype : "textfield", 
	    							name : "lon", 
	    							id: 'lon',
	    							width: 110,
	    							readOnly:true,    						
	    							cls: 'campoDeshabilitado',
	    							value: '',
	    							allowBlank: true
	    								
	    						}
	    						
	    						
	    						
	    					]
	    		};
	    }
	  
	  // Editar info de las estaciones
	  function editarEs(grid, indice, colIndex)
	  {
		index2=indice; // recojo el indice de la fila en el grid y storeEs 
		registerPoint(map, iconStation);		
		function guardaStoreEs()
		{		
			var idEs = storeEs.getAt(indice);
			idEs.set('nombre', formEditEs.getForm().getValues().nombre);
			idEs.set('direccion', formEditEs.getForm().getValues().direccion);
			idEs.set('lat', formEditEs.getForm().getValues().lat);
			idEs.set('lon', formEditEs.getForm().getValues().lon);	    	
	    	var vactivo="f";
	    	if (formEditEs.getForm().getValues().activo=="on") vactivo="t";	    		    		
	    	idEs.set('activo', vactivo);
	    	//storeEs.reload();
	    //	 console.log("EN EDITAR:" + storeEs.getAt(13).get('nombre') + "=" + storeEs.getAt(13).get('activo'));
	    	//storeEs.load();
	    //	console.log(storeEs);	    	
	    	WEditEs.close();
	    	markers.unload();
	    	markers.load();
		}
		   // Formulario par registrar nuevas unidades de transportes
	    
	    
	    var formEditEs = new Ext.FormPanel({ 
			    labelWidth:55,		
	            url:'actualiza_es.php', 
	            frame:true, 
	            title:'Editar Estación',         
	            monitorValid:true,
	    		defaults    : {allowBlank: false}, 
	    		defaultType:'textfield',
	    		bodyStyle:'padding: 15px',
	    		items:[
	    			   {name:'nombre',fieldLabel:'Nombre',width:322},
	    			   {xtype: 'spacer',height: 5},
	    			   {xtype:'checkbox',name:'activo',fieldLabel:'Activo',id:'EActivoUt'},
	    			   {xtype: 'spacer',height: 5},
	    			   {
	    				   xtype: 'label',
	    				   html:'Pulse en el mapa para situar la estación',
	    				   cls:'pulse'
	    				   
	    			   },	    			   
	    			   {xtype: 'spacer',height: 7},
	    			   new Ext.Panel({
	    				   cls: 'capa_no_editable',
	    				   width:'auto',
	    				   height:100,
	    				   layout:'form',
	    				   items:[
	    				                 coordenadas(),
	    				                 {xtype: 'spacer',height: 5},
	    				    			 {
	    				                	   xtype:'textfield',
	    				    				   name:'direccion',
	    				    				   id:'direccion',
	    				    				   fieldLabel:'Dirección',	    				    				   
	    				    				   readOnly:true,
	    				    				   value:'',
	    				    				   width:300,
	    				    				   cls: 'campoDeshabilitado' 
	    				    			   }	    				          
	    				          ]
	    			   }),
	    			   {xtype:'hidden',name:'id_estaciones',id:'id_estaciones'}
	    			   ],
	    		buttons:[{ 
	                    text:'Guardar',
	                    formBind: true,  
	                    handler:function(){ 
	                    	formEditEs.getForm().submit({ 
	                            method:'POST', 
	                            waitMsg:'Enviando datos...',
	    						waitTitle:'Espere por favor..', 
	                            success:guardaStoreEs,
	                            failure:function(form, action){ 
	                                if(action.failureType == 'server'){ 
	                                    obj = Ext.util.JSON.decode(action.response.responseText);
	                                    if(obj.errores.razon=='false') // usuario no logeado
	                                    {
	                                    	desconectar();
	                                    }
	                                    else
	                                    {
	                                    Ext.Msg.show({
	                                        title:'Fallo de registro',
	                                        msg:obj.errores.razon,
	                                        buttons: Ext.Msg.OK,
	                                        icon: 'icoFail'
	                                     });
	                                    }
	                                }else{ 
	                                    falloServidor(); 
	                                } 
	                          
	                            } 
	                        }); 
	                    } 
	                },
	                { 
	                    text:'Cancelar',                 
	                    handler:function(){
	                    	
	                    	
	                    	if(storeEs.getAt(index2).get('activo')==1) storeEs.getAt(index2).set('activo','t');
		                	else storeEs.getAt(index2).set('activo','f');	                    	
	                        formEditEs.destroy();	                    	
	                    	WEditEs.hide();

	                    	
	                    }
	                }
	    		] 
		       });  
		  // Ventana para editar  estaciones
		    var WEditEs = new Ext.Window({
		        layout:'fit',
		        width:500,	
		        x:10,	        	      
		        closable: false,
		        resizable: false,
		        plain: true,
		        border: false,  
				layout: 'form',        
		        modal: false, //set the Window to modal  
		        items: [formEditEs]
		    });
		    
		  
	      var fila2 = storeEs.getAt(indice); // storeUt->recogemos la fila afectada
	    //  console.log(storeEs.getAt(indice));
	   // acomodo del valor de activo para el checkbox del formulario de editar
		  var valorActivo1=0;
		  if(fila2.get('activo')=='t') valorActivo1=1;
		  fila2.set('activo',valorActivo1);
		  // cargamos el storeUt en el formulario
		  formEditEs.getForm().loadRecord(fila2);
		  WEditEs.show();

		  
	  } // end editarEs
	  

	  
	  // Importar estaciones
	  // Funcion importar estaciones
	  function importarEs()
	  {
		  
		  var modosEs = new Ext.form.RadioGroup({   
			    fieldLabel: 'Modo de importación',                         
			     columns: 1, //muestra los radiobuttons en dos columnas   
			     items: [   
			          {boxLabel: 'Truncar (Se eliminarán las existentes)', name: 'modoEs', inputValue: 'truncar', checked: true},
			          {boxLabel: 'Actualizar (Se actualizará las existentes)', name: 'modoEs', inputValue: 'actualizar'}
			     ]   
			});
		 
		
		  
		  // form para importar ut		 
		  var formImporartEs = new Ext.FormPanel({ 
	          labelWidth:110,		
	          url:'importar_es.php', 
	          frame:true,
	          fileUpload: true,
	          title:'Importar Estaciones',         
	          monitorValid:true,
	  		  defaults    : {allowBlank: false,width:'300px'},   		  
	  		  bodyStyle:'padding: 15px',
	  		  items:[  			   
				   modosEs,
				   {xtype: 'spacer',height: 10},
				   {
					   xtype:'combo',
	  				   fieldLabel:'Cáracter separación', 	  				      				    
	  				   name:'sep', 
	  				   width:125, 
	  				   allowBlank:false,
	  				   store: new Ext.data.SimpleStore({
	  					    fields: ['txt','val'],
	  					    data : [['Coma ( , )',','],['Punto y coma ( ; )',';']]
	  					}),
	  			       valueField: 'val',
	  			       displayField: 'txt',
	  			       hiddenName: 'sep',
	  			       mode:'local',
	  			       triggerAction: 'all',  
					   //hideTrigger:true,  
					   editable:false, 
				   },
				   {xtype:'checkbox',name:'pfila',fieldLabel:'Saltar primera fila (nombre campos)'},
	  			   {
	  				   xtype:'textfield',
	  				   fieldLabel:'Archivo CSV', 
	  				   inputType: 'file',   				    
	  				   name:'fCsv', 
	  				   width:200, 
	  				   allowBlank:false
	  				   }
	  			   ],
	  		buttons:[{ 
	                  text:'Importar',
	                  formBind: true,  
	                  handler:function(){ 
	                	  formImporartEs.getForm().submit({ 
	                          method:'POST', 
	                          waitMsg:'Importando datos...',
	  						  waitTitle:'Espere por favor..',   						
	                          success:function(){                             	 
	                        	  
	                        	  // nombre   : formNuevoUt.getForm().getValues().modoImpUt,
	                        	  Ext.Msg.show({
	                                  title:'Importación de Estaciones',
	                                  fn: function(){
	                                	  WImportarEs.close();
	                                  },
	                                  msg:'Se ha importado con éxito',
	                                  buttons: Ext.Msg.OK,
	                                  icon: 'icoOK'                              
	                               });
	                        	  storeEs.reload();
	                        	  storeUt.reload();
	                          },
	   
	                          failure:function(form, action){ 
	                              if(action.failureType == 'server'){ 
	                                  obj = Ext.util.JSON.decode(action.response.responseText);
	                                  if(obj.errores.razon=='false') // usuario no logeado
	                                  {
	                                	  desconectar();
	                                  }
	                                  else
	                                  {
	                                  Ext.Msg.show({
	                                      title:'Fallo en la importación',
	                                      msg:obj.errores.razon,
	                                      buttons: Ext.Msg.OK,
	                                      icon: 'icoFail'
	                                   });
	                                  }
	                              }else{ 
	                                  falloServidor(); 
	                              } 
	                        
	                          } 
	                      }); 
	                  } 
	              },
	              { 
	                  text:'Cancelar',                 
	                  handler:function(){                	  
	                	//formImporartEs.hide();
	                	WImportarEs.close();                	
	                	 
	                  }
	              }
	  		] 
	             }); 
		  // ventana para importar Estaciones
		  var WImportarEs = new Ext.Window({
	     //    layout:'fit',
	         width:500,
	         autoHeight:true,
	          id:'CImportarEs',
	       //   x:20,
	       //   y:135,
	          closable: false,
	          resizable: false,
	          plain: true,
	          border: false,  
	  		  layout: 'form',        
	          modal: true,  
	         items: [formImporartEs]
	      });
		  
		  formImporartEs.show();
	      WImportarEs.show();
	      	  
	  } // end importarEs
	  
	  // Formulario par registrar nuevas estaciones
	    
	    
	    function registraEs()
	    {
	    	registerPoint(map, iconStation);
	    	// Formulario para crear nuevas unidades de transportes
	        var formNuevoEs = new Ext.FormPanel({ 
	            labelWidth:55,		
	            url:'registro_es.php', 
	            frame:true, 
	            title:'Nueva Estación',         
	            monitorValid:true,
	    		defaults    : {allowBlank: false}, 
	    		defaultType:'textfield',
	    		bodyStyle:'padding: 15px',
	    		items:[
	    			   {name:'nombre',id:'nombre',fieldLabel:'Nombre',width:'322px'},
	    			   {xtype: 'spacer',height: 5},
	    			   {xtype:'checkbox',name:'activo',fieldLabel:'Activo'},
	    			   {xtype: 'spacer',height: 5},
	    			   {
	    				   xtype: 'label',
	    				   html:'Pulse en el mapa para situar la estación',
	    				   cls: 'pulse'	    				
	    			   },
	    			   {xtype: 'spacer',height: 7},
	    			   new Ext.Panel({
	    				   cls: 'capa_no_editable',
	    				   width:'auto',
	    				   height:100,
	    				   layout:'form',
	    				   items:[
	    				                 coordenadas(),	    
	    				                 {xtype: 'spacer',height: 5},
	    				    			 {
	    				                	   xtype:'textfield',
	    				    				   name:'direccion',
	    				    				   id:'direccion',
	    				    				   fieldLabel:'Dirección',	    				    				   
	    				    				   readOnly:true,
	    				    				   value:'',
	    				    				   width:300,
	    				    				   cls: 'campoDeshabilitado' 
	    				    			   }	    				          
	    				          ]
	    			   })
	    			   
	    			/*  
	    			   {xtype: 'spacer',height: 15},
	    			   coordenadas(),    			
	    			   {xtype: 'spacer',height: 5},
	    			   {
	    				   name:'direccion',
	    				   id: 'direccion',
	    				   fieldLabel:'Dirección',
	    				   readOnly:true,
	    				   value:'',
	    				   cls: 'campoDeshabilitado' 
	    			   },
	    			   */
	    			   ],
	    		buttons:[{ 
	                    text:'Guardar',
	                    formBind: true,  
	                    handler:function(){ 
	                    	formNuevoEs.getForm().submit({ 
	                            method:'POST', 
	                            waitMsg:'Enviando datos...',
	    						waitTitle:'Espere por favor..', 
	    						
	                            success:function(form, action){
	                            	obj = Ext.util.JSON.decode(action.response.responseText);
	                            //	console.log(obj.datos.id);
	    						    // Se tiene que guardar en el store del grid de transportes
	                            	 // Se tiene que guardar en el store del grid de transportes, ya se ha grabado en bd
	                            	var vactivo="f";                            	
	                            	if(formNuevoEs.getForm().getValues().activo=="on") vactivo="t";                            	
	                            	var registro = new storeEs.recordType({  //step 2
	                            		// hay que meter el nuevo index de estaciones
	                            		id_estaciones: obj.datos.id,
	                                    nombre   : formNuevoEs.getForm().getValues().nombre,  
	                                    activo    : vactivo,  
	                                    direccion   : formNuevoEs.getForm().getValues().direccion,  
	                                    lat : formNuevoEs.getForm().getValues().lat,
	                                    lon : formNuevoEs.getForm().getValues().lon
	                                                                        
	                                });  
	                            	// Insertamos nuevo registro en el store->grid
	                            	
	                            	storeEs.insert(0,registro);
	                            	// Muestra mensaje de exito
	                            	Ext.Msg.show({
	                                    title:'Registro',
	                                    fn: function(){
	                                    	WCrearEs.close();
	                                    },
	                                    msg:'Se ha registrado con éxito',
	                                    buttons: Ext.Msg.OK,
	                                    icon: 'icoOK'                                
	                                 });

							       if(markerClick){
			                    		map.removeLayer(markerClick);
		                    		}
		                    		map.off('click');
							        var feature = {
											type: 'Feature',
											id: obj.datos.id,
											geometry:{
												type: 'Point',
												coordinates:[markerClick.getLatLng().lng, markerClick.getLatLng().lat]
											},
											properties:{
												nombre: formNuevoEs.getForm().getValues().nombre,
												activo: vactivo,
												direccion: formNuevoEs.getForm().getValues().direccion,
											}
											
									}


      								 markers.addMarkerFromFeature(feature);
	                            },
	     
	                            failure:function(form, action){ 
	                                if(action.failureType == 'server'){ 
	                                    obj = Ext.util.JSON.decode(action.response.responseText);
	                                    if(obj.errores.razon=='false') // usuario no logeado
	                                    {
	                                    	desconectar();
	                                    }
	                                    else
	                                    {
	                                    Ext.Msg.show({
	                                        title:'Fallo de registro',
	                                        msg:obj.errores.razon,
	                                        buttons: Ext.Msg.OK,
	                                        icon: 'icoFail'
	                                     });
	                                    }
	                                }else{ 
	                                    falloServidor(); 
	                                } 
	                          
	                            } 
	                        }); 
	                    } 
	                },
	                { 
	                    text:'Cancelar',                 
	                    handler:function(){
	                    	formNuevoEs.destroy();
	                    	WCrearEs.hide();
	                    	if(markerClick){
	                    		map.removeLayer(markerClick);
	                    		markerClick = null;
                    		}
                    		map.off('click');
	                    }
	                }
	    		] 
	               });  
	   
	        
	        
	        
	        // Ventana para crear nuevas unidades de transportes
	        var WCrearEs = new Ext.Window({
	            layout:'fit',
	            width:500,
	            x:10,	            
	            closable: false,
	            resizable: false,
	            plain: true,
	            border: false,  
	    		layout: 'form',        
	            modal: false, //set the Window to modal  
	            items: [formNuevoEs]
	        });
	        WCrearEs.show();
	    }
	  
   //*****************************************************//	  
   //****************** FIN DE ESTACIONES ****************//
   //*****************************************************//
    
	    
	    
   //*****************************************************//	  
   //****************** CALCULO RUTAS *** ****************//
   //*****************************************************//
	    
	    
	    
 // Formulario para calcular ruta de cada transporte
	    
	    var fechaForm=new Ext.form.DateField({  
	        fieldLabel: 'Fecha de inicio',  	          
	        editable:false,
	        format:'d-m-Y',
	        name:'dia',
	        name: 'fechaInicio',
	        id: 'fechaInicio',
	       // minValue: new Date(), //<-- min date is today  	          
	        value:new Date() // <-- a default value  
	    }); 
	    
	    var tiempoForm=new Ext.form.TimeField({                        
	       fieldLabel: 'Hora de inicio',  
	       //minValue: '4:00',  
	       //maxValue: '23:59',  
	       increment: 1, // cada minuto
	       width:70,
	       format:'H:i',  
	       name:'hora',
	       editable:false,
	       value:'h:i',
	       name: 'horaInicio',
           id: 'horaInicio',
           value:new Date()
	  });
	    
	    var FormCalcRuta = new Ext.FormPanel({ 
            labelWidth:40,		
            url:'calculo.php', 
            frame:true,                     
            monitorValid:true,
    		defaults    : {width:'20px'}, 
    		defaultType:'textfield',
    		bodyStyle:'padding: 15px',
    		items:[     		       	
    		        {  
					    xtype    : "compositefield",
					    hideLabel: true,					      
					    border   : false,  
					    items    : [ 
						            {
									    xtype : "displayfield", 
									    value:"Fecha Inicio:",
									    width: 70,
									    style:'margin-top:3px'									    
									},
					                fechaForm,
									   {
						                   xtype : "displayfield", 
						                   value:"",
						                   width: 20
						               },
						               {
						                   xtype : "displayfield", 
						                   value:"Hora inicio:",
						                   width: 65,
						                   style:'margin-top:3px'
						                  
						                	   
						              },
						              tiempoForm,
					                  {
					                    xtype : "displayfield", 
					                    value:" ",
					                    width: 20					                    
					                  },
					                  {
					                      xtype: 'button',
					                      text: 'Calcular',
					                      width:80,
					                      style:'font-size:14px',
					                      listeners     :
					                        {
					                            'click': function(){
					                            	var f=Ext.getCmp('fechaInicio').getValue();
					                            	var h=Ext.getCmp('horaInicio').getValue();
					                            	
					                            	if((f=="")||(h=="")) 
					                            		{					                            		
					                            		Ext.Msg.show({  
					                            	        title: 'Error', //<- el título del diálogo  
					                            	        msg: 'Se debe seleccionar tanto fecha como hora de inicio',  
					                            	        buttons: Ext.Msg.OK, //<- Botones de SI y NO  
					                            	        icon: 'icoFail'  
					                            	         
					                            	    }); 
					                            		}
					                            	else  // se envia los datos para el cálculo
					                            	{
					                            		
					                            		//storeRutas.removeAll(false);
					                            		gridRuta.hide(); // eliminamos resultados anteriores					                            		
					                            		Ext.MessageBox.show({
					                            			title: 'Cálculo Ruta',
					                                        msg: 'Espere por favor .....',					                                        
					                                        width:300,
					                                        wait:true					                                        					                                        
					                                     });
						                                
						                               	 calculo(f,h);
						                                     
						                               			                                 
					                            	}
					                            }
					                        } 
					                  }
							        ]
					    
                     }]
               });  
	    
	  
	   
	   
	   // Función que calcula la ruta(secuencias de estaciones) recibe la fecha y hora de inicio
	   
	    function calculo(fecha,hora)
	    {	
	    	vehiculos = {};
	    	//gridResRutas.hide();
	    	if(vector && vector._map){
		  	      	vector.onRemove(map);
		  	 }
	    	 markers.deleteTree = true;
	    	 map.removeLayer(markers);
	    	 markers =  new SMC.layers.markers.MarkerLayer({
				label: 'Estaciones actuales',
				stylesheet: stylesheetStations
			});
	    	markers.load = function(){

				$.ajax({
					type: "GET",
					url: 'consulta_estaciones.php',
					success: function(response){
						var features = response.data;
						for(var f in features){
							features[f] = {
								type: 'Feature',
								id: features[f].id_estaciones,
								geometry:{
									type: 'Point',
									coordinates:[features[f].lon, features[f].lat]
								},
								properties:{
									nombre: features[f].nombre,
									activo: features[f].activo,
									direccion: features[f].direccion
								}
								
							}
						}
						markers.addMarkerFromFeature(features);
					}
				})
			}
		    map.addLayer(markers);
	    	
	    	 console.log("Borrado de mascaras en mapa");
	    	  var activosE=new Array(); // Array con las estaciones activas(por donde debe pasar)
	  		 var activosUt=new Array(); // Array de transportes activos(transportes a usar)
	  	     arrTrans = [];
	 	     //cleanRoutes();	 	   
	    	 activosE=new Array(); 
	    	 //console.log(storeEs);
	    	 // creamos el array de objetos de estaciones activas, el índice del array es autonumerico (NO TOCAR)
	    	// console.log("EN CALCULO:" + storeEs.getAt(13).get('nombre') + "=" + storeEs.getAt(13).get('activo'));
	    	
	    	 var ji="";
	    	 console.log("EN BUCLE:" );
	    	 storeEs.each(function(record,index)
  		    		{  	    		        
	    		                 
	    		         console.log(record.get('nombre') +  "=" + record.get('activo') + "\n");  
  				         if(record.get('activo')!='t') var ji=""; 
  				         else
  				    	   {	  				        	
  				        	  activosE.push(  				        	  
  				        	  {
  									id_estaciones: record.get('id_estaciones'),
  									nombre:record.get('nombre'),
  									lat:record.get('lat'),
  									lon:record.get('lon')
  								});
  				        	 
  								  
  				    	   }
  		    	 
  		    		});
	    	// console.log("ARRAY ACTIVOS: ");
	    //	 console.log(activosE);
	    	 
	    	 if(activosE.length<2)
		    	{
		    		Ext.MessageBox.hide();
		    		Ext.Msg.show({  
	        	        title: 'Error', //<- el título del diálogo  
	        	        msg: 'No hay suficientes estaciones activas',  
	        	        buttons: Ext.Msg.OK, //<- Botones de SI y NO  
	        	        icon: Ext.Msg.WARNING,
	        	        fn : function() { Ext.MessageBox.hide(); }
	        	    });
		    		return false;
		    	}
	    	 
	    	 
	    	 
	    	 
	    	 // Solo para TSP(1 unico transporte, primero del store que este activo)	    	
	    	
	    	 storeUt.each(function(record,index)
	  		    		{  	  		    	        	  		    	       
	  				         if(record.get('activo')=='t')   
	  				    	   {	  		  				        	 
	  				        	 activosUt.push( 				        	  
	  				        	  {
	  				        			id_transportes: record.get('id_transportes'),
	  									nombre:record.get('nombre'),
	  									estacionInicio:record.get('estacionInicio'),
	  									estacionFin:record.get('estacionFin'),
	  									coste_x_dia:record.get('coste_x_dia'),
	  									coste_x_km:record.get('coste_x_km')
	  								});
	  				        	     // Solo para el TSP, cortamos en el primer transporte	  				        	     
	  				        	     //return false; // cortamos each para devolver el primer transporte activo(tsp)
	  				        	     // Fin solo para TSP	  				        	      
	  				    	   }
	  				           	  				       
	  		    	 
	  		    		});
	    	
	    	 
	    	 
	    	 // comprobamos el nº de transportes activos(al menos 1)
	    	 if(activosUt.length<1)
		    	{
		    		Ext.MessageBox.hide();
		    		Ext.Msg.show({  
	        	        title: 'Error', //<- el título del diálogo  
	        	        msg: 'No hay suficientes transportes activos',  
	        	        buttons: Ext.Msg.OK, //<- Botones de SI y NO  
	        	        icon: Ext.Msg.WARNING,
	        	        fn : function() { Ext.MessageBox.hide(); }
	        	    });
		    		return false;
		    	}
	    	 
	    	 // En activosE y activosUt tenemos arrays(de objetos) con las estaciones y transportes activos
	    	 
	    	 	 var stops = new Array(activosE.length);
	    	 	 for(var e = 0;e < activosE.length; e++){
	    	 	 	stops[e]= {};
	    	 	 	stops[e].id = activosE[e].id_estaciones;
	    	 	 	stops[e].name = activosE[e].nombre;
	    	 	 	stops[e].latitude = activosE[e].lat;
	    	 	 	stops[e].longitude = activosE[e].lon; 
	    	 	 }

	    	 	 var vehicles = new Array(activosUt.length);
	    	 	 for( var v = 0; v < activosUt.length; v++){
	    	 	 	vehicles[v] = {};
	    	 	 	vehicles[v].id = activosUt[v].id_transportes;
	    	 	 	vehicles[v].name = activosUt[v].nombre;
	    	 	 	for(var i in activosE){
	    	 	 		if(activosE[i].id_estaciones == activosUt[v].estacionInicio){
	    	 	 			vehicles[v].origin = stops[i];
	    	 	 		}
	    	 	 		if(activosE[i].id_estaciones == activosUt[v].estacionFin){
	    	 	 			vehicles[v].target = stops[i];
	    	 	 		}
	    	 	 	}
	    	 	 	vehicles[v].costPerDistance = activosUt[v].coste_x_km;
	    	 	 	vehicles[v].costPerTime = activosUt[v].coste_x_dia;

	    	 	 }
	    	     
	    	    

	    	      Ext.Ajax.request({
	    	    	  url: 'calculo.php',
	    	    	  jsonData: Ext.util.JSON.encode({fecha: fecha, hora: hora, vehicles:vehicles, stops: stops}),
	    	    	  success: function(action) 
	    	    	  { 	 
	    	    		  Ext.MessageBox.hide(); // Eliminamos el mensaje de calculando..
	    	    		  
	    	    		  obj = Ext.util.JSON.decode(action.responseText);
	    	    		  if(obj.success)
	    	    		  {
	    	    			


	    	            	 Ext.Ajax.request({
					  	    	  url: 'recupera_ruta.php',
					  	    	  params: { id_ruta: obj.idRuta },
					  	    	  success: function(action) 
					  	    	  { 	 
					  	    		  Ext.MessageBox.hide(); // Eliminamos el mensaje de calculando..	
					  	    		  obj = Ext.util.JSON.decode(action.responseText);
					  	    		  if(obj.success)
					  	    		  {  	

					  	    		  	 Ext.Ajax.request({  
						                     url: 'consulta_transportes.php',  
						                     
						                     success: function(response)
						                     {
						                     	var d = new Date(Ext.getCmp('fechaInicio').getValue());
	    										hora_inicio = (d.getMonth()+1)+'/' +d.getDate() +'/' + d.getFullYear() +' ' + Ext.getCmp('horaInicio').getValue();
						                    	 var transportes = Ext.util.JSON.decode(response.responseText);
						                    	 var datosJson=obj.datos; // se tiene el json
						                    	 for(var i = 0; i < datosJson.datos.length; i++){
						                    	 	for(var t = 0; t < transportes.data.length; t++){
						                    	 		if(transportes.data[t].id_transportes == datosJson.datos[i].idtransporte){
						                    	 			datosJson.datos[i].coste_vehiculo = transportes.data[t].coste_x_dia;
						                    	 			datosJson.datos[i].tipo_vehiculo = transportes.data[t].tipo;
						                    	 			datosJson.datos[i].tonelaje_vehiculo = transportes.data[t].tonelaje;
						                    	 			datosJson.datos[i].norma_vehiculo = transportes.data[t].norma;
						                    	 		}
						                    	 	}
						                    	 }	    	    			   
							  	    			 storeRutas.loadData(datosJson); 
							  	    			 drawRoute(datosJson); 	    			 
							  	          	     storeFechasRes.load();
			    	            	 			 storeFechas.load();
			    	            	 			 var summary = new Ext.ux.grid.GroupSummary(); 
			    	            	 			 summary.init(gridRuta);
			    	            	 			 gridRuta.plugins.push(summary);
			    	            	 			 gridRuta.getView().refresh();
			    	            	 			 storeEcocostes.removeAll();
			    	            	 			 gridRuta.show();
			    	            	 			 panelEco.store.removeAll();
			    	            	 			 panelEco.show();        	   
							  	          	     
							  	                 Ext.MessageBox.hide();			 
						                     } 
						                 });
	                    

					  	    			 
					  	                
					  	    		  }
					  	    		}
					  	   
	    	            	
	    	            	  }); 
	    	            	

	    	                
	    	    		  }
	    	    		  else
	    	    		  {
	    	    			  if(obj.errores.razon=='false') // usuario no logeado
	                          {	                            	
	                         	 desconectar();
	                          }
	                          else
	                          {
	                          Ext.Msg.show({
	                              title:'Aviso',
	                              msg:obj.errores.razon,
	                              buttons: Ext.Msg.OK,
	                              icon: Ext.Msg.WARNING
	                           });
	                          }    
	    	    		  }
	    	    		 
	    	    	  },
	    	    	  failure:function(){ 
	                        
	                             falloServidor();	
	                             
	                   
	                     }, scope:this  
	    	    	  
	    	    	  });
	    	      
	    	 
	    }
	    

	 
	    function escribeTrayecto(value, metaData, record, rowIndex, colIndex, store)
		{	//alert(record.get('activo'));	
			
	    	if(rowIndex >= 0){
		    	var paso=storeRutas.getAt(rowIndex).get('objFin').nombre; // nombre estacion de paso	    	
		    	return value.nombre + "->" + paso;
		    }
		    else{
		    	return 'TOTAL (añadido coste/día)';
		    }
	    	
		}
	    
	     function sumCoste(value, metaData, record, rowIndex, colIndex, store){
			var coste_dia = record.data.coste_dia;
			var transporte = record.data.transporte;
			value = value + (coste_dia * vehiculos[transporte].fechas.length);
			value = value.toFixed(2);
	    	return value + " €";
				
		}  
	 
	 	
		function getIndex(value){
	    	var trans = value.transporte;
	    	var exist= false;
	    	if(arrTrans.length == 0){
	    		arrTrans.push(trans);
	    		return 0;
	    	}
	    	for(var t in arrTrans){
	    		if(arrTrans[t] == trans){
	    			exist= true;
	    			
	    		} 
	    	}
	    	if(!exist){
	    		arrTrans.push(trans);
	    		return 0;
	    	}
	    	else{
	    		return 1;
	    	}
		}
    
	 // JsonReader readResponse FIX
        

	     var myReader = new Ext.data.JsonReader({	        
	    	root : 'datos',
	     //	autoLoad: false,
	    //    idProperty: 'idtransporte',
	        totalProperty: 'count',	        
	        fields: [
	            
						{name: 'objInicio',mapping: 'objInicio',type: 'object'},
						{name: 'objFin',mapping: 'objFin',type: 'object'},
						{name: 'hora',mapping: 'hora', type: 'string'},
						{name: 'coste',mapping: 'coste', type: 'float'},
						{name: 'km',mapping: 'km', type: 'float'},	       
						{name: 'transporte',mapping: 'transporte',type: 'string'},
						{name: 'idtransporte',mapping: 'idtransporte',type: 'float'},
						{name: 'pasos',mapping: 'pasos',type: 'object'},
						{name: 'coste_vehiculo',mapping: 'coste_vehiculo', type: 'float'},
						{name: 'tipo_vehiculo',mapping: 'tipo_vehiculo', type: 'string'},
						{name: 'tonelaje_vehiculo',mapping: 'tonelaje_vehiculo', type: 'float'},
						{name: 'norma_vehiculo',mapping: 'norma_vehiculo', type: 'string'},
						{name: 'groupIndex', mapping: getIndex, type: 'float'},
				
	        ]
	    });
	    
	        
	   
	    var storeRutas = new Ext.data.GroupingStore({	    	   
	            reader: myReader,	      	     	         
	            //sortInfo:{field: 'paso', direction: "ASC"},
	            groupField:'transporte'
	        });
	    
	  
	    var vehiculos = {};
	    function Coste(value, metaData, record, rowIndex, colIndex, store)
	    {
	    	
			if(rowIndex >= 0){
				
		    	var fecha=storeRutas.getAt(rowIndex).get('hora'); 
		    	fecha = fecha.split(' ')[0];
		    	var transporte=storeRutas.getAt(rowIndex).get('transporte');
		    	if(!vehiculos[transporte]) 
		    		vehiculos[transporte] = {fechas:[]};   	
		    	
		    	if(vehiculos[transporte].fechas.length == 0){
		    		vehiculos[transporte].fechas.push(hora_inicio.split(' ')[0]);
		    	}
		    	
		    		var exit;
		    		for(var f in vehiculos[transporte].fechas){
		    			if(vehiculos[transporte].fechas[f] == fecha){
		    				exit = true;
		    			}
		    		}
		    		if(!exit){
		    			vehiculos[transporte].fechas.push(fecha);
		    		}
		    	
		    
		    }
	    	value = value.toFixed(2);
	    	return value + " €";
	    }
	    
	    function Km(value)
	    {
    		value = value.toFixed(2);
	    	return value + " Km";
	    }
	    function Ehora(value)
	    {
	    	var d = new Date(Date.parse(value));
	    	var hh= d.getHours();
	    	var mm= d.getMinutes();
	    	if(mm< 10){
	    		mm = '0'+mm;
	    	}
	    	if(hh < 10){
	    		hh = '0'+hh;
	    	}
	    	return d.getDate() +"/" +(d.getMonth()+1) +"/"+ d.getFullYear() +"  "+ hh +":"+mm+ "h";
	    }
	    var gridRuta = new Ext.grid.GridPanel({
	        store: storeRutas,
	       plugins	: [],

	        columns: [	                   
	            {
	            	id:'paso',
	            	header: "Trayecto", 
	            	width: 60, 
	            	sortable: true, 
	            	dataIndex: 'objInicio',
	            	renderer: escribeTrayecto,
	            	summaryRenderer:escribeTrayecto
	            	
	            	
          		}
	            ,
	            {header: "Hora", width: 30, sortable: true, renderer:Ehora, dataIndex: 'hora', summaryType: 'max',  summaryRenderer:Ehora},
	            {header: "Coste", width: 20, sortable: true, renderer: Coste, dataIndex: 'coste', summaryType: 'sum',  summaryRenderer: sumCoste},
	            {header: "Distancia", width: 20, sortable: true, dataIndex: 'km', renderer: Km, summaryType: 'sum',  summaryRenderer: Km},
	            {header: "Vehículo", width: 0, sortable: true, dataIndex: 'transporte',hidden:true, summaryType: 'transport'},
	            {header: "Coste_dia", width: 0, sortable: true, dataIndex: 'coste_dia',hidden:true, summaryType: 'cost'},
	            {header: "Tipo_vehiculo", width: 0, sortable: true, dataIndex: 'tipo_vehiculo',hidden:true, summaryType: 'tipo'},
	            {header: "Tonelaje_vehiculo", width: 0, sortable: true, dataIndex: 'tonelaje_vehiculo',hidden:true, summaryType: 'tonelaje'},
	            {header: "Norma", width: 0, sortable: true, dataIndex: 'norma_vehiculo',hidden:true, summaryType: 'norma'},
	            {header: "GroupIndex", width: 0, sortable: true, dataIndex: 'groupIndex',hidden:true},
	          
	        ],

	        view: new Ext.grid.GroupingView({
	        	id:'grupo',
	            forceFit:true,
	            enableGroupingMenu: false,	// don't show a grouping menu
	    		enableNoGroups: true,		// don't let the user ungroup
	    		hideGroupedColumn: false,	// don't show the column that is being used to create the heading
	    		showGroupName: true,		// don't show the field name with the group heading
	    		startCollapsed: true,		// the groups start closed
	            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Pasos" : "Paso"]})'
	        }),
			frame:true,
	        width: 570,
	        height: 370,
	        collapsible: false,
	        animCollapse: false,
	        //autoHeight:'auto',
	        title: 'Cálculo de Rutas',
	        iconCls: 'icon-grid'
	      
	    });
	   
	    // click de un paso a otro
	    gridRuta.on('rowclick', function(grid, rowIndex, columnIndex, e) { 
	    	
	    	var groupIndex = storeRutas.getAt(rowIndex).get('groupIndex');
	    	tipoV = storeRutas.getAt(rowIndex).get('tipo_vehiculo');
	    	tonelajeV = storeRutas.getAt(rowIndex).get('tonelaje_vehiculo');
	    	normaV = storeRutas.getAt(rowIndex).get('norma_vehiculo');
	        //console.log("Indice del store: " + rowIndex);
	    	var inicio=storeRutas.getAt(rowIndex).get('objInicio');
	    	var fin=storeRutas.getAt(rowIndex).get('objFin');
	    	// en storeRutas.getAt(rowIndex).get('pasos'); se tiene array(lat,lon) con pasos intermedios
	    	var pasos=storeRutas.getAt(rowIndex).get('pasos');
	    	
	    	//console.log(inicio);
	    	//console.log(fin);
	    	zoomSection(inicio,fin,pasos);
	    	var distance=storeRutas.getAt(rowIndex).get('km');
	    	var timeFinal=storeRutas.getAt(rowIndex).get('hora');
	    	var timeIni;
	    	if(rowIndex > 0){
	    		timeIni = storeRutas.getAt(rowIndex -1).get('hora');
	    	}
	    	if(groupIndex == 0){
	    		timeIni = hora_inicio;
	    	}
	   		getEco(distance, timeFinal, timeIni, tipoV, tonelajeV, normaV);
	    	     
	    
	    });
	    
	   // click en una ruta completa de un transporte
	    gridRuta.on('groupclick', function(grid, groupField, value, e) {
	    	var timeFinal;
	    	var distance = 0;
	    	var rutaT=new Array(); // se crea variable temporal que contendrá objetos de tipo estaciones que será el que se pase al metodo
	    	                       // pintar ruta
	    	var tmpRutaT=new Array();
	    	
	    	// Se busca los records afectados por ese record(nombre transporte) del store de rutas	 
	    	  	 
	    	 var c1 = storeRutas.queryBy(function(record,id) { 
	    	 if(record.get('transporte')==value){
			    	 timeFinal = record.get('hora');
			    	 distance += record.get('km'); 
			    	 tipoV = record.get('tipo_vehiculo');
			    	 tonelajeV = record.get('tonelaje_vehiculo'); 
			    	 normaV = record.get('norma_vehiculo');
			     }      	    	 
    	         return record.get('transporte')==value;  
    	     }); 
	    	 var tot=c1.length;
	    	 if(tot>0)
	    	 {
	    		 var j=0;
	    		 var pasos=new Array();
	    		 c1.each(function(item,index)
	    	     {
	    			// Ahora se pasa un array de arrays, en cada posicion		    		 
	    			rutaT[j]=item.get('objInicio');	    			 
	    			
	    			if((item.get('pasos').length>0)&&(item.get('pasos')[0]!="")) 
	    				// si hay pasos(no estaciones) creamos objetos estaciones sin id para saber q es paso
	    			{
	    			   
	    			   pasos=item.get('pasos');	
	    			   pasos = Ext.util.JSON.decode(pasos[0]);   			   
	    			   for(var i=0;i<pasos.length;i++)
	    			   {
	    				 
	    			       	  // creamos el objeto estacion
	    			       	  var estacion={
	    			       			                   id_estaciones:0,
	    			       			                   nombre:'',
	    			       			                   lat: pasos[i][1],
	    			       			                   lon: pasos[i][0]	    			       			                   
	    			       	                        }
	    			       	 j++;  
	    			       	 rutaT[j]=estacion;
	    			       	 
	    			   }
	    			}	    			 
	    			j++; 
	    			if(index==(tot-1)) 	rutaT[j]=item.get('objFin');
	    				
    			  
	    			 
	    		 },this);
	    	 }

    	    zoomRoute(rutaT);
    	    getEco(distance, timeFinal, hora_inicio, tipoV, tonelajeV, normaV);
	    		
       });
	    
	    
       // inicialmente no hay calculo

	  gridRuta.hide();
	    
	  
	  

	
	   
	
	//*****************************************************//	  
	//****************** FIN CALCULO RUTAS *** ****************//
	//*****************************************************//	    
	 	
	
	    
	    
	//*****************************************************//	  
	//****************** HISTORICO DE RUTAS *** ****************//
	//*****************************************************//	    
		
	    
	  
	   // store para visualizar las ultimas rutas calculadas 
	    var storeFechasRes = new Ext.data.JsonStore({  
	    	url: 'consulta_fechas_rutas.php',
	    	root: 'data',
	    	totalProperty: 'count',
	        fields: [  
	           {name: 'idRuta',type:'float',mapping:'id_rutas'},
	           {name: 'fecha',type:'string'},
	           {name: 'hora',type:'string'}	          
	        ]  
	    });  
	    storeFechasRes.load(); 
	   
	    function escribeHora(value, metaData, record, rowIndex, colIndex, store)
		{	//alert(record.get('activo'));	
			    		    	
	    	return value + "h";
	    	
		}
		 function escribeFecha(value, metaData, record, rowIndex, colIndex, store){
		    var d = new Date(Date.parse(value));
		    return d.getDate() +"/" +(d.getMonth()+1) +"/"+ d.getFullYear();
	    }
	    
	    function verRuta(grid, rowIndex, colIndex)
	    {
	   		  
	   		   var rec = storeFechasRes.getAt(rowIndex);	   
	   		   var nr=rec.get('fechaRes');
	   		   alert("Viendo ruta de fecha... " + nr);
	    }
	    
	    var gridFechasRes = new Ext.grid.GridPanel({		
			store: storeFechasRes,						
			frame:true,
	        width: 570,
	        height:130,
	        border: false,
	        bodyBorder:false,
	        hideHeaders: true,
	        stripeRows: true,
		    //autoExpandColumn:'horaRes',
			//layout: 'fit', // para ajustar a todo el tamaño del panel
			columns: [	
				{
					id:'spacer',					 
					dataIndex:'vacio', 
			  		width:24, 
				},   
				{
			  		id:'fechaRes',
			  		header:'Fecha',
			  		dataIndex:'fecha',
			  		name: 'fechaRes',
			  		width:210,
			  		sortable: true,			  		
			  		style:"font-weight: bold;",
			  		renderer: escribeFecha
			  	},
			  	{
			  		id:'horaRes',
			  		header:'Hora',
			  		dataIndex:'hora',
			  		name: 'horaRes',
			  		width:300,
			  		sortable: true,			  		
			  		style:"font-weight: bold;",
			  		renderer: escribeHora
			  	}
			  	
			]			
											
		});
	    
	  
	    
	    
	   // store para el select de las fechas(fechas no repetidas)  
	    var storeFechas = new Ext.data.JsonStore({  
	    	url: 'consulta_fechas_unicas_rutas.php',
	    	root: 'data',
	    	totalProperty: 'count',
	        fields: [  
	           {name: 'idRuta',type:'float',mapping:'id_rutas'},
	           {name: 'fecha',type:'string'}	           	          
	        ]  
	    });  
	    storeFechas.load();  
	    
	  
	    
	 // Panel del tab Fechas
	    var PResFechas = new Ext.Panel({  	     	       	     
	        layout: 'fit', // para ajustar a todo el tamaño del panel	      	               
	        items: [gridFechasRes],    
	        border: false,
	        bodyBorder:false,	        
	        tbar:[
					new Ext.Toolbar.Fill(), 
					new Ext.form.ComboBox({			                
						fieldLabel:'Fechas',
						id:'selFecha',
					    name:'fechasRutas',  
					    forceSelection:true,  
					    store:storeFechas,  
					    emptyText:'Selecciona una fecha...',  
					    triggerAction: 'all',  
					    hiddenName: 'FechasRutas',
						valueField: 'fecha',
						displayField:'fecha',
					    //hideTrigger:true,  
					    editable:false, 
					    width:130,
					    listeners: {
					        select: function(combo, record, index) 
					        {
					           //alert("cambiado a " + combo.getValue());
					          var fe=combo.getValue();
					          storeFechasRes.load({params:{'fecha':fe}});
					        }
			            }
					})
	            ]
	    });
	   
	    
	 
	     // PANEL CON RESULTADOS DE LOS DISTINTOS VEHICULOS SEGUN FECHA ELEGIDA
	    
  // RESULTADOS DE CLICK EN EL GRID DE FECHAS
	    var rutaSeleccionada=0;
	   
	    // El click en una fila del grid
	    gridFechasRes.on('rowclick', function(grid, rowIndex, columnIndex, e) {
	    	console.log("Borrando pintados..");
	    	cleanRoutes(); // elimino máscaras	
	    	// Se tiene el index del store y sus valores
	    	//console.log(storeFechasRes.getAt(rowIndex).get("idRuta"));
	    	// recuperamos la ruta seleccionada
	    	hora_inicio = storeFechasRes.getAt(rowIndex).get("fecha") +' '+ storeFechasRes.getAt(rowIndex).get("hora");
	    	arrTrans = [];

	    	var idruta=storeFechasRes.getAt(rowIndex).get("idRuta");
	    	rutaSeleccionada=idruta;
	    	// Esperar a la carga y mostrar resultados
	    	//PResRutas.hide();

	    	if(vector && vector._map){
	  	      	vector.onRemove(map);
	  	    }
	  	    if(map){
	  	    	map.setView(center, zoom);
	  	    	
	  	    }

	    	Ext.MessageBox.show({					                            		
                msg: 'Espere por favor ...',					                                    					                                   			                                  
                closable:false,	
                wait:true,
                cls:'resaltado'
            });
	    	// Hacemos la llamada a Ajax pásando el id de la ruta y rellenando el storeResRutas
	    	Ext.Ajax.request({
  	    	  url: 'recupera_ruta.php',
  	    	  params: { id_ruta: idruta },
  	    	  success: function(action) 
  	    	  { 	 
  	    		  Ext.MessageBox.hide(); // Eliminamos el mensaje de calculando..	
  	    		  obj = Ext.util.JSON.decode(action.responseText);
  	    		  if(obj.success)
  	    		  {  
  	    		  	vehiculos = {};
  	    		   Ext.Ajax.request({  
		                     url: 'consulta_transportes.php',  
		                     
		                     success: function(response)
		                     {
		                    	 var transportes = Ext.util.JSON.decode(response.responseText);
		                    	 var datosJson=obj.datos; // se tiene el json
		                    	 for(var i = 0; i < datosJson.datos.length; i++){
		                    	 	for(var t = 0; t < transportes.data.length; t++){
		                    	 		if(transportes.data[t].id_transportes == datosJson.datos[i].idtransporte){
		                    	 			datosJson.datos[i].coste_vehiculo = transportes.data[t].coste_x_dia;
		                    	 			datosJson.datos[i].tipo_vehiculo = transportes.data[t].tipo;
		                    	 			datosJson.datos[i].tonelaje_vehiculo = transportes.data[t].tonelaje;
		                    	 			datosJson.datos[i].norma_vehiculo = transportes.data[t].norma;
		                    	 		}
		                    	 	}
		                    	 }	    			  
	  	    				    	    			   
			  	    			 storeResRutas.loadData(datosJson);  
			  	    			 drawRoute(datosJson); 	
			  	    			 PResRutas.show(); 
							   	 gridResRutas.show();
							   	 panelEco.store.removeAll();
							   	
	         	   
			  	          	     gridResRutas.setTitle("Cálculo de Rutas de " + storeFechasRes.getAt(rowIndex).get("fecha") );
			  	                 Ext.MessageBox.hide();	

			  	                 var estaciones = [];
						    	 var c1 = storeResRutas.queryBy(function(record,id) {      	    	 
					    	         return record.get('transporte');  
					    	     }); 
						    	 var tot=c1.length;

						    	 if(tot>0)
						    	 {
						    		
						    		 c1.each(function(item,index)
						    	     {
						    			
						    			var origin = item.get('objInicio'); 
						    			var target = item.get('objFin'); 
						    			if(estaciones.length == 0){
						    				estaciones.push(origin);   		 
						    			}
						    			var exitsOrigin, exitsTarget;
						    			for(var e= 0; e < estaciones.length; e++){
						    				if(estaciones[e].id_estaciones == origin.id_estaciones){
						    					exitsOrigin = true;
						    				}
						    				if(estaciones[e].id_estaciones == target.id_estaciones){
						    					exitsTarget = true;
						    				}
						    			}
						    			if(!exitsOrigin){
						    				estaciones.push(origin); 
						    			}
						    			if(!exitsTarget){
						    				estaciones.push(target); 
						    			}
						    				    			  
						    			 
						    		 },this);
						    		
						    	 }

						    	 markers.deleteTree = true;
						    	 map.removeLayer(markers);
						    	 markers =  new SMC.layers.markers.MarkerLayer({
									label: 'Estaciones de la ruta',
									stylesheet: stylesheetStations
								});
				    	
								markers.load = function(){
									var features = [];
									
									for(var f= 0; f < estaciones.length; f++){
			
										
										features[f] = {
											type: 'Feature',
											id: estaciones[f].id_estaciones,
											geometry:{
												type: 'Point',
												coordinates:[estaciones[f].lon, estaciones[f].lat]
											},
											properties:{
												nombre: estaciones[f].nombre,
												activo: 't',
		
											}
											
										}
										
										
									}
									markers.addMarkerFromFeature(features);
							   				
							   	};

							   	map.addLayer(markers);
							   	map.fire('resize');
							   	gridRuta.hide();
							}
					   });
	  	                
	  	    		  }
	  	    		  else
	  	    		  {
	  	    			  if(obj.errores.razon=='false') // usuario no logeado
	                        {	                            	
	                       	 desconectar();
	                        }
	                        else
	                        {
	                        Ext.Msg.show({
	                            title:'Aviso',
	                            msg:obj.errores.razon,
	                            buttons: Ext.Msg.OK,
	                            icon: Ext.Msg.WARNING
	                         });
	                        }    
	  	    		  }
  	    		  
  	    	  },
  	    	  failure:function(){ 
                      
                           falloServidor();	
                           
                 
                   }, scope:this  
  	    	  
  	    	  });
	    	
 	
        }, this);

	 function escribeTrayectoRes(value, metaData, record, rowIndex, colIndex, store)
		{	//alert(record.get('activo'));	
			
	    	if(rowIndex >= 0){
		    	var paso=storeResRutas.getAt(rowIndex).get('objFin').nombre; // nombre estacion de paso	    	
		    	return value.nombre + "->" + paso;
		    }
		    else{
		    	return 'TOTAL (añadido coste/día)';
		    }
	    	
		}

	 function CosteRes(value, metaData, record, rowIndex, colIndex, store)
	    {
	    	
			if(rowIndex >= 0){
				
		    	var fecha=storeResRutas.getAt(rowIndex).get('hora'); 
		    	fecha = fecha.split(' ')[0];
		    	var transporte=storeResRutas.getAt(rowIndex).get('transporte');
		    	if(!vehiculos[transporte]) 
		    		vehiculos[transporte] = {fechas:[]};   	
		    	
		    	if(vehiculos[transporte].fechas.length == 0){
		    		vehiculos[transporte].fechas.push(hora_inicio.split(' ')[0]);
		    	}
		    	
		    		var exit;
		    		for(var f in vehiculos[transporte].fechas){
		    			if(vehiculos[transporte].fechas[f] == fecha){
		    				exit = true;
		    			}
		    		}
		    		if(!exit){
		    			vehiculos[transporte].fechas.push(fecha);
		    		}
		    	
		    
		    }
	    	value = value.toFixed(2);
	    	return value + " €";
	    }
		

		function horaIni(value, metaData, record, rowIndex, colIndex, store){
			  return hora_inicio;
		}


		var summaryRes = new Ext.ux.grid.GroupSummary();
		Ext.ux.grid.GroupSummary.Calculations['transport'] = function(v, record, field){
	        return record.data.transporte;
	    };
	    Ext.ux.grid.GroupSummary.Calculations['cost'] = function(v, record, field){
	        return record.data.coste_vehiculo;
	    };
	     Ext.ux.grid.GroupSummary.Calculations['tipo'] = function(v, record, field){
	        return record.data.tipo_vehiculo;
	    };
	     Ext.ux.grid.GroupSummary.Calculations['tonelaje'] = function(v, record, field){
	        return record.data.tonelaje_vehiculo;
	    };
	     Ext.ux.grid.GroupSummary.Calculations['norma'] = function(v, record, field){
	        return record.data.norma_vehiculo;
	    };

	    

	    
	    
	
	    var storeResRutas = new Ext.data.GroupingStore({	    	   
            reader: myReader,	      	     	         
            //sortInfo:{field: 'paso', direction: "ASC"},
            groupField:'transporte',

        });
	    
	   
		
	    var gridResRutas = new Ext.grid.GridPanel({
	        store: storeResRutas,
	        id:"G0",
	        plugins	: summaryRes,
          	
	     //   hideHeaders: true,
	        columns: [	                   
	            {
	            	id:'paso',
	            	header: "Trayecto", 
	            	width: 60, 
	            	sortable: true, 
	            	dataIndex: 'objInicio',
	            	renderer: escribeTrayectoRes,
	            	summaryRenderer:escribeTrayectoRes
	            	
	            	
          		}
	            ,
	            {header: "Hora", width: 30, sortable: true, renderer:Ehora, dataIndex: 'hora', summaryType: 'max',  summaryRenderer:Ehora},
	            {header: "Coste", width: 20, sortable: true, renderer: CosteRes, dataIndex: 'coste', summaryType: 'sum',  summaryRenderer:sumCoste},
	            {header: "Distancia", width: 20, sortable: true, dataIndex: 'km', renderer: Km, summaryType: 'sum',  summaryRenderer: Km},
	            {header: "Vehículo", width: 0, sortable: true, dataIndex: 'transporte',hidden:true, summaryType: 'transport'},
	            {header: "Coste_dia", width: 0, sortable: true, dataIndex: 'coste_dia',hidden:true, summaryType: 'cost'},
	            {header: "Tipo_vehiculo", width: 0, sortable: true, dataIndex: 'tipo_vehiculo',hidden:true, summaryType: 'tipo'},
	            {header: "Tonelaje_vehiculo", width: 0, sortable: true, dataIndex: 'tonelaje_vehiculo',hidden:true, summaryType: 'tonelaje'},
	            {header: "Norma", width: 0, sortable: true, dataIndex: 'norma_vehiculo',hidden:true, summaryType: 'norma'},
	            {header: "GroupIndex", width: 0, sortable: true, dataIndex: 'groupIndex',hidden:true},
	          

	          
	        ],
	       

	        view: new Ext.grid.GroupingView({
	        	id:'grupoRes',
	            forceFit:true,
	            enableGroupingMenu: false,	// don't show a grouping menu
	    		enableNoGroups: true,		// don't let the user ungroup
	    		hideGroupedColumn: false,	// don't show the column that is being used to create the heading
	    		showGroupName: true,		// don't show the field name with the group heading
	    		startCollapsed: true,		// the groups start closed
	            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Pasos" : "Paso"]})'
	        }),

	        frame:true,
	        width: 570,
	        height: alto - 100,
	        collapsible: false,
	        animCollapse: false,
	        //autoHeight:'auto',
	       
	        title: 'Cálculo',
	        iconCls: 'icon-grid',
	        tbar:[
	              new Ext.FormPanel({												 
					    method : 'POST',
				//	    standardSubmit:true,
					    id:'fExportar2',						   					   
					    url: 'exportar_ruta.php',
					    items: [{
					        xtype: 'hidden',
					        name: 'idRuta',
					        value: rutaSeleccionada
					    }]
					}),
					
	              { 
					text:'Exportar',
					iconCls:'iconExportar',				
					handler: function() {
	              
				
						
						// enviamos por post con formulario el id de la ruta por seguridad						
	   				     var form=Ext.getCmp('fExportar2').getForm();
						 form.findField('idRuta').setValue(rutaSeleccionada);
	   				     // metemos datos
						 var el = form.getEl().dom;
					     var target = document.createAttribute("target");
					     target.nodeValue = "_blank";
					     el.setAttributeNode(target);
					     el.action = form.url;
					     el.submit(); 
					     
					 }
					}
				
	            	
	             ]

	
	    });
	 
	    

	    
       
	    // click de un paso a otro
	    gridResRutas.on('rowclick', function(grid, rowIndex, columnIndex, e) { 
	    	
	    	var groupIndex = storeResRutas.getAt(rowIndex).get('groupIndex');
	    	tipoV = storeResRutas.getAt(rowIndex).get('tipo_vehiculo');
	    	tonelajeV = storeResRutas.getAt(rowIndex).get('tonelaje_vehiculo');
	    	normaV = storeResRutas.getAt(rowIndex).get('norma_vehiculo');

	        //console.log("Indice del store: " + rowIndex);
	    	var inicio=storeResRutas.getAt(rowIndex).get('objInicio');
	    	var fin=storeResRutas.getAt(rowIndex).get('objFin');
	    	// en storeRutas.getAt(rowIndex).get('pasos'); se tiene array(lat,lon) con pasos intermedios
	    	var pasos=storeResRutas.getAt(rowIndex).get('pasos');
	    	zoomSection(inicio, fin,pasos);


	    	var distance=storeResRutas.getAt(rowIndex).get('km');
	    	var timeFinal=storeResRutas.getAt(rowIndex).get('hora');
	    	var timeIni;
	    	if(rowIndex > 0){
	    		timeIni = storeResRutas.getAt(rowIndex -1).get('hora');
	    	}
	    	if(groupIndex == 0){
	    		timeIni = hora_inicio;
	    	}
	   		getEco(distance, timeFinal, timeIni, tipoV, tonelajeV, normaV);
	    	
	    	     
	    
	    });

	   
	    

	    
	   // click en una ruta completa de un transporte
	    gridResRutas.on('groupclick', function(grid, groupField, value, e) {
	    	var timeFinal;
	    	var distance = 0;
	    	var rutaT=new Array(); // se crea variable temporal que contendrá objetos de tipo estaciones que será el que se pase al metodo
	    	                       // pintar ruta
	    	var tmpRutaT=new Array();
	    	// Se busca los records afectados por ese record(nombre transporte) del store de rutas	    	 
	    	 var c1 = storeResRutas.queryBy(function(record,id) { 
	    	 	if(record.get('transporte')==value){
			    	 timeFinal = record.get('hora');
			    	 distance += record.get('km'); 
			    	 tipoV = record.get('tipo_vehiculo');
			    	 tonelajeV = record.get('tonelaje_vehiculo');
			    	 normaV = record.get('norma_vehiculo'); 
			     }  	    	 
    	         return record.get('transporte')==value;  
    	     }); 
	    	 var tot=c1.length;
	    	 if(tot>0)
	    	 {
	    		 var j=0;
	    		 var pasos=new Array();
	    		 c1.each(function(item,index)
	    	     {
	    			// Ahora se pasa un array de arrays, en cada posicion		    		 
	    			rutaT[j]=item.get('objInicio');	    			 
	    			
	    			if((item.get('pasos').length>0)&&(item.get('pasos')[0]!="")) 
	    				// si hay pasos(no estaciones) creamos objetos estaciones sin id para saber q es paso
	    			{
	    			   
	    			   pasos=item.get('pasos');
	    			   pasos = Ext.util.JSON.decode(pasos[0]);	    			   
	    			   for(var i=0;i<pasos.length;i++)
	    			   {
	    				 
	    			       	  // creamos el objeto estacion
	    			       	  var estacion={
       			                   id_estaciones:0,
       			                   nombre:'',
       			                   lat: pasos[i][1],
       			                   lon: pasos[i][0]	    			       			                   
       	                        }
	    			       	 j++;  
	    			       	 rutaT[j]=estacion;
	    			       	 
	    			   }
	    			}	    			 
	    			j++; 
	    			if(index==(tot-1)) 	rutaT[j]=item.get('objFin');
	    				
	    				
		    		 
                    	    			  
	    			 
	    		 },this);
	    	 }

    	    zoomRoute(rutaT);

    	    getEco(distance, timeFinal, hora_inicio, tipoV, tonelajeV, normaV);
	    		
       });
	    
	    
	   
	   
	    
	    
    //*****************************************************//	  
	//****************** FIN HISTORICO DE RUTAS***********//
	//*****************************************************//	


	 //*****************************************************//	  
	//****************** ECOCOSTES***********//
	//*****************************************************//

	     var readerEco = new Ext.data.JsonReader({	        
	    	root : 'data',
	     //	autoLoad: false,
	    //    idProperty: 'idtransporte',
	        totalProperty: 'count',	        
	        fields: [
	            
						{name: 'combustible',mapping: 'combustible',type: 'float'},
						{name: 'co2',mapping: 'co2',type: 'float'},
						{name: 'ch4',mapping: 'ch4', type: 'float'},
						{name: 'nox',mapping: 'nox', type: 'float'},
						{name: 'cov',mapping: 'cov', type: 'float'},	       
						{name: 'co',mapping: 'co',type: 'float'},
						{name: 'pm',mapping: 'pm',type: 'float'},
						{name: 'nmcov',mapping: 'nmcov',type: 'float'}
					
	        ]
	    });

	    var storeEcocostes = new Ext.data.GroupingStore({	    	   
            reader: readerEco,	      	     	         
           

        });

 		function renderValue(value){
 				value = value.toFixed(2);
 				return value + ' g';
 		}
	    	
	     var panelResEco = new Ext.grid.GridPanel({		
			store: storeEcocostes,						
			frame:true,
	        width: 570,
	        height:alto -300,
	        bottom: 0,
	        border: false,
	        bodyBorder:false,
	        stripeRows: true,
	        title: 'Impacto ambiental',
			region: 'south',
			columns: [	                   
	          
	            {id: 'coste', header: "Combustible", width: 75, sortable: true, renderer:renderValue, dataIndex: 'combustible'},
	            {header: "CO2", width: 75, sortable: true, renderer: renderValue, dataIndex: 'co2'},
	            {header: "CH4", width: 68, sortable: true, dataIndex: 'ch4', renderer: renderValue},
	            {header: "NOX", width: 68, sortable: true, renderer:renderValue, dataIndex: 'nox'},
	            {header: "COV", width: 68, sortable: true, renderer: renderValue, dataIndex: 'cov'},
	            {header: "CO", width: 68, sortable: true, dataIndex: 'co', renderer: renderValue},
	            {header: "PM", width: 68, sortable: true, renderer: renderValue, dataIndex: 'pm'},
	            {header: "NMCOV", width: 68, sortable: true, dataIndex: 'nmcov', renderer: renderValue}
	            

	          
	        ],			
											
		});

		var panelEco = new Ext.grid.GridPanel({		
			store: storeEcocostes,						
			frame:true,
	        width: 570,
	        height:alto -300,
	        bottom: 0,
	        border: false,
	        bodyBorder:false,
	        stripeRows: true,
	        title: 'Impacto ambiental',
			region: 'south',
			columns: [	                   
	          
	            {id: 'coste', header: "Combustible", width: 75, sortable: true, renderer:renderValue, dataIndex: 'combustible'},
	            {header: "CO2", width: 75, sortable: true, renderer: renderValue, dataIndex: 'co2'},
	            {header: "CH4", width: 68, sortable: true, dataIndex: 'ch4', renderer: renderValue},
	            {header: "NOX", width: 68, sortable: true, renderer:renderValue, dataIndex: 'nox'},
	            {header: "COV", width: 68, sortable: true, renderer: renderValue, dataIndex: 'cov'},
	            {header: "CO", width: 68, sortable: true, dataIndex: 'co', renderer: renderValue},
	            {header: "PM", width: 68, sortable: true, renderer: renderValue, dataIndex: 'pm'},
	            {header: "NMCOV", width: 68, sortable: true, dataIndex: 'nmcov', renderer: renderValue}
	            

	          
	        ],			
											
		});
	   
	  

	  function getEco(distance, timeFinal, timeIni, tipoV, tonelajeV, norma){
	  	timeFinal = Date.parse(timeFinal);
	  	timeIni = Date.parse(timeIni);
	  	var horas = timeFinal -timeIni;
	  	horas = (((horas/1000)/60)/60);
	  	var velo = distance / horas;
	  	console.log(velo);

	  	var params = {
	  		   "cantidad":"1",
			   "carga":"100",
			   "norma":norma,
			   "pendiente":"0%",
			   "tonelaje":tonelajeV,
			   "vehiculoCodigo":tipoV,
			   "velocidad": velo,
			   "urbana":"0",
			   "rural":"0",
			   "highway":"0"	  
	  	}

	  	var typeVia;
	  	if(velo <= 50){
	  		params['urbana'] = distance;
	  	}
	  	else if (velo >50 && velo <= 80){
	  		params['rural'] = distance;
	  	}
	  	else if (velo > 80){
	  		params['highway'] = distance;
	  	}

	    Ext.Ajax.request({
    	    	  url: 'ecocostes.php',
    	    	  jsonData: Ext.util.JSON.encode(params),
    	    	  success: function(action) 
    	    	  { 
    	    	  	obj = Ext.util.JSON.decode(action.responseText);
    	    		  if(obj.success)
    	    		  {
    	    		  	var datosJson = {
    	    		  		count: obj.datos.data.length,
    	    		  		data: obj.datos.data
    	    		  	}
    	    		  	storeEcocostes.loadData(datosJson);
    	    		  }
    	    		  else
	    	    		  {
	    	    			  if(obj.errores.razon=='false') // usuario no logeado
	                          {	                            	
	                         	 desconectar();
	                          }
	                          else
	                          {
	                          Ext.Msg.show({
	                              title:'Aviso',
	                              msg:obj.errores.razon,
	                              buttons: Ext.Msg.OK,
	                              icon: Ext.Msg.WARNING
	                           });
	                          }    
	    	    		  }
    	    	  },
    	    	   failure:function(){ 
                        
                             falloServidor();	
                             
                   
                  }, scope:this 
	    });



	  }

	 //*****************************************************//	  
	//****************** FIN ECOCOSTES***********//
	//*****************************************************//    
		    
	    
	    
	//*****************************************************//
    //**************** PANELES GENERALES *****************//
	//*****************************************************//

	 // Panel del tab Estaciones
	    var PResRutas = new Ext.Panel({  	         	          
	        monitorResize: true ,
	        layout: 'fit', // para ajustar a todo el tamaño del panel	      	               
	        items: [gridResRutas, panelResEco]          
	        
	    });
	    
	    // Al inicio este panel está vacio
	   PResRutas.hide();
	  
	  // Panel del tab Estaciones
	    var estaciones = new Ext.Panel({  
	        title:'Estaciones',  
	        id:'estaciones',
	        iconCls: 'iconEstacion',  
	        monitorResize: true ,
	        layout: 'fit', // para ajustar a todo el tamaño del panel	      
	        height: alto,       
	        items: [gridEs],          
	        tbar:[
	              { 
					text:'Eliminar',
					iconCls:'iconBorrar',
					handler:function()
					 {
						 var rows = gridEs.getSelectionModel().getSelections();
					  	 if(rows.length === 0)
					  	 {
							  		Ext.Msg.show({
		                                title:'Fallo de eliminación',
		                                msg:'No se ha seleccionado ninguna estación',
		                                buttons: Ext.Msg.OK,
		                                icon:  Ext.Msg.WARNING
		                             });
									return false;
						 }
						else 
						 {
					         Ext.Msg.confirm('Confirmación','¿Estás seguro de querer eliminar las estaciones seleccionadas?',function(btn){  
						      if(btn === 'yes')
						          {  
						   	  					   // Se debe eliminar via ajax(borrado a true)
												
												 var estacionesBorrar=rows[0].get('id_estaciones');
												 for (i=1; i<rows.length; i++) estacionesBorrar+="," + rows[i].get('id_estaciones');	
													// se tiene las estaciones a borrar en grupo
													   Ext.Ajax.request({  
										                     url: 'eliminar_es.php',  
										                     params:{id:estacionesBorrar}, //se envia el id de la estacion  
										                     success: function()
										                     {
										                    	 // se borra del store
										                    	 storeEs.remove(rows); 		
										                    	 // se debe eliminar los transportes cuyo origen o destino tenga estas estaciones
										                    	 // se recarga los transportes si sus estaciones (inicio o fin) tiene esta estacion a eliminar
										        	    	     storeUt.reload();
										                    	 
										                     },  
										                     failure:function(form, action){ 
										                         if(action.failureType == 'server'){ 
										                             obj = Ext.util.JSON.decode(action.response.responseText);
										                             if(obj.errores.razon=='false') // usuario no logeado
										                             {
										                            	 desconectar();
										                             }
										                             else
										                             {
										                             Ext.Msg.show({
										                                 title:'Fallo de registro',
										                                 msg:obj.errores.razon,
										                                 buttons: Ext.Msg.OK,
										                                 icon: 'icoFail'
										                              });
										                             }
										                         }else{ 
										                             falloServidor(); 
										                         } 
										                   
										                     } ,  
										                     scope:this  
										                 });
												  //  console.log(estacionesBorrar);
												    storeEs.remove(rows);
									}
					              }); 
							
					        }  
							    
							  
					 }
					},
					new Ext.Toolbar.Fill(), 
	               {
	                text:'Nueva',
	            	iconCls:'iconNuevo',
	            	handler:registraEs
	               },	               
	               {
	            	text:'Importar',
	            	iconCls:'iconImportar',
	            	handler: importarEs
	               }
	        ]
	       
	    });



	 // Panel del tab transportes
	    var transportes = new Ext.Panel({  
	        title:'Transportes', 
	        id:'transportes',
	        iconCls: 'iconTransporte',  
	        layout: 'fit', // para ajustar a todo el tamaño del panel
	        monitorResize: true ,
	        height: alto,
	        items: [gridUt],  
	        tbar:[
	              {
					  text:'Eliminar',
					  iconCls:'iconBorrar',
					  handler:function()
					  {						
						  var rows = gridUt.getSelectionModel().getSelections();
						  if(rows.length === 0)	
							  {
							     Ext.Msg.show({
	                                 title:'Fallo de eliminación',
	                                 msg:'No se ha seleccionado ningún transporte',
	                                 buttons: Ext.Msg.OK,
	                                 icon:  Ext.Msg.WARNING
	                              });
							     return false;
							  }
					  	  else 
							{						  
						       Ext.Msg.confirm('Confirmación','¿Estás seguro de querer eliminar los transportes seleccionados?',function(btn){  
						       if(btn === 'yes')
						          {  
						    	  			var transportesBorrar=""; // se tiene los id de las estaciones a borrar
											transportesBorrar=rows[0].get('id_transportes');
											for (i=1; i<rows.length; i++) transportesBorrar+="," + rows[i].get('id_transportes');  	
											// Se debe eliminar via ajax(borrado a true) y el transporte cuyo destino o origen tenga esta estacion a inactivo
											Ext.Ajax.request({  
							                     url: 'eliminar_ut.php',  
							                     params:{id:transportesBorrar}, //se envia el id del transporte  
							                     success: function()
							                     {
							                    	 // se borra del store
							                    	 storeUt.remove(rows); 
 
							                     },  
							                     failure:function(form, action){ 
							                         if(action.failureType == 'server'){ 
							                             obj = Ext.util.JSON.decode(action.response.responseText);
							                             if(obj.errores.razon=='false') // usuario no logeado
							                             {
							                            	 desconectar();
							                             }
							                             else
							                             {
							                             Ext.Msg.show({
							                                 title:'Fallo de eliminación',
							                                 msg:obj.errores.razon,
							                                 buttons: Ext.Msg.OK,
							                                 icon: 'icoFail'
							                              });
							                             }
							                         }else{ 
							                             falloServidor(); 
							                         } 
							                   
							                     } ,  
							                     scope:this  
							                 });
										   //  console.log(transportesBorrar);
										   // storeUt.remove(rows);
								
						            }
						          }); 
						         
						   	}
						 
						  
					  }
	              },
	              new Ext.Toolbar.Fill(),
	              {
	            	  text:'Nueva',
	            	  iconCls:'iconNuevo',
	            	  handler: registraUt
	              },
	              
	              {
	            	  text:'Importar',
	            	  iconCls:'iconImportar',
	            	  handler:importarUt
	              }
	             ]	
	    });
	    
	    
	    
	    
	    // Panel del tab Rutas
	       var rutas = new Ext.Panel({  
	           title:'Calcular Rutas', 
	           id: 'calculo', 
	           iconCls: 'iconResultados',
	           autoHeight:'auto',
	          items:[FormCalcRuta,gridRuta, panelEco]  
	       });
	    // Panel del tab Resultados
	       var resultados = new Ext.Panel({  
	           title:'Rutas Almacenadas',
	           id: 'rutas',           
	           iconCls: 'iconRutas',
	           items:[PResFechas,PResRutas]  
	       });
	       
	      // Tabs para el panel control 
	       var tabs = new Ext.TabPanel({  
	           border: false,  
	           activeTab: 0,  
	           enableTabScroll:false,  
	           items:[estaciones,transportes,rutas,resultados]  
	       });  
	       
	      // Panel para el control (gestión de estaciones,UT,Rutas,etc..)
	       var control = {  
	       	    xtype   :   "panel",  
	       	    region  :   "west",
	       	    bodyStyle:'background-color:#ccc',    	    
	       	    width   :   570,            	    
	       	    margins: {top:3,bottom:3,left:3,right:3},
	       	    border: false,    	  
	       	    split   :   true, // permite redimensionar region
	       	    items: [tabs]
	       	}; 
	       
	      // Panel contenido, bajo el header 
	       var main = new Ext.Panel({		
	       	autoWidth: true,
	       	height: alto,
	       	layout:"border",
	   		defaults: 
	   		{		
	   		  border: false,
	   		},
	   		renderTo: 'content',
	   		items :   [mapPanel,control]
	   	});


	       
	   // activacion del tab de transportes
	   Ext.getCmp('transportes').on("activate",function(){
	       
		       gridUt.getView().refresh();

	 	    });

	    Ext.getCmp('calculo').on("activate",function(){
	       	gridRuta.hide();
		      panelEco.hide();

	 	  });

	   Ext.getCmp('rutas').on("activate",function(){
	   	 PResRutas.hide();
	   		gridResRutas.hide();
	   		panelEco.store.clearData();

	   		if(map){
	  	    	map.setView(center, zoom);
	  	    	map.fire('resize');
	  	    }
	   		
	   });
	   
	 	    
	  Ext.getCmp('estaciones').on("activate",function(){

	  	      if(map){
	  	      	map.setView(center, zoom);
	  	      	map.fire('resize');
	  	      	if(vector && vector._map){
		  	      	vector.onRemove(map);
		  	    }
      			cleanRoutes();

      			gridRuta.hide();
			    markers.deleteTree = true;

				map.removeLayer(markers);
				markers =  new SMC.layers.markers.MarkerLayer({
					label: 'Estaciones actuales',
					stylesheet: stylesheetStations
				});
				markers.load = function(){

					$.ajax({
						type: "GET",
						url: 'consulta_estaciones.php',
						success: function(response){
							var features = response.data;
							for(var f in features){
								features[f] = {
									type: 'Feature',
									id: features[f].id_estaciones,
									geometry:{
										type: 'Point',
										coordinates:[features[f].lon, features[f].lat]
									},
									properties:{
										nombre: features[f].nombre,
										activo: features[f].activo,
										direccion: features[f].direccion
									}
									
								}
							}
							markers.addMarkerFromFeature(features);
						}
					})
				}
			    map.addLayer(markers);
			}	       
	}); 

 
	      
	  //*****************************************************//
	    //**************** FIN PANELES GENERALES *****************//
		//*****************************************************// 
   
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//++++++++++++++++++++++++CREATE VISOR SMC+++++++++++++++++++++++++++++++++++++++//
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
        map = SMC.map('map');
        var zoom = 12;
        var center = new L.LatLng(37.383333, -5.983333);
	    map.setView(center, zoom);
	    // Add base layer from OSM
	    var base = SMC.tileLayer({
	        url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
			maxZoom: 18
		}).addTo(map);

		var baseLayer = {
	        "OpenStreetMap": base
	    };


	    var leyenda = SMC.layerTreeControl(baseLayer, {
	        collapsed: false
	    }).addTo(map);
	  
	
		markers.load = function(){
			$.ajax({
				type: "GET",
				url: 'consulta_estaciones.php',
				success: function(response){
					var features = response.data;
					for(var f in features){
						features[f] = {
							type: 'Feature',
							id: features[f].id_estaciones,
							geometry:{
								type: 'Point',
								coordinates:[features[f].lon, features[f].lat]
							},
							properties:{
								nombre: features[f].nombre,
								activo: features[f].activo,
								direccion: features[f].direccion
							}
							
						}
					}
					markers.addMarkerFromFeature(features);
				}
			})
		}
	    map.addLayer(markers);

	    


    
	
}); // FIN DE Ext.onReady



//*************************************************
//			Controladores del Mapa
//*************************************************

//Registra un punto sobre el mapa con el icono que se pasa como parámetro.
function registerPoint(map, icon) {
    changeIconType(icon);

    map.on('click', function(e) {
        
        if(markerClick) {
        	
        	if(markerClick.popup) {
    			map.removePopup(markerClick.popup);
    		}
        	markerClick.setLatLng(e.latlng);

        	//markers.redraw();
        } else {
        	markerClick = new L.Marker(e.latlng,{
        		icon: actualIcon
        	});
        	markerClick.id='';
        	
        }
//        creaElementosMapa(markerClick);
		showAddress(markerClick);
		markerClick.addTo(map);
        
    });
}






//Función que cambia el icono actual de las marcas por el que se pasa como parámetro.
function changeIconType(icon) {
    actualIcon = icon;
}



/**
 * GEOCODER
 * */
var geocoder;

function showAddress(markerIn) {
	geocoder = new google.maps.Geocoder();
	var marker;
	
	if (geocoder) {
	
		if (markerIn) { //si queremos una dirección a partir de unas coordenadas cartográficas
			var latlongFormatGoogle = markerIn._latlng; 
			//latlongFormatGoogle.transform(map.getProjectionObject(), projGoogle);
			
			var locationGMaps = new google.maps.LatLng(latlongFormatGoogle.lat, latlongFormatGoogle.lng);
			geocoder.geocode({ 'latLng': locationGMaps}, function(points, status) {
				try {
					markerIn.direccion = points[0].formatted_address;
					//Actualizamos los campos de la ventana para añadir una estación
			        Ext.getCmp('direccion').setValue(points[0].formatted_address);
			        Ext.getCmp('lon').setValue(latlongFormatGoogle.lng);
			        Ext.getCmp('lat').setValue(latlongFormatGoogle.lat);
				} catch (e) {

				}	
			});
			
			//registerMoseOverMark(markerIn);
			
		} else if (Ext.getCmp('direccionMapa').getValue()) { //si queremos unas coordenadas a partir de una dirección
			geocoder.geocode({ 'address': Ext.getCmp('direccionMapa').getValue()}, function(points, status) {
				if (!points && !(status == google.maps.GeocoderStatus.OK)) {
					alert(Ext.getCmp('direccionMapa').getValue() + "Dirección no encontrada.");
					return;
				} else {
					
					var centerPoint = new L.LatLng(points[0].geometry.location.lat(), 
						points[0].geometry.location.lng());
						
					map.setView(centerPoint, 15);
				}
			});
		}
	}
}


//CÁLCULO DE RUTAS


var pointArray = [];



function zoomSection(startStation, endStation, pasos) {
	
	
	var pointStart = new L.LatLng(startStation.lat, startStation.lon);
	var pointEnd = new L.LatLng(endStation.lat, endStation.lon);
	
	var arrPoints = [];
	arrPoints.push(pointStart);
	pasos = Ext.util.JSON.decode(pasos[0]); 
	for ( var i = 0; i < pasos.length; i++) {
		var pointPaso = new L.LatLng(pasos[i][1], pasos[i][0]);
		arrPoints.push(pointPaso);
	}
	arrPoints.push(pointEnd);
	if(!vector || !vector._map){
	vector = new L.Polyline(arrPoints, vectorSelected).addTo(map);
	}
	else{
		vector.setLatLngs(arrPoints);
	}

	var stationsMarkers = markers.noClusterGroup.getLayers();
	var features = [];
	for(var m=0; m < stationsMarkers.length; m++){
		if(stationsMarkers[m].feature.id == startStation.id_estaciones){
			stationsMarkers[m].feature.properties.tipo = 'Origen';		
		}
		else if(stationsMarkers[m].feature.id == endStation.id_estaciones){
			stationsMarkers[m].feature.properties.tipo= 'Destino';		
		}
		else{
			stationsMarkers[m].feature.properties.tipo = 'Parada';
		}
		features[m] = stationsMarkers[m].feature;

	}
	markers.unload();
	markers.load = function(){
		markers.addMarkerFromFeature(features);
	}
	markers.load();
	
	var bbox = new L.LatLngBounds(arrPoints);
	map.fitBounds(bbox);
	map.fire('resize');
	
}



function drawRoute(datosJson) {
	
	 var routes = {};
	 var datos = datosJson.datos;

	 for(var d = 0; d < datos.length; d++){
	 	if(!routes[datos[d].transporte]){
	 		routes[datos[d].transporte] = {};
	 		routes[datos[d].transporte].coordinates = [];
	 		routes[datos[d].transporte].datos = [];
	 	}
	 		var geom = datos[d].pasos;
	 		pasos = Ext.util.JSON.decode(geom[0]);
	 		for(var p= 0; p < pasos.length; p++){
	 			routes[datos[d].transporte].coordinates.push(pasos[p]);
	 		}

	 		routes[datos[d].transporte].datos.push(datos[d]);
	 	
	 }

	ruta.addTo(map);
    cleanRoutes();

	var listColor = new Array(Object.keys(routes).length);
	  
	 var c = 0;
	 for(var ut = 0; ut < Object.keys(routes).length; ut++, c++){
	  	 if(ut > optionColor.length-1){
	  	 	c= 0;
	  	 }
	  	 listColor[ut] = optionColor[c];
	 }

	var i = 0;

	for(var r in  routes){
	 	var feature = {};
	 	feature.properties={'name':r};
	 	feature.geometry = {
	 		type: 'LineString',
	 		coordinates: routes[r].coordinates
	 	}
	 	var color = listColor[i];
	 	var stylesheet ='*[name="'+r+'"]{color: "'+color+'";}';
	 	options={
	 		stylesheet: stylesheet,
	 		label:'Ruta del '+r
	 	};
	 	var layer = new SMC.layers.geometry.GeometryLayer(options);
	 	layer.addTo(ruta);
	 	layer.addGeometryFromFeatures(feature);
	 	i++;
	 	
	}

	 map.fire('resize');	


}

function zoomRoute(stations) {

	var line, bbox, origin, target;;

	pointArray = [];
	for ( var i = 0; i < stations.length; i++) {
		pointArray.push( new L.LatLng(stations[i].lat, stations[i].lon));
		origin = stations[0].id_estaciones;
		target = stations[stations.length-1].id_estaciones;
	}
	if(!vector || !vector._map){
		vector = new L.Polyline(pointArray, vectorSelected).addTo(map);
	}
	else{
		vector.setLatLngs(pointArray);
	}

	var stationsMarkers = markers.noClusterGroup.getLayers();
	var features = [];
	for(var m=0; m < stationsMarkers.length; m++){
		if(stationsMarkers[m].feature.id == origin){
			stationsMarkers[m].feature.properties.tipo = 'Origen';		
		}
		else if(stationsMarkers[m].feature.id == target){
			stationsMarkers[m].feature.properties.tipo = 'Destino';		
		}
		else{
			stationsMarkers[m].feature.properties.tipo = 'Parada';
		}
		features[m] = stationsMarkers[m].feature;

	}
	markers.unload();
	
	markers.load = function(){
		markers.addMarkerFromFeature(features);
	}
	markers.load();
	
	bbox = new L.LatLngBounds(pointArray);
	map.fitBounds(bbox);
	map.fire('resize');
	
	


}

function cleanRoutes() {
	var layers = ruta._layers;
	for(var l in layers){
		layers[l].deleteTree = true;
		map.removeLayer(layers[l]);
	}
	ruta.clearLayers();
}




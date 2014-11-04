// JavaScript Document

//Variables para el control y visualización del mapa
var map, layer;
var controlNavigation = new OpenLayers.Control.Navigation();
//var controlMouse = new OpenLayers.Control.MousePosition();
var centerPoint = new OpenLayers.LonLat(-667100.61351, 4493902.57785);

//Iconos para marcas en el mapa:
var size = new OpenLayers.Size(25,41);
var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);

var arrPopUps = [];
var actualIcon;
var iconHome = new OpenLayers.Icon('img/home.png', size, offset);
var iconStation = new OpenLayers.Icon('img/station.png', size, offset);
var iconTruck = new OpenLayers.Icon('img/truck.png', size, offset);

var arrMarkers = [];
var markers = new OpenLayers.Layer.Markers( "Markers" );

var ruta = new OpenLayers.Layer.Vector("rutas");
var rutaParcial = new OpenLayers.Layer.Vector("rutasParciales");

var markerClick;

var toolbarItems = [];

var projGoogle = new OpenLayers.Projection("EPSG:4326");

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
    
    map = new OpenLayers.Map();
    layer = new OpenLayers.Layer.OSM({name: 'OSM Map'});
    
    map.addControl(controlNavigation); 
    map.addLayer(layer);
    map.addLayer(ruta);
    map.addLayer(rutaParcial);
    map.addLayer(markers);

    var mapPanel = new GeoExt.MapPanel({ 
    	title: 'Callejero',
        stateId: "mappanel",
        region  :   "center",
        map: map,
        zoom: 12,
        //layers: [layer, markers],
        tbar : toolbarItems,
        center: centerPoint,
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
 // Stores para cargar estaciones en los formularios de transportes
    /*
    var store1 = new Ext.data.JsonStore({  
        url: 'consulta_estaciones.php',  
        totalProperty: 'count', 
        root: 'data',  
        fields: 
        	[
        	  {name:'nombre',mapping:'nombre',type:'string'},
        	  {name:'id_estaciones',mapping:'id_estaciones',type:'float'},
        	  {name:'lat',mapping:'lat',type:'float'},
        	  {name:'lon',mapping:'lon',type:'float'},
        	  {name:'direccion',mapping:'direccion',type:'string'},
        	  {name:'activo',mapping:'activo',type:'boolean'}
            ]  
    });
    
    var store2 = new Ext.data.JsonStore({  
        url: 'consulta_estaciones.php',  
        totalProperty: 'count', 
        root: 'data',  
        fields: 
        	[
        	  {name:'nombre',mapping:'nombre',type:'string'},
        	  {name:'id_estaciones',mapping:'id_estaciones',type:'float'},
        	  {name:'lat',mapping:'lat',type:'float'},
        	  {name:'lon',mapping:'lon',type:'float'},
        	  {name:'direccion',mapping:'direccion',type:'string'},
        	  {name:'activo',mapping:'activo',type:'boolean'}
            ]  
    });
     */   
    // end para stores para carga de estaciones para transportes
    
    
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
    	         {name:'nestacion_inicio',mapping:'nestacion_inicio',type:'string'}, // nos traemos tb los nombres para el grid
    	         {name:'nestacion_fin',mapping:'nestacion_fin',type:'string'}     	         
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
  //Creando el objeto Ext.grid.GridPanel para listar transportes
	var gridUt = new Ext.grid.GridPanel({		
		store: storeUt,
		id:'gridUt',
		columns: [			
		  	mySelectionModel1, //checkbox for 
		  	{id:'nombre',header:'Nombre', dataIndex:'nombre',sortable: true},
			{id:'estacion_inicio',header:'Inicio', dataIndex:'nestacion_inicio',sortable: true},			
			{id:'estacion_fin',header:'Fin', dataIndex:'nestacion_fin',sortable: true},			
			{id:'coste_x_km',header:'Coste/km', dataIndex:'coste_x_km', width:60,sortable: true},
			{id:'coste_x_dia',header:'Coste/dia', dataIndex:'coste_x_dia', width:60,sortable: true},
			{id:'activo',header:'Activo', dataIndex:'activo', width:50,sortable: true,renderer:codBoolean},
			{
                xtype: 'actioncolumn',
                width: 70,
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
	    	WEditUt.close();
		}
		
		
		  var formEditUt = new Ext.FormPanel({ 
		        labelWidth:70,		
		        url:'actualiza_ut.php', 
		        frame:true, 
		        title:'Editar Unidad de Transporte',         
		        monitorValid:true,
				defaults    : {allowBlank: false,width:'300px'}, 
				defaultType:'textfield',
				bodyStyle:'padding: 15px',
				items:[
					   {name:'nombre',fieldLabel:'Nombre'},
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
					   {xtype:'hidden',name:'id_transportes',id:'id_transportes'}
					   ],
				buttons:[{ 
		                text:'Guardar',
		                formBind: true,  
		                handler:function(){ 	                	
		                	formEditUt.getForm().findField('id_transportes').setValue(storeUt.getAt(index).get('id_transportes'));
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
		        closable: false,
		        resizable: false,
		        plain: true,
		        border: false,  
				layout: 'form',        
		        modal: true, //set the Window to modal  
		        items: [formEditUt]
		    });
		    
		  
	      var fila = storeUt.getAt(indice); // storeUt->recogemos la fila afectada
	      
	     // acomodo del valor de activo para el checkbox del formulario de editar
		  var valorActivo=0;
		  if(fila.get('activo')=='t') valorActivo=1;
		  fila.set('activo',valorActivo);
		  // cargamos el storeUt en el formulario
		  formEditUt.getForm().loadRecord(fila);
		  WEditUt.show();
		  
	  } // end editarUt
	  
	
	  
	  
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
  			   {name:'costeXdia',fieldLabel:'Coste/dia(€)',vtype:'alfa',width:'60px',vtype:'VEntero'}
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
                                  coste_x_dia   : formNuevoUt.getForm().getValues().costeXdia
                                  
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
          closable: false,
          resizable: false,
          plain: true,
          border: false,  
  		layout: 'form',        
          modal: true, //set the Window to modal  
          items: [formNuevoUt]
      });
      
 
	  	     
	        WCrearUt.show();
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
					showMarker(estacion.lon, estacion.lat, estacion.direccion);
				}
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
	    						    value:" Longuitud: ",
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
			var idUt = storeEs.getAt(indice);
			idUt.set('nombre', formEditEs.getForm().getValues().nombre);
	    	idUt.set('direccion', formEditEs.getForm().getValues().direccion);
	    	idUt.set('lat', formEditEs.getForm().getValues().lat);
	    	idUt.set('lon', formEditEs.getForm().getValues().lon);
	    	var vactivo="f";
	    	if (formEditEs.getForm().getValues().activo=="on") vactivo="t";	    	
	    	else
	    		{
	    		   // Para actualizar transportes en caso de tener estacion de inicio o fin esta estacion no activada
	    		     storeUt.reload();
	    		}
	    		
	    	idUt.set('activo', vactivo);
	    	WEditEs.close();
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
	    			   {name:'nombre',fieldLabel:'Nombre',width:'322px'},
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
	                    	 
	                    }
	                }
	    		] 
	               });  
	   
	        
	        
	        
	        // Ventana para crear nuevas unidades de transportes
	        var WCrearEs = new Ext.Window({
	            layout:'fit',
	            width:500,	            
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
	        minValue: new Date(), //<-- min date is today  	          
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
	       value:'00:00',
	       name: 'horaInicio',
           id: 'horaInicio'
	  });
	    
	    var FormCalcRuta = new Ext.FormPanel({ 
            labelWidth:40,		
            url:'calculo_ruta.php', 
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
	    
	   var activosE=new Array(); // Array con las estaciones activas(por donde debe pasar)
	   var activosUt=new Array(); // Array de transportes activos(transportes a usar)
	   var datosRutas=new Array(); // Array para el grid, para la representación de los resultados
	   
	   
	   // Función que calcula la ruta(secuencias de estaciones) recibe la fecha y hora de inicio
	   
	    function calculo(fecha,hora)
	    {
	    	
	    	 // creamos el array de objetos de estaciones activas, el índice del array es autonumerico (NO TOCAR)
	    	 var i=0;
	    	 storeEs.each(function(record,index)
  		    		{  	    		        
  				         if(record.get('activo')=='t')   
  				    	   {	  				        	
  				        	  activosE[i]=  				        	  
  				        	  {
  									id_estaciones: record.get('id_estaciones'),
  									nombre:record.get('nombre'),
  									lat:record.get('lat'),
  									lon:record.get('lon')
  								};
  				        	  i++;
  								  
  				    	   }
  		    	 
  		    		});
	    	 
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
	    	 var i=0;
	    	 storeUt.each(function(record,index)
	  		    		{  	  		    	        	  		    	       
	  				         if(record.get('activo')=='t')   
	  				    	   {	  		  				        	 
	  				        	 activosUt[i]=  				        	  
	  				        	  {
	  				        			id_transportes: record.get('id_transportes'),
	  									nombre:record.get('nombre'),
	  									estacionInicio:record.get('estacionInicio'),
	  									estacionFin:record.get('estacionFin'),
	  									coste_x_dia:record.get('coste_x_dia'),
	  									coste_x_km:record.get('coste_x_km')
	  								};
	  				        	     // Solo para el TSP, cortamos en el primer transporte	  				        	     
	  				        	     return false; // cortamos each para devolver el primer transporte activo(tsp)
	  				        	     // Fin solo para TSP	  				        	      
	  				    	   }
	  				           i++;	  				       
	  		    	 
	  		    		});
	    	
	    	 
	    	 	    	
	    	 
	    	 /*
              PARA mTSP y simulacion 
	    	 // creamos array de objetos transportes activos, el id del array es autonumerico
	    	 var i=0;
	    	 storeUt.each(function(record,index)
	  		    		{  	  		    	        	  		    	       
	  				         if(record.get('activo')=='t')   
	  				    	   {	  		  				        	 
	  				        	 activosUt[i]=  				        	  
	  				        	  {
	  				        			id_transportes: record.get('id_transportes'),
	  									nombre:record.get('nombre'),
	  									estacionInicio:record.get('estacionInicio'),
	  									estacionFin:record.get('estacionFin'),
	  									coste_x_dia:record.get('coste_x_dia'),
	  									coste_x_km:record.get('coste_x_km')
	  								};
	  				        	     // Solo para el TSP, cortamos en el primer transporte	  				        	     
	  				        	     //break;
	  				        	     // Fin solo para TSP
	  				        	      i++;
	  				    	   }
	  		    	 
	  		    		});
	  		   */
	    	 
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
	    	 
	  
	    	      
	    	      
	    	 
	    	   
	   	  //Array data for the grids de ejemplo
	    /*
	   	    var datosRutas = [
	   	                      
	   	        ['Sevilla->Badajoz','4/2 12:00am',71.72,0.02,'Transporte1'],
	   	        ['Badajoz->Madrid','4/2 12:00pm',71.72,0.02,'Transporte1'],
	   	        ['Madrid->Barcelona','4/2 12:00am',71.72,0.02, 'Transporte1'],
	   	        ['Barcelona->Bilbao','4/2 12:00pm',71.72,0.02, 'Transporte1'],
	   	        ['Bilbao->Santander','4/2 12:00am',71.72,0.02,'Transporte1'],
	   	        
	   	        ['Sevilla->Badajoz','4/2 12:00pm',71.72,0.02,'Transporte2'],
	   	        ['Badajoz->Mérida','4/2 24:00am',71.72,0.02,'Transporte2'],
	   	        ['Mérida->Plasencia','4/2 12:00am',71.72,0.02,'Transporte2'],
	   	        
	   	        ['Sevilla->Badajoz','4/2 12:00am',71.72,0.02,'Transporte3'],
	   	        ['Badajoz->Madrid','4/2 12:00am',71.72,0.02,'Transporte3'],
	   	        ['Madrid->Valencia','4/2 12:00am',71.72,0.02,'Transporte3'],
	   	        
	   	        ['Sevilla->Badajoz','4/2 12:00am',71.72,0.02,'Transporte4'],
	   	        ['Badajoz->Madrid','4/2 12:00am',71.72,0.02,'Transporte4'],
	   	        ['Madrid->Barcelona','4/2 12:00am',71.72,0.02,'Transporte4'],
	   	        ['Barcelona->Bilbao','4/2 12:00am',71.72,0.02,'Transporte4'],
	   	        ['Bilbao->Santander','4/2 12:00am',71.72,0.02,'Transporte4'],
	   	        ['Santander->Vigo','4/2 12:00am',71.72,0.02,'Transporte4']
	   	        
	   	    ];
	   	    */
	    	      
	    	      // Llamada a Ajax enviando los datos necesarios para el cáculo
	    	      //var dataObj=activosUt.concat(activosE);
	    	      var dataObj=new Array(4);
	    	      dataObj[0]=Ext.util.Format.date(fecha,"d/m/Y");
	    	      dataObj[1]=hora;
	    	      dataObj[2]=activosUt; // se envia los transportes activos
	    	      dataObj[3]=activosE; // se envia las estaciones activas
	    	      Ext.Ajax.request({
	    	    	  url: 'calculo.php',
	    	    	  jsonData: Ext.util.JSON.encode(dataObj),
	    	    	  success: function(action) 
	    	    	  { 	 
	    	    		  Ext.MessageBox.hide(); // Eliminamos el mensaje de calculando..	
	    	    		  obj = Ext.util.JSON.decode(action.responseText);
	    	    		  if(obj.success)
	    	    		  {
	    	    			  
	    	    			 var datosJson=obj.datos; // se tiene el json	    	    			   
	    	    			 // console.log(datosJson);
	    	    			 storeRutas.loadData(datosJson);
	    	    			 // se debe grabar en el store de las rutas almacenadas y en la busqueda de fechas
	    	    			 storeFechasRes.load();
	    	    			 storeFechas.load();
	    	    			 // console.log(storeRutas);
	    	            	 gridRuta.show();
	    	                
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
	    	      
	    	      
	    	 /*
	    	 // EMPEZAMOS LA SIMULACION --> Una estacion tras otra tal cual esta rellena en el store de estaciones
	    	 
	    	     var distanciaPasos=['2.5','4.1','3.5','6.2'];  // simulacion de distancias entre pasos
	    	     var horas=['25/03/2013 12:15','25/03/2013 12:42','25/03/2013 13:14','25/03/2013 13:31'];
	    	     var nt=""; // Nombre transporte
	    	     var costeT=""; // coste por cada transporte
	    	     var k=0; // variable indice de la tabla resultante
	    	 	 for(i=0;i<activosUt.length;i++) // por cada transporte
		    	 {	    	
	    	 		nt=activosUt[i].nombre;	        // nombre del transporte, nos hace falta para agrupar grid
	    	 		costeT=activosUt[i].coste_x_km; // coste de este transporte por km
	    	 		//console.log(costeT);
	    	 		for(j=0;j<activosE.length-1;j++) // por cada estacion
			    	 {	    		 
			    		  var obji=activosE[j];
			    		  var objf=activosE[j+1];
			    		  
			    	      var hora=horas[j];
			    	      var coste=distanciaPasos[j]*costeT;
			    	      var distancia=distanciaPasos[j];
			    	      
			    	      datosRutas[k]=[obji,objf,hora,coste,distancia,nt];
			    	      k++;
			    	      
			    	 }
	    	 		 
		    	 }
	    	 */	
	    	 	 
	    	 	 
	    	/* Fin de la simulacion */
	    		    	 
	    	 
	    	 
	    }
	    

	 
	    function escribeTrayecto(value, metaData, record, rowIndex, colIndex, store)
		{	//alert(record.get('activo'));	
			
	    	var paso=storeRutas.getAt(rowIndex).get('objFin').nombre; // nombre estacion de paso	    	
	    	return value.nombre + "->" + paso;
	    	
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
						{name: 'pasos',mapping: 'pasos',type: 'object'}
						
						
						
	        ]
	    });
	    
	        
	   
	    var storeRutas = new Ext.data.GroupingStore({	    	   
	            reader: myReader,	      	     	         
	            //sortInfo:{field: 'paso', direction: "ASC"},
	            groupField:'transporte'
	        });
	    
	  
	    
	    function Coste(value)
	    {
	    	return value + " €";
	    }
	    
	    function Km(value)
	    {
	    	return value + " Km";
	    }
	    function Ehora(value)
	    {
	    	return value + "h";
	    }
	    var gridRuta = new Ext.grid.GridPanel({
	        store: storeRutas,
	        columns: [	                   
	            {
	            	id:'paso',
	            	header: "Trayecto", 
	            	width: 60, 
	            	sortable: true, 
	            	dataIndex: 'objInicio',
	            	renderer:escribeTrayecto
          		}
	            ,
	            {header: "Hora", width: 30, sortable: true, renderer:Ehora, dataIndex: 'hora'},
	            {header: "Coste", width: 20, sortable: true, renderer: Coste, dataIndex: 'coste'},
	            {header: "Distancia", width: 20, sortable: true, dataIndex: 'km', renderer: Km},
	            {header: "Vehículo", width: 0, sortable: true, dataIndex: 'transporte',hidden:true}
	            
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
	        height: alto - 100,
	        collapsible: false,
	        animCollapse: false,
	        title: 'Cálculo de Rutas',
	        iconCls: 'icon-grid'
	      
	    });
	   
	    // click de un paso a otro
	    gridRuta.on('rowclick', function(grid, rowIndex, columnIndex, e) { 
	    	
	        //console.log("Indice del store: " + rowIndex);
	    	var inicio=storeRutas.getAt(rowIndex).get('objInicio');
	    	var fin=storeRutas.getAt(rowIndex).get('objFin');
	    	// en storeRutas.getAt(rowIndex).get('pasos'); se tiene array(lat,lon) con pasos intermedios
	    	var pasos=storeRutas.getAt(rowIndex).get('pasos');
	    	
	    	//console.log(inicio);
	    	//console.log(fin);
	    	drawSection(inicio, fin,pasos);
	    	     
	    
	    });
	    
	   // click en una ruta completa de un transporte
	    gridRuta.on('groupclick', function(grid, groupField, value, e) {
	    	
	    	var rutaT=new Array(); // se crea variable temporal que contendrá objetos de tipo estaciones que será el que se pase al metodo
	    	                       // pintar ruta
	    	var tmpRutaT=new Array();
	    	// Se busca los records afectados por ese record(nombre transporte) del store de rutas	    	 
	    	 var c1 = storeRutas.queryBy(function(record,id) {      	    	 
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
	    			   for(var i=0;i<pasos.length;i++)
	    			   {
	    				 
	    			       	  // creamos el objeto estacion
	    			       	  var estacion={
	    			       			                   id_estaciones:0,
	    			       			                   nombre:'',
	    			       			                   lat: pasos[i].split(",")[0],
	    			       			                   lon: pasos[i].split(",")[1]	    			       			                   
	    			       	                        }
	    			       	 j++;  
	    			       	 rutaT[j]=estacion;
	    			       	 
	    			   }
	    			}	    			 
	    			j++; 
	    			if(index==(tot-1)) 	rutaT[j]=item.get('objFin');
	    				
	    				
		    		 
                    // Ahora se pasa un array de arrays, en cada posicion		    		 
	    			 //rutaT[index]=item.get('objInicio');
	    			// if(index==(tot-1)) rutaT[index+1]=item.get('objFin');	    			  
	    			 
	    		 },this);
	    	 }
    	  //    console.log(rutaT);		    	 
	    	 // Pasamos un array de estaciones para pintar la ruta completa (tanto estaciones como pasos en orden)
	    	 // Las estaciones llegan un id,nombre en el objeto estaciones y los pasos con id=0 y nombre vacio
    	    drawRoute(rutaT);
	    		
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
	        height:200,
	        border: false,
	        bodyBorder:false,
	        hideHeaders: true,
	        stripeRows: true,
		    autoExpandColumn:'horaRes',
			layout: 'fit', // para ajustar a todo el tamaño del panel
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
			  		width:85,
			  		sortable: true,			  		
			  		style:"font-weight: bold;"
			  	},
			  	{
			  		id:'horaRes',
			  		header:'Hora',
			  		dataIndex:'hora',
			  		name: 'horaRes',
			  		width:20,
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
					    width:125,
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
	    
	    // El click en una fila del grid
	    gridFechasRes.on('rowclick', function(grid, rowIndex, columnIndex, e) {
	    	// Se tiene el index del store y sus valores
	    	//console.log(storeFechasRes.getAt(rowIndex).get("idRuta"));
	    	// recuperamos la ruta seleccionada
	    	var idruta=storeFechasRes.getAt(rowIndex).get("idRuta");
	    	// Esperar a la carga y mostrar resultados
	    	PResRutas.hide();
	    	
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
  	    			 var datosJson=obj.datos; // se tiene el json	    	    			   
  	    			 storeResRutas.loadData(datosJson);  	    			 
  	          	     PResRutas.show();
  	          	     gridResRutas.setTitle("Cálculo de Rutas de " + storeFechasRes.getAt(rowIndex).get("fecha") );
  	                 Ext.MessageBox.hide();	
  	                
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
	    
	   
	    var storeResRutas = new Ext.data.GroupingStore({	    	   
            reader: myReader,	      	     	         
            //sortInfo:{field: 'paso', direction: "ASC"},
            groupField:'transporte'
        });
	    
	    function escribeTrayectoRes(value, metaData, record, rowIndex, colIndex, store)
		{	//alert(record.get('activo'));	
			
	    	var paso=storeResRutas.getAt(rowIndex).get('objFin').nombre; // nombre estacion de paso	    	
	    	return value.nombre + "->" + paso;
	    	
		}
	    
	    var gridResRutas = new Ext.grid.GridPanel({
	        store: storeResRutas,
	     //   hideHeaders: true,
	        columns: [	                   
	            {
	            	id:'paso',
	            	header: "Trayecto", 
	            	width: 60, 
	            	sortable: true, 
	            	dataIndex: 'objInicio',
	            	renderer:escribeTrayectoRes
          		}
	            ,
	            {header: "Hora", width: 30, sortable: true, renderer:Ehora, dataIndex: 'hora'},
	            {header: "Coste", width: 20, sortable: true, renderer: Coste, dataIndex: 'coste'},
	            {header: "Distancia", width: 20, sortable: true, dataIndex: 'km', renderer: Km},
	            {header: "Vehículo", width: 0, sortable: true, dataIndex: 'transporte',hidden:true}
	            
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
	        height: alto - 255,
	        collapsible: false,
	        animCollapse: false,
	        title: 'Cálculo',
	        iconCls: 'icon-grid',
	        tbar:[
	              { 
					text:'Exportar',
					iconCls:'iconExportar',
					handler:function()
					 {
					    alert("Exportar en HTML o en PDF");							  
					 }
					}
	        ]
	      
	    });
	 
       
	    // click de un paso a otro
	    gridResRutas.on('rowclick', function(grid, rowIndex, columnIndex, e) { 
	    	
	        //console.log("Indice del store: " + rowIndex);
	    	var inicio=storeResRutas.getAt(rowIndex).get('objInicio');
	    	var fin=storeResRutas.getAt(rowIndex).get('objFin');
	    	// en storeRutas.getAt(rowIndex).get('pasos'); se tiene array(lat,lon) con pasos intermedios
	    	var pasos=storeResRutas.getAt(rowIndex).get('pasos');
	    	
	    //	console.log(inicio);
	   // 	console.log(fin);
	   // 	console.log(pasos);
	    	drawSection(inicio, fin,pasos);
	    	     
	    
	    });
	    
	   // click en una ruta completa de un transporte
	    gridResRutas.on('groupclick', function(grid, groupField, value, e) {
	    	
	    	var rutaT=new Array(); // se crea variable temporal que contendrá objetos de tipo estaciones que será el que se pase al metodo
	    	                       // pintar ruta
	    	var tmpRutaT=new Array();
	    	// Se busca los records afectados por ese record(nombre transporte) del store de rutas	    	 
	    	 var c1 = storeResRutas.queryBy(function(record,id) {      	    	 
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
	    			   for(var i=0;i<pasos.length;i++)
	    			   {
	    				 
	    			       	  // creamos el objeto estacion
	    			       	  var estacion={
	    			       			                   id_estaciones:0,
	    			       			                   nombre:'',
	    			       			                   lat: pasos[i].split(",")[0],
	    			       			                   lon: pasos[i].split(",")[1]	    			       			                   
	    			       	                        }
	    			       	 j++;  
	    			       	 rutaT[j]=estacion;
	    			       	 
	    			   }
	    			}	    			 
	    			j++; 
	    			if(index==(tot-1)) 	rutaT[j]=item.get('objFin');
	    				
	    				
		    		 
                    // Ahora se pasa un array de arrays, en cada posicion		    		 
	    			 //rutaT[index]=item.get('objInicio');
	    			// if(index==(tot-1)) rutaT[index+1]=item.get('objFin');	    			  
	    			 
	    		 },this);
	    	 }
    	     // console.log(rutaT);		    	 
	    	 // Pasamos un array de estaciones para pintar la ruta completa (tanto estaciones como pasos en orden)
	    	 // Las estaciones llegan un id,nombre en el objeto estaciones y los pasos con id=0 y nombre vacio
    	    drawRoute(rutaT);
	    		
       });
	    
	    
	    // Panel del tab Estaciones
	    var PResRutas = new Ext.Panel({  	         	          
	        monitorResize: true ,
	        layout: 'fit', // para ajustar a todo el tamaño del panel	      	               
	        items: [gridResRutas]          
	        
	    });
	    
	    // Al inicio este panel está vacio
	   PResRutas.hide();
	   
	    
	    
    //*****************************************************//	  
	//****************** FIN HISTORICO DE RUTAS***********//
	//*****************************************************//	    
		    
	    
	    
	//*****************************************************//
    //**************** PANELES GENERALES *****************//
	//*****************************************************//
	  
	  // Panel del tab Estaciones
	    var estaciones = new Ext.Panel({  
	        title:'Estaciones',  
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
	           iconCls: 'iconResultados',
	           autoHeight:'auto',
	          items:[FormCalcRuta,gridRuta]  
	       });
	    // Panel del tab Resultados
	       var resultados = new Ext.Panel({  
	           title:'Rutas Almacenadas',  	           
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
	 	    	// Necesario para que al editar un transporte, la estación de inicio y fin 
	 	    	// salga su nombre y no su id en el combo
	 	    	//store1.load();
	 	    	//store2.load();
	 	    //	storeUt.reload();
		       gridUt.getView().refresh();
	 	    });   
	      
	  //*****************************************************//
	    //**************** FIN PANELES GENERALES *****************//
		//*****************************************************// 
   


    
	
}); // FIN DE Ext.onReady


//functiones para redimensionar el mapa
function mapSizeUp() {
    var size = mapPanel.getSize();
    size.width += 40;
    size.height += 40;
    mapPanel.setSize(size);
}
function mapSizeDown() {
    var size = mapPanel.getSize();
    size.width -= 40;
    size.height -= 40;
    mapPanel.setSize(size);
}

//*************************************************
//			Controladores del Mapa
//*************************************************

//Registra un punto sobre el mapa con el icono que se pasa como parámetro.
function registerPoint(map, icon) {
    changeIconType(icon);
    map.events.register('click', map, function(e) {
        var xys = map.getLonLatFromViewPortPx(e.xy);
        if(markerClick) {
        	if(markerClick.popup) {
    			map.removePopup(markerClick.popup);
    		}
        	markerClick.lonlat = xys;
        	markers.redraw();
        } else {
        	markerClick = new OpenLayers.Marker(xys,actualIcon);
        	markers.addMarker(markerClick);
        }
//        creaElementosMapa(markerClick);
        showAddress(markerClick);
    });
}

function showMarker(lon, lat, dir) {
	var lonLat = new OpenLayers.LonLat(lon, lat);
	lonLat.transform(
			projGoogle, // de WGS 1984
			map.getProjection());
	
	if(markerClick) {
		if(markerClick.popup) {
			map.removePopup(markerClick.popup);
		} 
		markerClick.lonlat = lonLat;
		markerClick.direccion = dir;
		markers.redraw();
	} else {
		markerClick = new OpenLayers.Marker(lonLat, iconStation);
		
		markers.addMarker(markerClick);
		registerMoseOverMark(markerClick);
	}
	
	map.setCenter(lonLat, 15)
}

//Elimina un punto del mapa.
function unRegisterPoint(map) {
    map.events.unregister('click', map, registerClick);
}

//Función que se encarga de manejar los clicks sobre el mapa.
function registerClick(e) {
    var xys = map.getLonLatFromViewPortPx(e.xy);
    if(markerClick) {
    	markerClick.lonlat = xys;
    } else {
    	markerClick = new OpenLayers.Marker(xys,actualIcon);
    }
//    creaElementosMapa(markerClick);
    markers.addMarker(markerClick);
    showAddress(markerClick);
}

function creaElementosMapa(marker) {
    markers.addMarker(marker);
    marker.id = arrMarkers.length;
    arrMarkers[arrMarkers.length] = marker;
	//marker.point = new OpenLayers.Geometry.Point(marker.lonlat.lon, marker.lonlat.lat);
}

//Función que cambia el icono actual de las marcas por el que se pasa como parámetro.
function changeIconType(icon) {
    actualIcon = icon;
}

//Función encargada de registrar los clicks sobre las marcas del mapa y mostrar un popup informativo.
function registerMoseOverMark(marker) {
	var lonLatFormated = new OpenLayers.LonLat(marker.lonlat.lon, marker.lonlat.lat);
	lonLatFormated.transform(map.getProjection(), projGoogle);
    marker.events.register('click', marker, function() {
    	if(marker.popup) {
    		map.removePopup(marker.popup);
    		marker.popup.destroy();
    	}
		var popup = new OpenLayers.Popup.FramedCloud(marker.id,
				marker.lonlat,
				null,
				'<div style="width:250px;">'
				+ '<div><h3>' + marker.direccion + '<h3></div>'
				+ '<br /><div style:"padding-top:30px;>Lon: ' + lonLatFormated.lat + '<br />Lat: ' + lonLatFormated.lon + '</div>'
				//+ '<div style:"padding-top:20px; font-size: 10px;"><a href="javascript:removeMP(' + marker.id + ');">Eliminar</a></div>'
				//+ '</div>'
				,
				null,
				true
		);
		map.addPopup(popup);
		marker.popup = popup;
    	
    });
    
}

//Función encargada de eliminar una marca del mapa.
/*function removeMP(idM) {
    markers.removeMarker(arrMarkers[idM]);
    arrMarkers[idM].popup.destroy();
    arrMarkers[idM].destroy();
    arrMarkers[idM] = null;
}*/

function removeMP(marker) {
	marker.popup.destroy();
	marker.destroy();
}

//Función que elimina todas las marcas actuales del mapa.
function limpiarMapa() {
    for (var i = 0; i < arrMarkers.length; i++) {
        if(arrMarkers[i] != null) {
            markers.removeMarker(arrMarkers[i]);
            arrMarkers[i].destroy();
        }
    }
    arrMarkers = [];
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
			var latlongFormatGoogle = new OpenLayers.LonLat(markerIn.lonlat.lon, markerIn.lonlat.lat); 
			latlongFormatGoogle.transform(map.getProjectionObject(), projGoogle);
			
			var locationGMaps = new google.maps.LatLng(latlongFormatGoogle.lat, latlongFormatGoogle.lon);
			geocoder.geocode({ 'latLng': locationGMaps}, function(points, status) {
				markerIn.direccion = points[0].formatted_address;
				//Actualizamos los campos de la ventana para añadir una estación
		        Ext.getCmp('direccion').setValue(points[0].formatted_address);
		        Ext.getCmp('lon').setValue(latlongFormatGoogle.lon);
		        Ext.getCmp('lat').setValue(latlongFormatGoogle.lat);
			});
			
			registerMoseOverMark(markerIn);
			
		} else if (Ext.getCmp('direccionMapa').getValue()) { //si queremos unas coordenadas a partir de una dirección
			geocoder.geocode({ 'address': Ext.getCmp('direccionMapa').getValue()}, function(points, status) {
				if (!points && !(status == google.maps.GeocoderStatus.OK)) {
					alert(Ext.getCmp('direccionMapa').getValue() + "Dirección no encontrada.");
					return;
				} else {
					
					var centerPoint = new OpenLayers.LonLat(points[0].geometry.location.lng(), 
						points[0].geometry.location.lat());
						
					map.setCenter(centerPoint.transform(projGoogle, map.getProjectionObject()), 15);
				}
			});
		}
	}
}


//CÁLCULO DE RUTAS

var markersArray = [];
var pointArray = [];

function drawSection(startStation, endStation) {
	rutaParcial.removeAllFeatures();
	
	var style = { 
			  strokeColor: 'red', 
			  strokeOpacity: 1,
			  strokeWidth: 6
			};
	
	var pointStart = new OpenLayers.Geometry.Point(startStation.lon, startStation.lat);
	var pointEnd = new OpenLayers.Geometry.Point(endStation.lon, endStation.lat);
	
//	var line = new OpenLayers.Geometry.LineString([pointStart, pointEnd]);
	
	var arrPoints = [];
	arrPoints.push(pointStart);
	for ( var int = 0; int < tramos[startStation.id_estaciones].length; int++) {
		arrPoints.push(tramos[startStation.id_estaciones][int]);
	}
	arrPoints.push(pointEnd);
	
	var line = new OpenLayers.Geometry.LineString(arrPoints);
	var lineFeature = new OpenLayers.Feature.Vector(line, null, style);
	rutaParcial.addFeatures([lineFeature]);
	rutaParcial.redraw();
	
}

var vectorStyle = { 
		  strokeColor: '#0000ff', 
		  strokeOpacity: 0.5,
		  strokeWidth: 5
		};

function drawRoute(stations) {
	
	var lonLat;
	var marker;
	var point;
	var line;
	var lineFeature;
	
	for ( var i = 0; i < stations.length; i++) {
		marker = new OpenLayers.Marker(new OpenLayers.LonLat(stations[i].lon, stations[i].lat), iconStation.clone());
		markers.addMarker(marker);
		marker.direccion = stations[i].direccion;
//		registerMoseOverMark(marker);
		showAddress(marker);
		
		markersArray.push(marker);
		
		point = new OpenLayers.Geometry.Point(stations[i].lon, stations[i].lat);
		pointArray.push(point);
		
		if(i < stations.length - 1) {
			for (var j = 0; j < tramos[stations[i].id_estaciones].length; j++) {
				pointArray.push(tramos[stations[i].id_estaciones][j]);
			}
		}
	}
	markers.redraw();
	
	line = new OpenLayers.Geometry.LineString(pointArray);
	lineFeature = new OpenLayers.Feature.Vector(line, null, vectorStyle);
	
	ruta.addFeatures([lineFeature]);	
//	ruta.addFeatures(createDirection(line,'middle',true));

}

function cleanLayers() {
	markers.destroy();
	
	for ( var i = 0; i < markersArray.length; i++) {
		if (markersArray[i].popup) {
			map.removePopup(markersArray[i].popup);
		}
	}
}

function createMarkers() {
	markers = new OpenLayers.Layer.Markers( "Markers" );
	map.addLayer(markers);
	
}


/*VARIABLES TEMPORALES*/


var arrEstaciones;
var estacion;

function callRuta() {
	cleanLayers();
	createMarkers();
	generaEstaciones();
	drawRoute(arrEstaciones);
	drawSection(arrEstaciones[3], arrEstaciones[4]);
}

function generaEstaciones() {
	
	arrEstaciones = []
	estacion = new Object()
	
	estacion.nombre = 'Estación Tussam';
	estacion.id_estaciones = 19;
	estacion.lat = '4493186.1944477';
	estacion.lon = '-662081.32086346';
	estacion.direccion = 'Avenida de Andalucía (Tussam), 41007 Sevilla, España';
	estacion.activo = true;
	
	arrEstaciones.push(estacion);
	estacion = new Object()
	
	estacion.nombre = 'Estación San Juan de la Cruz';
	estacion.id_estaciones = 20;
	estacion.lat = '4492063.5255949';
	estacion.lon = '-663108.4434309';
	estacion.direccion = 'Avenida San Juan de la Cruz, 19, 41006 Sevilla, España';
	estacion.activo = true;
	
	arrEstaciones.push(estacion);
	estacion = new Object()
	
	estacion.nombre = 'Estación Ciudad Jardín';
	estacion.id_estaciones = 21;
	estacion.lat = '4491485.4705686';
	estacion.lon = '-663772.49011403';
	estacion.direccion = 'Calle Canal, 34, 41006 Sevilla, España';
	estacion.activo = true;
	
	arrEstaciones.push(estacion);
	estacion = new Object()
	
	estacion.nombre = 'Estación Hytasa';
	estacion.id_estaciones = 22;
	estacion.lat = '4490663.7725146';
	estacion.lon = '-663170.54851637';
	estacion.direccion = 'Avenida de Hytasa, 107-115, 41006 Sevilla, España';
	estacion.activo = true;
	
	arrEstaciones.push(estacion);
	estacion = new Object()
	
	estacion.nombre = 'Estación Palmera';
	estacion.id_estaciones = 23;
	estacion.lat = '4488989.2936256';
	estacion.lon = '-665718.42044223';
	estacion.direccion = 'Glorieta Plus Ultra, 41013 Sevilla, España';
	estacion.activo = true;
	
	arrEstaciones.push(estacion);
}

//puntos intermedios

var tramo1 = [
	new OpenLayers.Geometry.Point(-661653.52316518, 4493133.6137524),
	new OpenLayers.Geometry.Point(-661672.63242225, 4493121.6704667),
	new OpenLayers.Geometry.Point(-661648.74585091, 4493097.7838954),
	new OpenLayers.Geometry.Point(-661627.24793671, 4493081.0632955),
	new OpenLayers.Geometry.Point(-661663.07779371, 4492911.468639),
	new OpenLayers.Geometry.Point(-661713.23959352, 4492868.4728106),
	new OpenLayers.Geometry.Point(-662757.08276089, 4492288.0291271),
	new OpenLayers.Geometry.Point(-662776.19201796, 4492321.470327),
	new OpenLayers.Geometry.Point(-662814.4105321, 4492319.0816698),
	new OpenLayers.Geometry.Point(-662826.35381776, 4492237.8673273)];


var tramo2 = [
	new OpenLayers.Geometry.Point(-663497.5664723, 4491793.5771005),
	new OpenLayers.Geometry.Point(-663545.33961497, 4491827.0183003)];


var tramo3 = [
	new OpenLayers.Geometry.Point(-663944.24535628, 4491315.8456737),
	new OpenLayers.Geometry.Point(-663977.68655615, 4491289.5704453),
	new OpenLayers.Geometry.Point(-663980.07521328, 4491260.9065597),
	new OpenLayers.Geometry.Point(-663958.57729908, 4491258.5179025),
	new OpenLayers.Geometry.Point(-663929.91341348, 4491256.1292454),
	new OpenLayers.Geometry.Point(-663222.87090194, 4490694.794819)];

var tramo4 = [
	new OpenLayers.Geometry.Point(-662807.2445607, 4490441.5971629),
	new OpenLayers.Geometry.Point(-663304.08524448, 4489619.8991089),
	new OpenLayers.Geometry.Point(-663392.46555842, 4489591.2352233),
	new OpenLayers.Geometry.Point(-663392.46555842, 4489514.7981951),
	new OpenLayers.Geometry.Point(-663686.27038586, 4489029.900797),
	new OpenLayers.Geometry.Point(-664421.976783, 4488791.0350836),
	new OpenLayers.Geometry.Point(-664484.08186847, 4488791.0350836),
	new OpenLayers.Geometry.Point(-664484.08186847, 4488831.6422549),
	new OpenLayers.Geometry.Point(-664591.57143948, 4488800.5897122),
	new OpenLayers.Geometry.Point(-664610.68069655, 4488759.9825409),
	new OpenLayers.Geometry.Point(-664837.60312424, 4488783.8691122),
	new OpenLayers.Geometry.Point(-665353.5530651, 4488972.5730258),
	new OpenLayers.Geometry.Point(-665487.31786457, 4488977.35034),
	new OpenLayers.Geometry.Point(-665671.24446386, 4488867.4721119)];

var tramos = [];
tramos[19] = tramo1;
tramos[20] = tramo2;
tramos[21] = tramo3;
tramos[22] = tramo4;




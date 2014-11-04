// JavaScript Document

Ext.onReady(function(){
    Ext.QuickTips.init();
    Ext.form.Field.prototype.msgTarget = 'side';  
   
   
   
// FORMULARIO DE LOGIN

    var formLogin = new Ext.FormPanel({ 
        labelWidth:60, 
        renderTo:'contenido_login',
        url:'login.php', 
        frame:true, 
        title:'Acceso a OpenFleetServices', 
        defaultType:'textfield',
        monitorValid:true,
		defaults    : {allowBlank: false}, 
        bodyStyle:'padding: 10px',
   
        items:[{ 
                fieldLabel:'Email', 
                name:'email', 
				vtype:'email'
            },{ 
                fieldLabel:'Clave', 
                name:'clave', 
				id:'cclave',
                inputType:'password', 
				
            }],
 
            keys: {
                key: Ext.EventObject.ENTER,
                fn: submitLogin,
                formBind: true,  
                scope:this
            },
            	
          buttons:[
              { 
                text:'Entrar',
                formBind: true,  
                // añadimos tecla enter               
                handler: submitLogin, 
               },
               {
                text:'Registro',
                formBind: false ,
				handler:function()
				{					
					Ext.get('contenido_login').applyStyles('display: none');
					Ext.get('contenido_registro').applyStyles('display: block');
				}
                }] 
    });
    
   function submitLogin()
   {
       formLogin.getForm().submit
       ({ 
           method:'POST', 
           waitTitle:'Comprobando', 
           waitMsg:'Enviando datos...',

           success:function(){ 
			
			       var redirect = 'app.php'; 
	               window.location = redirect;      
           },
           failure:function(form, action){ 
               if(action.failureType == 'server'){ 
                   obj = Ext.util.JSON.decode(action.response.responseText);
                   Ext.Msg.show({
                       title:'Fallo de acceso',
                       msg:obj.errores.razon,
                       buttons: Ext.Msg.OK,
                       icon: Ext.Msg.WARNING,
						closable :false
                       
                   }); 
                   //Ext.Msg.alert('Fallo de identificación:', obj.errores.razon); 
               }else{ 
                   Ext.Msg.alert('Aviso:', 'Fallo de autentificación en el servidor : ' + action.response.responseText); 
               } 
               //formLogin.getForm().reset(); 
				Ext.getCmp('cclave').reset();
           } 
       }); 
   }
 
 // FORMULARIO DE REGISTRO
 
 var formRegistro = new Ext.FormPanel({ 
        labelWidth:70,
        renderTo:'contenido_registro',
        url:'registro.php', 
        frame:true, 
        title:'Registro en OpenFleetServices',         
        monitorValid:true,
		defaults    : {allowBlank: false,width:'200px'}, 
		defaultType:'textfield',
		bodyStyle:'padding: 15px',
		items:[
			   {name:'nombre',fieldLabel:'Nombre'},
			   {name:'apellidos',fieldLabel:'Apellidos'},
			   {name:'email',fieldLabel:'Email',vtype:'email'},
			   {name:'clave',fieldLabel:'Clave', inputType:'password'}
			   ],
		keys: {
                   key: Ext.EventObject.ENTER,
                   fn: registro,
                   formBind: true,  
                   scope:this
               },	   
		buttons:[				
				{ 
				    text:'Volver',				     
				    handler:function(){ 			
				    	Ext.get('contenido_registro').applyStyles('display: none');
						Ext.get('contenido_login').applyStyles('display: block');						
				    //	winRegistro.hide();
				    //	winLogin.show();
				    }
				},		
				{
                    xtype: 'tbspacer',
                    width: 145
                },                 
		        { 
                text:'Guardar',
                formBind: true,  
                handler: registro
                }] 
           });  
  
   function registro()
   {
       formRegistro.getForm().submit({ 
           method:'POST', 
           waitMsg:'Enviando datos...',
			waitTitle:'Espere por favor..', 
			
           success:function(){ 
			
			     var redirect = 'app.php'; 
                window.location = redirect;
           },

           failure:function(form, action){ 
               if(action.failureType == 'server'){ 
                   obj = Ext.util.JSON.decode(action.response.responseText);
                   Ext.Msg.show({
                       title:'Fallo de registro',
                       msg:obj.errores.razon,
                       buttons: Ext.Msg.OK,
                       icon: Ext.Msg.WARNING,
                       
                        
                       
                   }); 
                   //Ext.Msg.alert('Fallo de identificaci�n:', obj.errores.razon); 
               }else{ 
                   Ext.Msg.alert('Aviso:', 'Fallo de registro en el servidor : ' + action.response.responseText); 
               } 
         //      formLogin.getForm().reset(); 
           } 
       }); 
   }
  // formLogin.show();
  // formRegistro.show();      
   
   //var anchoR= Ext.getBody().getViewSize().width;
   //var centrado=(anchoR/2)-158;
 
   var winLogin = new Ext.Window({
        layout:'fit',
        width:300,
        height:150, 
        y:100,        
        closable: false,
        resizable: false,
        plain: true,
        border: false,  
		layout: 'form',        
        modal: true, //set the Window to modal  
        items: [formLogin]
        
    });
 //  winLogin.show();
	
	
	var winRegistro = new Ext.Window({
        layout:'fit',
        width:350,
        y:100,
        closable: false,
        resizable: false,
        plain: true,
        border: false,  
		layout: 'form',  		
        modal: true, //set the Window to modal  
        items: [formRegistro]      
    });
    
	
});

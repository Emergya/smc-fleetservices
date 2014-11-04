CREATE TABLE estaciones
(
  nombre character varying,
  lat character varying, -- Latitud
  lon character varying, -- Longuitd
  direccion character varying,
  id_usuario integer,
  activo boolean,
  id_estaciones serial NOT NULL,
  borrado boolean DEFAULT false,
  CONSTRAINT estaciones_pkey PRIMARY KEY (id_estaciones )
)
WITH (
  OIDS=FALSE
);
ALTER TABLE estaciones
  OWNER TO postgres;

CREATE TABLE transportes
(
  nombre character varying,
  estacion_inicio integer,
  estacion_fin integer,
  id_usuario integer,
  activo boolean,
  coste_x_km real,
  coste_x_dia real,
  id_transportes serial NOT NULL,
  borrado boolean DEFAULT false,
  CONSTRAINT transportes_pkey PRIMARY KEY (id_transportes )
)
WITH (
  OIDS=FALSE
);
ALTER TABLE transportes
  OWNER TO postgres;



CREATE TABLE usuarios
(
  nombre character varying,
  email character varying(100),
  clave character varying(100),
  apellidos character varying(100),
  id_usuarios serial NOT NULL,
  fecha character varying,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuarios )
)
WITH (
  OIDS=FALSE
);
ALTER TABLE usuarios
  OWNER TO postgres;


CREATE TABLE rutas
(
  id_rutas serial NOT NULL,
  fecha character(10),
  hora character(5),
  id_usuario integer,
  CONSTRAINT rutas_pkey PRIMARY KEY (id_rutas )
)
WITH (
  OIDS=FALSE
);
ALTER TABLE rutas
  OWNER TO postgres;


CREATE TABLE trayectos
(
  id_trayectos serial NOT NULL,
  id_rutas integer,
  id_transportes integer,
  CONSTRAINT trayectos_pkey PRIMARY KEY (id_trayectos ),
  CONSTRAINT trayectos_id_rutas_fkey FOREIGN KEY (id_rutas)
      REFERENCES rutas (id_rutas) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT trayectos_id_transportes_fkey FOREIGN KEY (id_transportes)
      REFERENCES transportes (id_transportes) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE trayectos
  OWNER TO postgres;
COMMENT ON TABLE trayectos
  IS 'Cada trayecto, es lo que recorre cada transporte en cada ruta';


CREATE TABLE tramos
(
  id_tramos serial NOT NULL,
  id_trayectos integer,
  coste real,
  distancia real,
  pasos character varying, -- Se detallan los puntos de paso, de la forma: ...
  inicio integer, -- id de la estacion de inicio del tramo
  fin integer, -- id de la estacion de fin
  hora character(20),
  CONSTRAINT tramos_pkey PRIMARY KEY (id_tramos ),
  CONSTRAINT tramos_id_trayectos_fkey FOREIGN KEY (id_trayectos)
      REFERENCES trayectos (id_trayectos) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE tramos
  OWNER TO postgres;
COMMENT ON COLUMN tramos.pasos IS 'Se detallan los puntos de paso, de la forma: 
lat1,lon1;lat2,lon2;lat3,lon3......;latn,lonn';
COMMENT ON COLUMN tramos.inicio IS 'id de la estacion de inicio del tramo';
COMMENT ON COLUMN tramos.fin IS 'id de la estacion de fin';




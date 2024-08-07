CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nombre_1 VARCHAR(50) NOT NULL,
	nombre_2 VARCHAR(50),
    apellido_1 VARCHAR(50) NOT NULL,
    apellido_2 VARCHAR(50),
	tipo_doc VARCHAR(50) NOT NULL,
	num_doc INT NOT NULL UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
	pais_nacimiento VARCHAR(70)
);

CREATE TABLE contacto (
    id SERIAL PRIMARY KEY,
    paciente_id INT NOT NULL,
	celular VARCHAR(30),
    telefono VARCHAR(30),
    email VARCHAR(100),
    direccion VARCHAR(255),
    paciente_id INTEGER NOT NULL REFERENCES pacientes (id),
	CHECK (celular IS NOT NULL OR telefono IS NOT NULL)
);

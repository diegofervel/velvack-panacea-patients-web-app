CREATE TABLE acudientes (
	id SERIAL PRIMARY KEY,
	nombre VARCHAR(200),
	telefono VARCHAR(30),
	parentesco VARCHAR(50),
	paciente_id INTEGER NOT NULL REFERENCES pacientes (id)
);
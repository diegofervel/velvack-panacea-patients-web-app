CREATE TABLE pacientes (
	id SERIAL PRIMARY KEY,
	nombre TEXT NOT NULL,
	apellido TEXT NOT NULL,
	fecha_nacimiento DATE,
	identi INT UNIQUE,
	email VARCHAR(255) UNIQUE,
	telefono_1 VARCHAR(15) CHECK (telefono_1 ~ '^[0-9+\-() ]*$'),
	telefono_2 VARCHAR(15) CHECK (telefono_1 ~ '^[0-9+\-() ]*$')
);
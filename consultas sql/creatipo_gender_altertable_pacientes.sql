--CREATE TYPE GENDER AS ENUM ('Masculino', 'Femenino', 'Indeterminado');

ALTER TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50),
    genero GENDER
);

ALTER TABLE pacientes
ALTER COLUMN genero TYPE gender
USING genero::gender;


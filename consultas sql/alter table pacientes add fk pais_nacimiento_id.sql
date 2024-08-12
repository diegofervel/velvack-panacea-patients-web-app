ALTER TABLE pacientes
ADD COLUMN pais_nacimiento_id INT REFERENCES paises(id);

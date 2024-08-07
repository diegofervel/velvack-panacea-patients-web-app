ALTER TABLE contacto
DROP COLUMN paciente_id;

ALTER TABLE contacto 
ADD COLUMN ciudad VARCHAR(50);

ALTER TABLE contacto 
ADD COLUMN paciente_id INTEGER NOT NULL REFERENCES pacientes(id);


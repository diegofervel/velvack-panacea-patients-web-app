ALTER TABLE pacientes
	ALTER COLUMN num_doc TYPE VARCHAR(50);

ALTER TABLE pacientes
	ADD CONSTRAINT chk_num_doc CHECK (num_doc ~ '^[A-Za-z0-9]+$');
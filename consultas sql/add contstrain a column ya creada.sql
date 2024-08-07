ALTER TABLE pacientes
ADD CONSTRAINT fk_tipo_doc_id
FOREIGN KEY (tipo_doc_id) REFERENCES tipo_documento(id);

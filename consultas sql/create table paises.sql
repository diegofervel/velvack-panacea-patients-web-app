CREATE TABLE paises (
    id SERIAL PRIMARY KEY,
    codigo_iso2 CHAR(2) NOT NULL UNIQUE CHECK(codigo_iso2 ~ '^[A-Z]{2}$'), -- Código de país (por ejemplo, 'CO' para Colombia)
    nombre VARCHAR(100) NOT NULL, -- Nombre del país en español
    nombre_ingles VARCHAR(100) NOT NULL, -- Nombre del país en inglés
    indicativo VARCHAR(5) NOT NULL -- Indicativo telefónico del país
);

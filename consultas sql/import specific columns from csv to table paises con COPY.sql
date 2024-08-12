\COPY paises (codigo_iso2, nombre, nombre_ingles, indicativo)
FROM 'C:/Users/diego/Documents/MEGA/Web Development Projects - DFV/Velvack Panacea Patients App/public/assets/paises.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
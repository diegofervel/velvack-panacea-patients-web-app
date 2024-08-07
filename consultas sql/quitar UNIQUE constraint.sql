-- Encuentra el nombre de la restricción UNIQUE
SELECT conname
FROM pg_constraint
WHERE conrelid = 'users'::regclass
AND contype = 'u';

-- Elimina la restricción UNIQUE (asegúrate de reemplazar 'users_email_key' con el nombre real de la restricción que encuentres)
ALTER TABLE users
DROP CONSTRAINT users_email_key;
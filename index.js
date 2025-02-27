import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';
import { validationResult } from 'express-validator';
import patientValidationRules from './public/patientValidationRules.js'; // cambiar a ruta más general usando librería path

const app = express();
const port = 3000; // const port = process.env.PORT || 3000;

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));
//app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'velvack_pacientes',
  password: 'root',
  port: 5432
});

db.connect();

let countries = [];
let atentionPrograms = [];

// Inicializar datos antes de configurar las rutas
(async function initializeData() {
  try {
    const paises = await db.query('SELECT * FROM paises ORDER BY id ASC');
    countries = paises.rows;

    const programas_atencion = await db.query('SELECT * FROM programa_atencion ORDER BY id ASC');
    atentionPrograms = programas_atencion.rows;

    // Ahora que los datos están cargados, configurar las rutas
    configureRoutes();

    // Iniciar el servidor
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Error initializing data:', err);
  }
})();

function configureRoutes() {
  let patientCreatedMessage = ''; // revisar esto, hacerlo mejor

  app.get('/', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM pacientes ORDER BY id ASC');
      let patients = result.rows;
      res.render('index.ejs', {
        patientsList: patients,
        alertMessage: patientCreatedMessage
      });
      patientCreatedMessage = '';
    } catch (err) {
      console.log(err);
    }
  });

  app.get('/patient-form/:id?', async (req, res) => {
    const id = parseInt(req.params.id);
    let patient = null;
    let formTitle = 'CREAR PACIENTE';
    if (id) {
      formTitle = 'EDITAR PACIENTE';
      const result = await db.query(
        `SELECT 
          pacientes.id AS "patientId", 
          pacientes.nombre_1 AS "patientFirstName", 
          pacientes.nombre_2 AS "patientSecondName", 
          pacientes.apellido_1 AS "patientFirstLastName", 
          pacientes.apellido_2 AS "patientSecondLastName", 
          pacientes.tipo_doc_id AS "patientIdType", 
          pacientes.num_doc AS "patientIdNumber", 
          pacientes.fecha_nacimiento AS "patientBirthDate", 
          pacientes.genero AS "patientGender", 
          pacientes.pais_nacimiento_iso2 AS "patientCountryBirth",
          pacientes.prog_atencion_id AS "patientAttentionProgram",   
          contacto.celular AS "patientMobile", 
          contacto.telefono AS "patientPhone", 
          contacto.email AS "patientEmail", 
          contacto.direccion AS "patientAddress",
          acudientes.nombre AS "relativeName",
          acudientes.telefono AS "relativePhone",
          acudientes.parentesco AS "relativeRelationship"
        FROM pacientes 
        LEFT JOIN contacto ON pacientes.id = contacto.paciente_id 
        LEFT JOIN acudientes ON pacientes.id = acudientes.paciente_id 
        WHERE pacientes.id = $1`,
        [id]
      );
      patient = result.rows[0];
    }
    try {
      res.render('patientForm.ejs', {
        formTitle: formTitle,
        countries: countries,
        atentionPrograms: atentionPrograms,
        patient: patient
      });
    } catch (err) {
      console.log(err);
    }
  });

  app.post('/patient-form/create', patientValidationRules(), async (req, res) => {
    let newP = req.body;
    const patientBirthDateFormat = moment(newP.patientBirthDate, 'DD/MM/YYYY'); // OJO: cambiar moment por "date-fns".
    newP.patientBirthDate = new Date(new Date(patientBirthDateFormat).toUTCString());

    let errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const result = await db.query(
          `INSERT INTO pacientes (nombre_1, nombre_2, apellido_1, apellido_2, tipo_doc_id, num_doc, 
          fecha_nacimiento, genero, pais_nacimiento_iso2, tipo_doc, prog_atencion_id, prog_atencion, pais_nacimiento) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 
          (SELECT nombre FROM tipo_documento WHERE id = $5), $10, 
          (SELECT nombre FROM programa_atencion WHERE id = $10), 
          (SELECT nombre FROM paises WHERE codigo_iso2 = $9)) RETURNING id`,
          [
            newP.patientFirstName.cap(),
            newP.patientSecondName.cap(),
            newP.patientFirstLastName.cap(),
            newP.patientSecondLastName.cap(),
            newP.patientIdType,
            newP.patientIdNumber,
            newP.patientBirthDate,
            newP.patientGender.cap(),
            newP.patientCountryBirth,
            newP.patientAttentionProgram
          ]
        );

        const patientTableId = result.rows[0].id;

        await db.query(
          'INSERT INTO contacto (celular, telefono, email, direccion, paciente_id) VALUES ($1, $2, $3, $4, $5)',
          [newP.patientMobile, newP.patientPhone, newP.patientEmail, newP.patientAddress, patientTableId]
        );

        await db.query('INSERT INTO acudientes (nombre, telefono, parentesco, paciente_id) VALUES ($1, $2, $3, $4)', [
          newP.relativeName,
          newP.relativePhone,
          newP.relativeRelationship,
          patientTableId
        ]);

        patientCreatedMessage = 'El paciente se ha creado satisfactoriamente. ✔';
        res.redirect('/');
      } catch (err) {
        console.log(err);
      }
    } else {
      if (errors.array().length > 0) {
        res.render('patientForm.ejs', {
          formTitle: 'CORREGIR FORMULARIO',
          countries: countries,
          atentionPrograms: atentionPrograms,
          patient: newP,
          errors: errors.array()
        });
      }
    }
  });
}

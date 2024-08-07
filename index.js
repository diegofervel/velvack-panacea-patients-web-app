import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import moment from 'moment';
import { validationResult } from 'express-validator';
import patientValidationRules from './public/patientValidationRules.js'; // cambiar a ruta más general usando librería path
//import path from "path"; // const path = require('path');

const app = express();
const port = 3000; // const port = process.env.PORT || 3000;

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.json());

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'velvack_pacientes',
  password: 'root',
  port: 5432
});

db.connect();

let patientCreatedMessage = '';

app.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM pacientes ORDER BY id ASC');
    let patients = result.rows;
    //console.log(patients);
    res.render('index.ejs', {
      patientsList: patients,
      alertMessage: patientCreatedMessage
    });
    patientCreatedMessage = '';
  } catch (err) {
    console.log(err);
  }
});

app.get('/patient-form/:edit?/:id?', async (req, res) => {
  let patient = null; // Reset patient for each request
  let formTitle = 'CREAR PACIENTE';
  const id = parseInt(req.params.id);
  if (id) {
    formTitle = 'EDITAR PACIENTE';
    console.log(id);
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
      pacientes.pais_nacimiento AS "patientCountryBirth",
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
    ); //("SELECT * FROM pacientes WHERE id = $1", [id]);
    patient = result.rows[0];
    console.log(patient);
  }
  try {
    res.render('patientForm.ejs', { patient: patient, formTitle: formTitle /*, errors: errors */ });
    formTitle = 'CREAR PACIENTE'; // Evaluar esto, creo que ya no es necesario.
  } catch (err) {
    console.log(err);
  }
});

const cap = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
String.prototype.cap = function () {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

app.post('/create', patientValidationRules(), async (req, res) => {
  let newP = req.body;
  const patientBirthDateFormat = moment(newP.patientBirthDate, 'DD/MM/YYYY'); // OJO: cambiar moment por "date-fns".
  newP.patientBirthDate = new Date(new Date(patientBirthDateFormat).toUTCString());
  console.log('newP.patientBirthDate: ' + newP.patientBirthDate);

  let errors = validationResult(req);
  if (errors.isEmpty()) {
    try {
      //const birthDateMoment = moment(newP.patientBirthDate, 'DD/MM/YYYY');
      //const formattedBirthDate = birthDateMoment.isValid() ? birthDateMoment.format('YYYY-MM-DD') : '';
      const result = await db.query(
        `INSERT INTO pacientes (nombre_1, nombre_2, apellido_1, apellido_2, tipo_doc_id, num_doc, 
        fecha_nacimiento, genero, pais_nacimiento, tipo_doc, prog_atencion_id, prog_atencion) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, (SELECT nombre FROM tipo_documento WHERE id = $5), $10, 
        (SELECT nombre FROM programa_atencion WHERE id = $10)) RETURNING id`,
        [
          newP.patientFirstName.cap(),
          newP.patientSecondName.cap(),
          newP.patientFirstLastName.cap(),
          newP.patientSecondLastName.cap(),
          newP.patientIdType,
          newP.patientIdNumber,
          newP.patientBirthDate,
          //formattedBirthDate,
          newP.patientGender.cap(),
          newP.patientCountryBirth.cap(),
          newP.patientAttentionProgram
        ]
      );
      //console.log('patientAttentionProgram: ' + newP.patientAttentionProgram)
      const patientTableId = result.rows[0].id;
      //console.log(patientTableId)

      await db.query(
        'INSERT INTO contacto (celular, telefono, email, direccion, paciente_id) VALUES ($1, $2, $3, $4, $5)',
        [newP.patientMobile, newP.patientPhone, newP.patientEmail, newP.patientAddress, patientTableId]
      );

      //Aquí debe ir la consulta a la db para insertar en tabla acudiente y relacionarla con id
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
      console.log('patientBirthDate: ' + newP.patientBirthDate);
      res.render('patientForm.ejs', {
        errors: errors.array(),
        patient: newP,
        formTitle: 'CORREGIR FORMULARIO'
      });
    }
    /*
    if (errors.array().length > 0) {
      errors = errors.array();
      patient = req.body;
      res.redirect("patient-form");
    } else {
      res.redirect("/"); 
    }
*/
    //res.redirect("/patient-form");
  }
});

// OJO: Tabla para acudiente: newP.patientAttentionProgram, etc.

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//FUNCIONES:
/*
function mapDbNamesToFieldNames(key) {
  switch (key) {
    case "nombre_1":
      return "patientFirstName";
    case "nombre_2":
      return "patientSecondName";
    case "apellido_1":
      return "patientFirstLastName";
    case "apellido_2":
      return "patientSecondLastName";
    case "tipo_doc_id":
      return "patientIdType";
    case "num_doc":
      return "patientIdNumber";
    case "fecha_nacimiento":
      return "patientBirthDate";
    case "genero":
      return "patientGender";
    case "pais_nacimiento":
      return "patientCountryBirth";
    case "prog_atencion":
      return "patientAttentionProgram";
    case "celular":
      return "patientMobile";
    case "telefono":
      return "patientPhone";
    case "email":
      return "patientEmail";
    case "direccion":
      return "patientAddress";
    default:
      return key;
  }
}
*/

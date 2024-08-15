import { body } from 'express-validator';

const patientValidationRules = () => {
  return [
    body('patientFirstName')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Por favor, ingrese el primer nombre del paciente.')
      .matches(/^[A-Za-z0-9ñÑ]+$/)
      .withMessage('Este campo solo puede contener letras o números.'),
    // { checkFalsy: true } permite cadenas vacías además de undefined y null
    body('patientSecondName')
      .trim()
      .escape()
      .optional({ checkFalsy: true })
      .matches(/^[A-Za-z0-9ñÑ]+$/)
      .withMessage('Este campo solo puede contener letras o números.'),
    body('patientFirstLastName')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Por favor, ingrese el primer apellido del paciente.')
      .matches(/^[A-Za-z0-9ñÑ]+$/)
      .withMessage('Este campo solo puede contener letras o números.'),
    body('patientSecondLastName')
      .trim()
      .escape()
      .optional({ checkFalsy: true })
      .matches(/^[A-Za-z0-9ñÑ]+$/)
      .withMessage('Este campo solo puede contener letras o números.'),
    body('patientIdType')
      .notEmpty()
      .withMessage('Por favor, seleccione el tipo de documento del paciente.')
      .isInt()
      .withMessage('Este campo solo puede contener el número correspondiente al tipo de documento.'),
    body('patientIdNumber')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Por favor, ingrese el número de documento del paciente.')
      .matches(/^[A-Za-z0-9ñÑ]+$/)
      .withMessage('Este campo solo puede contener números.'),
    body('patientBirthDate')
      .notEmpty()
      .withMessage('Por favor, ingrese la fecha de nacimiento del paciente.')
      .isDate({ locale: 'es-CO', format: 'DD/MM/YYYY' })
      //.isDate()
      .withMessage('Por favor, ingrese una fecha en formato correcto DD/MM/YYYY.'),
    body('patientGender')
      .notEmpty()
      .withMessage('Por favor, seleccione el género del paciente.')
      .isIn(['Masculino', 'Femenino', 'Indeterminado'])
      .withMessage('Género inválido.'),
    body('patientCountryBirth')
      .trim()
      .escape()
      .optional({ checkFalsy: true })
      //.matches(/^[A-Za-z0-9 ñÑ]+$/)
      .matches(/^[A-Za-z ñÑ]+$/)
      .withMessage('Este campo solo puede contener el código de país iso2 como valor'),
    body('patientMobile')
      //.isMobilePhone('any')
      //.withMessage('Número de celular inválido.')
      .custom((value, { req }) => {
        if (!value && !req.body.patientPhone) {
          return false;
        }
        return true;
      })
      .withMessage('Diligencie al menos uno de los campos número de celular o número telefónico.'),
    body('patientPhone')
      //.isMobilePhone('any')
      //.withMessage('Número telefónico inválido.')
      .custom((value, { req }) => {
        if (!value && !req.body.patientMobile) {
          return false;
        }
        return true;
      })
      .withMessage('Diligencie al menos uno de los campos número de celular o número telefónico.'),
    body('patientEmail').optional({ checkFalsy: true }).isEmail().withMessage('Correo electrónico inválido.'),
    // A patientAddress no le aplico validación.
    body('patientAttentionProgram')
      .trim()
      .notEmpty()
      .withMessage('Por favor, seleccione el programa de atención del paciente.')
      .isInt()
      .withMessage('Programa de atención inválido.'),
    body('relativeName')
      .trim()
      .escape()
      .optional({ checkFalsy: true })
      .matches(/^[A-Za-z0-9 ñÑ]+$/)
      .withMessage('Este campo solo puede contener letras o números.'),
    body('relativePhone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Número telefónico inválido.'),
    body('relativeRelationship')
      .trim()
      .escape()
      .optional({ checkFalsy: true })
      .matches(/^[A-Za-z0-9 ñÑ]+$/)
      .withMessage('Este campo solo puede contener letras o números.')
  ];
};

export default patientValidationRules;

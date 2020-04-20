const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { isLoggedIn } = require('../lib/auth');
const { renderUserProfile } = require('../controllers/user.controller');
const credentials = require('../../credentials.json');
const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../database');
const helpers = require('../lib/helpers');
const uuid = require('uuid');



router.get('/profile', isLoggedIn, renderUserProfile);

router.get('/profile/create_users', isLoggedIn, (req, res) => {
  // res.render('apis/create_users');
});


router.post('/profile/create_users', isLoggedIn, async (req, res) => {
  // // Sacamos del formulario el id de la hoja
  // const sheetId = req.body.sheetId;
  // const oauth2 = helpers.obtenerAuth(req);
  // const service = google.admin({ version: 'directory_v1', auth: oauth2 });
  // switch (sheetId) {
  //   case "":
  //     var { email, nombre, apellidos, telefono, pass, alias } = req.body;
  //     var alias_array = alias.split(',');
  //     service.users.insert({
  //       resource: {
  //         "name": {
  //           "familyName": apellidos,
  //           "givenName": nombre
  //         },
  //         "password": pass,
  //         "primaryEmail": email,
  //         "changePasswordAtNextLogin": false
  //       }
  //     }).then((res) => {
      
  //        req.flash('success', 'Usuario añadido correctamente');
  //        req.redirect('/');
  //       // // Añadimos los alias
  //       // for (const key in alias_array) {
  //       //   service.users.aliases.insert({
  //       //     userKey: email,
  //       //     resource: {
  //       //       alias: alias_array[key]
  //       //     }
  //       //   }).then((res) => {
  //       //     console.log(res);
  //       //   })
  //       // }
  //     })
  //     // Si está vacío los añadiras manualmente
  //     break;

  //   default:


  //     var parametros = {
  //       "ranges": {
  //         "correo_principal": "A2:A",
  //         "nombre": "B2:B",
  //         "apellido": "C2:C",
  //         "alias": "D2:D",
  //         "correo_recuperacion": "F2:F",
  //         "telefono": "G2:G",
  //         "grupos": "Grupos Google!A2:A",
  //         "miembros_grupos": "Grupos Google!B2:B"
  //       }
  //     }
  //     var alias_array = new Array();
  //     var correo_principal = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, parametros.ranges.correo_principal)).data.values;

  //     var nombres = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, parametros.ranges.nombre)).data.values;
  //     var apellidos = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, parametros.ranges.apellido)).data.values;
  //     var alias = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, parametros.ranges.alias)).data.values;
  //     for (key in correo_principal) {
  //       if (alias.length != 0) {
  //         alias_array.push(alias[key][0].split(','));
  //       }
  //     }
  //     var correo_recuperacion = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, parametros.ranges.correo_recuperacion)).data.values;
  //     var telefono = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, parametros.ranges.telefono)).data.values;
  //     await addUsers(oauth2, correo_principal, nombres, apellidos, alias_array, correo_recuperacion, telefono);
  //     async function addUsers(oauth2, correo_principal, nombres, apellidos, alias_array, correo_recuperacion, telefono) {
  //       console.log(alias_array)
  //       const service = google.admin({ version: 'directory_v1', auth: oauth2 });
  //       for (const key in correo_principal) {
  //         service.users.insert({
  //           resource: {
  //             "name": {
  //               "familyName": apellidos[key][0],
  //               "givenName": nombres[key][0]
  //             },
  //             "password": `${nombres[key][0]}@2020`,
  //             "primaryEmail": correo_principal[key][0],
  //             "changePasswordAtNextLogin": false
  //           }
  //         }).then((res) => {
  //           console.log(`El usuario ${correo_principal[key][0]} se ha creado correctamente`);
  //           for (const key2 in alias_array) {
  //             console.log(alias_array[key][key])
  //             service.users.aliases.insert({
  //               userKey: correo_principal,
  //               resource: {
  //                 alias: alias_array[key][key2]
  //               }

  //             }).then((res_alias) => {
  //               console.log('***************************************************************************');
  //               console.log('se ha insertado correctamente el alias' + alias_array[key][key]);
  //               req.flash('agshdagshd', 'message')
  //             }).catch((err_alias) => {
  //               console.log('No se ha insertado el alias ' + alias_array[key][key2]);
  //             })
  //           }

  //         }).catch((err) => {

  //           if (err.code == 409) {
  //             console.log(`El usuario ${correo_principal[key][0]} ya existe`);
  //           }

  //         })
  //       }
  //     }
  //     break;
  // }

});











module.exports = router;
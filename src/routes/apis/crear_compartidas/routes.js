const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { isLoggedIn } = require('../../../lib/auth');
const { renderUserProfile } = require('../../../controllers/user.controller');
const credentials = require('../../../../credentials.json');
const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../../../database');
const helpers = require('../../../lib/helpers');
const uuid = require('uuid');


router.get('/profile/create_drive_units', (req, res) => {
    res.render('apis/crear_unidades/main');
});


router.post('/profile/create_drive_units', isLoggedIn, async (req, res) => {
    const { nombre_unidad, sheetId, email, rol, nombre_hoja } = req.body;
    var oauth2 = helpers.obtenerAuth(req);
    var requestId = uuid.v4();
    const service = google.drive({ version: 'v3', auth: oauth2 });
    const sheet = google.sheets({ version: 'v4', auth: oauth2 });
    var datos = { oauth2, service, nombre_unidad, sheetId, email, rol, requestId };
    const parametros = require('./config');




    switch (sheetId) {
        case "":
            helpers.crearUnidadesCompartidas(drive, datos, req, res);
            break;

        default:
            var unidades = new Array();
            var roles = ['organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'];

            var rg_unidades = `${nombre_hoja}!${parametros.unidad}`;
            var rg_rol = `${nombre_hoja}!${parametros.rol}`;
            var rg_usuarios = `${nombre_hoja}!${parametros.usuarios}`;

            var unidades = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_unidades)).data.values;
            console.log(unidades);
            
            var roles = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_rol)).data.values;
            var usuarios = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_rol)).data.values



            
            if(unidades.length==0){
                req.flash('message','No se han obtenido las unidades, puede ser que no tengas permisos en la sheet');
            }            
            for (const key in unidades) {
                await helpers.crearUnidadesCompartidas(oauth2,service,unidades[key], requestId, req, res);
            }
            res.redirect('/profile/create_drive_units');



            // res.send(unidades);
            break;
    }


});



module.exports = router;
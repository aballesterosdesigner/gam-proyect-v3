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


router.post('/profile/create_drive_units', isLoggedIn, async(req, res) => {
    const { nombre_unidad, sheetId, email, rol,nombre_hoja} = req.body;
    var oauth2 = helpers.obtenerAuth(req);
    var requestId = uuid.v4();
    const service = google.drive({ version: 'v3', auth: oauth2 });
    const sheet = google.sheets({version:'v4',auth:oauth2});
    var datos = { oauth2, service, nombre_unidad, sheetId, email, rol, requestId};
    const parametros = require('./config');

    console.log(nombre_hoja)



    switch (sheetId) {
        case "":
            helpers.crearUnidadesCompartidas(oauth2, drive, datos, req, res);
        break;

        default:
            // var rg_unidades = `${nombre_hoja}!${parametros.unidad}`;
            var unidades = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, 'A2:A')).data.values;
            console.log(await unidades);
        break;
    }


});



module.exports = router;
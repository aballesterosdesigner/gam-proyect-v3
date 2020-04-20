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
const hp_sheets = require('../../../lib/helpers/SheetAPI/hp.sheets');
const hp_users = require('../../../lib/helpers/DirectoryAdmin/helpers.users');
const uuid = require('uuid');
var parametros = require('./config');


router.get('/profile/create_users',(req,res)=>{
    res.render('apis/create_users/main');
});


router.post('/profile/create_users', isLoggedIn, async (req, res) => {
    // Sacamos del formulario el id de la hoja
    const sheetId = req.body.sheetId;
    const oauth2 = helpers.obtenerAuth(req);
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });

    var correos = ((await helpers.obtenerValoresSheet(oauth2, google, sheetId, parametros.correo)).data.values);
    var nombres = ((await helpers.obtenerValoresSheet(oauth2, google, sheetId, parametros.nombre)).data.values);
    var apellidos = ((await helpers.obtenerValoresSheet(oauth2, google, sheetId, parametros.apellidos)).data.values);
    var alias = ((await helpers.obtenerValoresSheet(oauth2, google, sheetId, parametros.alias)).data.values);

    

    for(const i in nombres){
        var email = correos[i];
        var nombre = nombres[i];
        var apellidos = apellidos[i];
        var lon = nombres.length;
    
        await hp_users.addUsersSheet(oauth2,nombres,apellidos,correos,req,res);
    
    }






    

});





  



module.exports = router;
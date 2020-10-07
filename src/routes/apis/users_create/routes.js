const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
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
const { write } = require('../../../lib/helpers/SheetAPI/hp.sheets');
const fs = require('fs');


router.get('/profile/create_users', (req, res) => {
    res.render('apis/create_users/main');
});


router.post('/profile/create_users', isLoggedIn, async (req, res) => {
    // Sacamos del formulario el id de la hoja
    const { sheetId, domain } = req.body;
    const oauth2 = helpers.obtenerAuth(req);
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    const gmail = google.gmail({ version: 'v1', auth: oauth2 });
    var logs = new Array();

    var idUser = req.user.profile.id;
    var correos = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, parametros.correo)).data.values);
    var nombres = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, parametros.nombre)).data.values);
    var apellidos = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, parametros.apellidos)).data.values);
    var alias = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, parametros.alias)).data.values);
    var telefono = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, parametros.telefono)).data.values);

    /** Creaccion de usuarios*/
    var logs = await hp_users.createUsers(oauth2, domain, correos, nombres, apellidos, telefono, sheetId);
    var user = await hp_users.obtainById(idUser, oauth2, domain);
    await res.render('logs/main', { logs: logs });
});
router.post('/profile/create_users/insert_alias', isLoggedIn, async (req, res) => {
    const { sheetId, domain } = req.body;
    const oauth2 = helpers.obtenerAuth(req);
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    const gmail = google.gmail({ version: 'v1', auth: oauth2 });

    var correos = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, parametros.correo)).data.values);
    var alias = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, parametros.alias)).data.values);

    // Insert alias
    var logs = await hp_users.insertAlias(oauth2, correos, alias, sheetId);
    res.render('logs/main', { logs: logs });
});

router.get('/profile/create_users/download', (req, res, err) => {
    var file = "logsUsersCreate.txt";
    res.download(file); // Set disposition and send it.
});
router.get('/profile/create_users/boris', (req, res) => {
    var file = "boris.txt";
    res.download(file); // Set disposition and send it.
});

router.get('/profile/create_users/resetLogs', (req, res) => {
    fs.unlinkSync('logsUsersCreate.txt');
    fs.writeFileSync('logsUsersCreate.txt', '');
    res.redirect('/profile/create_users');
});


router.get('/profile/create_users/read', (req, res) => {
    const rStream = fs.createReadStream('boris.txt')
    rStream.on('data', b => {
        const bStr = b.toString();
    });


})












module.exports = router;
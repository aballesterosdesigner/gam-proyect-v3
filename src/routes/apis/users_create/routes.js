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



router.get('/profile/create_users', (req, res) => {
    res.render('apis/create_users/main');
});


router.post('/profile/create_users', isLoggedIn, async (req, res) => {
    // Sacamos del formulario el id de la hoja
    const {sheetId,domain} = req.body;
    const oauth2 = helpers.obtenerAuth(req);
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    const gmail = google.gmail({version:'v1',auth:oauth2});
    var logs = new Array();

    var idUser = req.user.profile.id;
    var correos = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, parametros.correo)).data.values);
    var nombres = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, parametros.nombre)).data.values);
    var apellidos = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, parametros.apellidos)).data.values);
    var alias = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, parametros.alias)).data.values);
    var telefono = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, parametros.telefono)).data.values);
    //await hp_users.addUsersSheet(oauth2, nombres, apellidos, correos, alias, telefono, req, res);


    var logs_users= await hp_users.createUsers(oauth2,domain,correos,nombres,apellidos,telefono,sheetId);
    //var logs_alias = await hp_users.insertAlias(oauth2,correos,alias);
    

    for(const i in logs_users){logs.push(logs_users[i])}
    //for(const i in logs_alias){logs.push(logs_alias[i])}
        var user = await hp_users.obtainById(idUser,oauth2,domain);
        //await res.download("usuarios.txt");
        await res.render('logs/main',{logs:logs});
        
        await hp_users.insertAlias(oauth2,correos,alias);
    //await res.redirect('/profile/create_users');
});


router.get('/profile/create_users/download',(req,res)=>{
    var file ="usuarios.txt";
    res.download(file); // Set disposition and send it.
});

router.get('/profile/create_users/test',async(req,res)=>{
    const auth = helpers.obtenerAuth(req);
    var arr = new Array();
    var res = [[1],[2],[3]];
    var data =  await hp_sheets.obtenerValoresSheet(auth, google, '1g9IrcmW9_Bzcsv8BgBT198tneIzOTHbkbq29cVnVghA', 'Pass!A1:A');

    var longData = data.data.values.length;
    var longRes = res.length;

    var limit = longData+parseInt(1);
    var fin = limit+longRes;

    var cont = 1;

    for(var i = 0;i<=res.length-1;i++){
        console.log(cont++);
        console.log(res[i]);

        //console.log(cont++);
        //hp_sheets.write(auth,'1g9IrcmW9_Bzcsv8BgBT198tneIzOTHbkbq29cVnVghA',`Pass!A${i}`);
    }
    




});







module.exports = router;
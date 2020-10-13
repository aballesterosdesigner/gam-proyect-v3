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
const { write } = require('../../../lib/helpers/SheetAPI/hp.sheets');
const fs = require('fs');


router.get('/profile/logs',isLoggedIn,async(req,res)=>{
    const oauth2 = helpers.obtenerAuth(req);
    var d = new Date();
    const logs = await pool.query('SELECT * FROM logs');
    const idSheet = await (await hp_sheets.createSheet(oauth2,`Logs ${d}`)).data.spreadsheetId;
    console.log(idSheet);
    
    const service = google.sheets({ version: 'v4', auth: oauth2});

    var fechas = new Array();
    var types = new Array();
    var motivos = new Array();
    var modulos = new Array();

    for(i in logs){
        var auxFecha = new Array();
        var auxType = new Array();
        var auxMotivo = new Array();
        var auxModulo = new Array();

        auxFecha.push(logs[i].fecha);
        auxType.push(logs[i].type);
        auxMotivo.push(logs[i].motivo);
        auxModulo.push(logs[i].modulo);


    
        fechas.push(auxFecha);
        types.push(auxType);
        motivos.push(auxMotivo);
        modulos.push(auxModulo);
    }



    await hp_sheets.write(oauth2,idSheet,'A2:A',fechas);
    await hp_sheets.write(oauth2,idSheet,'B2:B',types);
    await hp_sheets.write(oauth2,idSheet,'C2:C',motivos);
    await hp_sheets.write(oauth2,idSheet,'D2:D',modulos);


    res.redirect(`https://docs.google.com/spreadsheets/d/${idSheet}/edit#gid=0`)
    
    

});


router.get('/profile/logs/users',async(req,res)=>{
    const oauth2 = helpers.obtenerAuth(req);
    var d = new Date();
    const sheetId = await (await hp_sheets.createSheet(oauth2,`Usuarios ${d}`)).data.spreadsheetId;
    var usuarios = await pool.query('SELECT * FROM usuarios');

    var emails = new Array();
    var nombres = new Array();
    var apellidos = new Array();
    var pases = new Array();

    for (const i in usuarios) {
        var auxEmail = new Array();
        var auxNombre = new Array();
        var auxApellido = new Array();
        var auxPass = new Array();

        auxEmail.push(usuarios[i].email);
        auxNombre.push(usuarios[i].nombre);
        auxApellido.push(usuarios[i].apellidos);
        auxPass.push(usuarios[i].pass);

        emails.push(auxEmail);
        nombres.push(auxNombre);
        apellidos.push(auxApellido);
        pases.push(auxPass);

    }

    await hp_sheets.write(oauth2,sheetId,'A2:A',emails);
    await hp_sheets.write(oauth2,sheetId,'B2:B',nombres);
    await hp_sheets.write(oauth2,sheetId,'C2:C',apellidos);
    await hp_sheets.write(oauth2,sheetId,'D2:D',pases);




    res.redirect(`https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`)

})


module.exports = router;



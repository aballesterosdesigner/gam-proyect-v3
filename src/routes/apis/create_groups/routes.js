
const express = require('express');
const router = express.Router();
//la siguiente constante tiene toda la libreria de funciones de google
const { google } = require('googleapis');
//Comprobamos si el usuario está logeado
const { isLoggedIn } = require('../../../lib/auth');
//Renderizamos la vista de usuario gracias a la constante
const { renderUserProfile } = require('../../../controllers/user.controller');
//Credenciales que contienen el acceso al proyecto
const credentials = require('../../../../credentials.json');
const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../../../database');
const hp_general = require('../../../lib/helpers');
const hp_sheets = require('../../../lib/helpers/SheetAPI/hp.sheets');
const hp_groups = require('../../../lib/helpers/DirectoryAdmin/helpers.groups');
const hp_reseller = require('../../../lib/helpers/ResellerAPI/helpers');

const uuid = require('uuid');
const parametros = require('./config');


router.get('/profile/create_groups',async(req,res)=>{
    const oauth2 = hp_general.obtenerAuth(req);
    //var clientes = await hp_reseller.listarClientes(oauth2);
    res.render('apis/create_groups/main');
});

router.post('/profile/create_groups',async(req,res)=>{
    var logs = new Array();
    const oauth2 = hp_general.obtenerAuth(req);
    const {sheetId,nameSheet} = req.body;
    const rg_grupos = `${nameSheet}!${parametros.grupos}`; 
    const rg_miembros = `${nameSheet}!${parametros.miembros}`;
    
    var grupos = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, rg_grupos)).data.values);
    var miembros = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, rg_miembros)).data.values);
    var resultGroups = await hp_groups.createGroups(oauth2,grupos);
    var resultMiembros = await hp_groups.insertMember(oauth2,grupos,miembros);

    for(const i in resultGroups){logs.push(resultGroups[i]);}
    for(const i in resultMiembros){logs.push(resultMiembros[i]);}    
    
    res.render('logs/main',{logs:logs});
});



module.exports = router;
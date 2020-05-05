const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { isLoggedIn } = require('../../../lib/auth');
const { renderUserProfile } = require('../../../controllers/user.controller');
const credentials = require('../../../../credentials.json');
const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../../../database');
const hp_general = require('../../../lib/helpers');
const hp_sheets = require('../../../lib/helpers/SheetAPI/hp.sheets');
const hp_groups = require('../../../lib/helpers/DirectoryAdmin/helpers.groups');
const uuid = require('uuid');
const parametros = require('./config');


router.get('/profile/create_groups',(req,res)=>{
    const oauth2 = hp_general.obtenerAuth(req);
    res.render('apis/create_groups/main')
});

router.post('/profile/create_groups',async(req,res)=>{
    const oauth2 = hp_general.obtenerAuth(req);
    const {sheetId,nameSheet} = req.body;
    const rg_grupos = `${nameSheet}!${parametros.grupos}`; 
    const rg_miembros = `${nameSheet}!${parametros.miembros}`;


    var grupos = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, rg_grupos)).data.values);
    var miembros = ((await hp_sheets.obtenerValoresSheet(oauth2, google, sheetId, rg_miembros)).data.values);



    hp_groups.createGroupsSheets(oauth2,miembros,grupos,req,res);    
});



module.exports = router;
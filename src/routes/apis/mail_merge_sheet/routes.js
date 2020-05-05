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
const hp_users = require('../../../lib/helpers/DirectoryAdmin/helpers.users');
const hp_sheets = require('../../../lib/helpers/SheetAPI/hp.sheets');
const hp_groups = require('../../../lib/helpers/DirectoryAdmin/helpers.groups');
const uuid = require('uuid');

module.exports = router;




router.get('/profile/mail_merge_sheet', (req, res) => {
    res.render('apis/mail_merge_sheet/main');
});



router.post('/profile/mail_merge_sheet', async (req, res) => {
    /*Obtenemos el sheetId y el dominio */
    const { sheetId, dominio, remitente } = req.body;
    const oauth2 = hp_general.obtenerAuth(req);
    const service = google.sheets({ version: 'v4', auth: oauth2 });
    var data = new Array();

    var givenName = await hp_users.usersByFields(oauth2, dominio, 'users(name(givenName))');
    var familyName = await hp_users.usersByFields(oauth2, dominio, 'users(name(familyName))');
    var emails = await hp_users.usersByFields(oauth2, dominio, 'users(primaryEmail)');


    for(const key in givenName){
        console.log(key);
        await service.spreadsheets.values.append({
            spreadsheetId:sheetId,
            range:'A2:B',
            insertDataOption:'OVERWRITE',
            valueInputOption:'RAW',
            resource:{
                "values":[
                    [givenName[key].name.givenName,familyName[key].name.familyName,remitente,"",emails[key].primaryEmail]
                ]
            }
        })
    }
    req.flash('success','se han insertado correctamente');
    res.redirect('/profile');









}); 
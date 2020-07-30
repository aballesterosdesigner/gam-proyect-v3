const bcrypt = require('bcryptjs');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../../../credentials.json');
const hp_sheets = require('../SheetAPI/hp.sheets');
const hp_generales = require('../../helpers');
const hp_logs = require('../../../lib/helpers/LogsAPI/helpers');
const helpers = {};

helpers.listarClientes = async(oauth2)=>{
    var service = google.reseller({version:'v1',auth:oauth2});
    await service.subscriptions.list({}).then((res)=>{
        console.log(res);
    });
}


module.exports = helpers;

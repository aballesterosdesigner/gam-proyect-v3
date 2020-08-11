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
    var data = await service.subscriptions.list({});
    var clientes = new Array();
    var obj = [];
    var aux = [];

    for(const i in data.data.subscriptions){
        await clientes.push(data.data.subscriptions[i].customerDomain);
    }
    clientes.forEach(el => {
        if(!(el in obj)){
            obj[el]=true;
            aux.push(el);
        }
    });

    return aux;
}


module.exports = helpers;

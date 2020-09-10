const bcrypt = require('bcryptjs');
const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../../../credentials.json');
const uuid = require('uuid');

const helpers = {};




helpers.obtenerValoresSheet = async (auth, google, sheetId, range) => {
    const service = google.sheets({ version: 'v4', auth });
    var data = service.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range
    });
    return data;
}
helpers.write = async(auth,sheetId,range,values,hoja)=>{
    const service = google.sheets({version:'v4',auth});
    var values_sheet = await service.spreadsheets.values.get({
        spreadsheetId:sheetId,
        range:`${hoja}!${range}1:${range}`
    });
    console.log(values_sheet.data.values);
     
    var lastIndex = `${values_sheet.data.values.length+parseInt(1)}`;
   
    service.spreadsheets.values.update({
        spreadsheetId:sheetId,
        range:`${hoja}!${range}${lastIndex}:${range}`,
        valueInputOption:'USER_ENTERED',
        resource:{
            values:values
        }
    });
    
}
helpers.checkId = async(auth,sheetId) =>{
    const service = google.sheets({version:'v4',auth});
    service.spreadsheets.get({
        spreadsheetId:sheetId
    }).catch((err)=>{
        console.log(err.errors["message"]);
    })
}




module.exports = helpers;
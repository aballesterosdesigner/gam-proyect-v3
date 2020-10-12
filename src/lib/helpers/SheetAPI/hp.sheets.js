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
helpers.write = async(auth,sheetId,range,values)=>{
    const service = google.sheets({version:'v4',auth});
    service.spreadsheets.values.update({
        spreadsheetId:sheetId,
        range:range,
        valueInputOption:'USER_ENTERED',
        resource:{
            values
        },
      }, (err, result) => {
        if (err) {
          // Handle error
          console.log(err);
        } else {
          console.log('%d cells updated.', result.updatedCells);
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

helpers.createSheet = async(auth,name)=>{
    const service = google.sheets({version:'v4',auth});
    const resource = {
        properties: {
          title:name,
        },
      };
    var id = await service.spreadsheets.create({
        resource
    });
    return id;
}




module.exports = helpers;
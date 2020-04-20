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


module.exports = helpers;
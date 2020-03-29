const bcrypt = require('bcryptjs');
const helpers = {};
const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../credentials.json');
helpers.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

helpers.matchPassword = async (password, savedPassword) => {
  try {
    return await bcrypt.compare(password, savedPassword);
  } catch (e) {
    console.log(e)
  }
};


helpers.obtenerValoresSheet = (auth, google, sheetId, range) => {
  const service = google.sheets({ version: 'v4', auth });
  var data = service.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: range
  });
  return data;
}



helpers.obtenerAuth = (req) => {
  const auth = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/admin.directory.user',
      'https://www.googleapis.com/auth/admin.reports.audit.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/apps.order',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/admin.directory.group'
    ]
  });


  const oauth2 = new OAuth2Client(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris[0]
  );

  oauth2.credentials = req.user.token;
  oauth2.setCredentials({
    access_token: req.user.token,
    refresh_token: req.user.refreshToken
  });

return oauth2;
}
module.exports = helpers;

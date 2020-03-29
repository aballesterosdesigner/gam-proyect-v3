const userCtrl = {};
const fs = require('fs');
const {google} = require('googleapis');
const passport = require('passport');
// const OAuth2Data = require('../../credentials.json');

userCtrl.renderUserProfile = (req, res, next) => {
  res.render('profile');
 
  

 }

module.exports = userCtrl;
const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { isLoggedIn } = require('../lib/auth');
const { renderUserProfile } = require('../controllers/user.controller');
const credentials = require('../../credentials.json');
const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../database');
const helpers = require('../lib/helpers');
const uuid = require('uuid');



router.get('/profile', isLoggedIn, renderUserProfile);


router.get('/profile/seeUsers',(req,res)=>{
  res.render('partials/seeUsers');
})
router.post('/profile/seeUsers',(req,res)=>{
  res.render('partials/seeUsers');
});
  





module.exports = router;









module.exports = router;
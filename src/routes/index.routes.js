const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { renderIndex } = require('../controllers/index.conroller');
const {GoogleAuth} = require('google-auth-library');
const {OAuth2Client} = require('google-auth-library');
const credentials = require('../../credentials.json');
router.get('/', renderIndex);



// router.get('/',(req,res)=>{
//     console.log(req.user.profile.photos.value)
// })
router.get('/mine', async (req, res, next) => {
 
});


router.get('/test',(req,res)=>{
    console.log(req.user);
})

module.exports = router;
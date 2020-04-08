const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { isLoggedIn } = require('../../../lib/auth');
const { renderUserProfile } = require('../../../controllers/user.controller');
const credentials = require('../../../../credentials.json');
const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../../../database');
const helpers = require('../../../lib/helpers');
const helpersUsers = require('../../../lib/helpers/DirectoryAdmin/helpers.users');
const uuid = require('uuid');
const nodemailer = require('nodemailer');




router.get('/profile/dobles_verificaciones',isLoggedIn,(req,res)=>{
    res.render('apis/dobles_verificaciones/main');
});

router.post('/profile/dobles_verificaciones',isLoggedIn,async(req,res)=>{
    /* Auth de google */
    const oauth2 = helpers.obtenerAuth(req);
    /* Dominio del cliente*/
    const {dominio} = req.body;
    /* Todos los datos del usuario (JSON) además contendrá los errores*/
    const data_users = await helpersUsers.dataUsers(oauth2,dominio,req,res);






    /* Usuarios que no tienen la verificacion en dos pasos */
    // const usersNotEnrolledIn2Sv = await helpersUsers.isNotEnrolledIn2Sv(oauth2,data_users,req,res);
    

    req.flash('users',usersNotEnrolledIn2Sv);    
    res.redirect('/profile/dobles_verificaciones');
    
});

router.get('/profile/dobles_verificaciones/:email',async(req,res)=>{
    const oauth2 = helpers.obtenerAuth(req);
    const {email} = req.params;
    const dominio = email.split('@')[1];
    const data_users = await helpersUsers.dataUsers(oauth2,dominio,req,res);


    const usersNotEnrolledIn2Sv = await helpersUsers.isNotEnrolledIn2Sv(oauth2,data_users,req,res);
    await helpersUsers.activarDobleVerificacion(oauth2,email,req,res);


    req.flash('users',usersNotEnrolledIn2Sv);
    res.redirect('/profile/dobles_verificaciones');
});
router.get('/profile/send',(req,res)=>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
               user: 'a.ballesteros@hispacolextech.com',
               pass: 'AntonioHTC@2021'
           }
       });


       const mailOptions = {
        from: 'a.ballesteros@hispacolextech.com', // sender address
        to: 'a.ballesteros@hispacolextech.com', // list of receivers
        subject: 'Subject of your email', // Subject line
        html: '<p>Your html here</p>'// plain text body
      };


      transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          console.log(err)
        else
          console.log(info);
     });
})


module.exports = router;
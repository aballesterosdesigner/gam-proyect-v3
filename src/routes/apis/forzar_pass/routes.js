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
const uuid = require('uuid');


router.get('/profile/change_password', async (req, res) => {
    res.render('apis/change_password/main');
});



router.post('/profile/change_password', async (req, res) => {

    

    const oauth2 = helpers.obtenerAuth(req);
  
    const { domain, dias, eleccion} = req.body;

    // var fecha, email, evento;
    var id_cliente = await helpers.obtenerIdCliente(oauth2, domain, google);
    var clientes = await helpers.obtenerClientesDominio(oauth2, domain, google);
    var eventos = await helpers.obtenerEventosAuditoria(oauth2, id_cliente, google);
    var restantes = await helpers.compararRestanteArrays(oauth2, eventos, clientes);
    var recientes = await helpers.usuariosRecientesChangePass(oauth2, eventos,domain,google,dias);
    
    switch (eleccion) {
      case "user":
        res.render('apis/change_password/all',{restantes:restantes,recientes:recientes,domain:domain});
      break;
      default:
        await helpers.forzarCambioPass(oauth2, recientes, req, res,false);
      break;
    }
  });


  router.get('/profile/change_password/:email',(req,res)=>{
    const {email} = req.params;
    const oauth2 = helpers.obtenerAuth(req);
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    service.users.update({
      userKey: email,
      resource: {
        changePasswordAtNextLogin: true
      }
    }).then((success) => {
      req.flash('success',`Se ha forzado el cambio de contraseña de ${email }`);
      res.redirect('/profile/change_password')
    }).catch((error) => {
      console.log(error)
    });
  
  })




module.exports = router;
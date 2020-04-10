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
const helpersUnidadesCompartidas = require('../../../lib/helpers/DriveAPI/helpers.unidades_compartidas');

const uuid = require('uuid');


router.get('/profile/create_drive_units', async (req, res) => {
    var oauth2 = helpers.obtenerAuth(req);
    var nombres_unidades = await helpersUnidadesCompartidas.obtenerDatosUnidades(oauth2, 'teamDrives(name)');
    var id_unidades = await helpersUnidadesCompartidas.obtenerDatosUnidades(oauth2, 'teamDrives(id)');
    var data = new Array();


    for (const i in nombres_unidades) {
        var aux = new Array();
        aux.push(nombres_unidades[i], id_unidades[i]);
        data.push(aux);

    }


    res.render('apis/crear_unidades/main', { id_unidades: id_unidades, nombres_unidades: data });

});


router.post('/profile/create_drive_units', isLoggedIn, async (req, res) => {
    const { nombre_unidad, sheetId, email, rol, nombre_hoja } = req.body;
    var oauth2 = helpers.obtenerAuth(req);
    const service = google.drive({ version: 'v3', auth: oauth2 });
    // const sheet = google.sheets({ version: 'v4', auth: oauth2 });
    const parametros = require('./config');




    var unidades = new Array();
    var roles = ['organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'];

    var rg_unidades = `${nombre_hoja}!${parametros.unidad}`;
    var rg_administradores = `${nombre_hoja}!${parametros.administradores}`;

    var unidades = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_unidades)).data.values;
    var values_admin = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_administradores)).data.values;
    





    for(const i in unidades){
        var requestId = uuid.v4();
        var id = helpersUnidadesCompartidas.crearUnidadesSheet(oauth2, requestId,unidades[i],'organizer',email,req, res);
        console.log(id);

    }   
    
    // console.log(roles);

    // var usuarios = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_rol)).data.values
    // res.send(roles);
    // console.log(unidades);
    // for(const key in unidades){
    //     var requestId = uuid.v4();
    //     helpersUnidadesCompartidas.crearUnidadesSheet(oauth2, requestId, unidades[key],roles[key],'antoniobuzouzo@gmail.com',req, res);
    // }    



});


/* Crear manualmente */
router.post('/profile/create_drive_units/create', (req, res) => {
    var oauth2 = helpers.obtenerAuth(req);
    const { nombre_unidad } = req.body;
    var requestId = uuid.v4();
    /* Usamos la funcion para crear la unidad compartida */
    helpersUnidadesCompartidas.crearUnidades(oauth2, requestId, nombre_unidad, req, res);

});

router.post('/profile/create_drive_units/borrarUnidad', (req, res) => {
    var oauth2 = helpers.obtenerAuth(req);
    const { nombre_unidad } = req.body;
    var requestId = uuid.v4();

    helpersUnidadesCompartidas.borrarUnidades(oauth2, requestId, nombre_unidad, req, res);
});



router.post('/profile/create_drive_units/addPermissions', (req, res) => {

    var oauth2 = helpers.obtenerAuth(req);
    const { rol, nombre_unidad, email } = req.body;
    helpersUnidadesCompartidas.addRol(oauth2, rol, nombre_unidad, email, req, res);
});



module.exports = router;
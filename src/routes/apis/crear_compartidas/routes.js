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
const ctrl_general = require('../../../controllers/generales.controller');
const uuid = require('uuid');
const hp_sheets = require('../../../lib/helpers/SheetAPI/hp.sheets');


router.get('/profile/create_drive_units', async (req, res) => {
    var oauth2 = helpers.obtenerAuth(req);
    var nombres_unidades = await helpersUnidadesCompartidas.obtenerDatosUnidades(oauth2, 'teamDrives(name)');
    var id_unidades = await helpersUnidadesCompartidas.obtenerDatosUnidades(oauth2, 'teamDrives(id)');
    var data = new Array();




    res.render('apis/crear_unidades/main', { id_unidades: id_unidades, nombres_unidades: data });

});


router.post('/profile/create_drive_units', isLoggedIn, async (req, res) => {
    const { nombre_unidad, sheetId, email, rol, nombre_hoja } = req.body;
    var oauth2 = helpers.obtenerAuth(req);
    const service = google.drive({ version: 'v3', auth: oauth2 });
    const parametros = require('./config');




    var unidades = new Array();
    var roles = ['organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'];

    var rg_unidades = `${nombre_hoja}!${parametros.unidad}`;
    var rg_administradores = `${nombre_hoja}!${parametros.administradores}`;
    var rg_gestores = `${nombre_hoja}!${parametros.gestores}`;
    var rg_colaboradores = `${nombre_hoja}!${parametros.colaboradores}`;
    var rg_comentadores = `${nombre_hoja}!${parametros.comentadores}`;
    var rg_lectores = `${nombre_hoja}!${parametros.lectores}`;
    var id_vacio, nombre_hoja_vacio = false;


    if (sheetId === "") {
        id_vacio = true;
    }
    if (nombre_hoja === "") {
        nombre_hoja_vacio = true;
    }

    if (id_vacio === true && nombre_hoja_vacio === true) {
        ctrl_general.goToAndLog(req,res,'message','El id y el nombre de la hoja no pueden estar vacíos','/profile/create_drive_units');
    }else if(id_vacio===true && nombre_hoja_vacio!=true){
        ctrl_general.goToAndLog(req,res,'message','El nombre de la hoja no puede estar vacío','/profile/create_drive_units');
    }else if(id_vacio!=true && nombre_hoja_vacio==true){
        ctrl_general.goToAndLog(req,res,'message','El id de la hoja no puede estar vacío','/profile/create_drive_units');
    }else{
       
        var unidades = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_unidades)).data.values;
        var values_admin = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_administradores)).data.values;
        var values_gestores = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_gestores)).data.values;
        var values_colaboradores = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_colaboradores)).data.values;
        var values_comentadores = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_comentadores)).data.values;
        var values_lectores = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_lectores)).data.values;
        helpersUnidadesCompartidas.crearUnidadesSheet(oauth2,unidades,values_admin,values_gestores,values_colaboradores,values_comentadores,values_lectores,req, res); 
    }





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
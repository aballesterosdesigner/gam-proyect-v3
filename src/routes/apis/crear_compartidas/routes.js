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
    var logs = new Array();



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
        ctrl_general.goToAndLog(req, res, 'message', 'El id y el nombre de la hoja no pueden estar vacíos', '/profile/create_drive_units');
    } else if (id_vacio === true && nombre_hoja_vacio != true) {
        ctrl_general.goToAndLog(req, res, 'message', 'El nombre de la hoja no puede estar vacío', '/profile/create_drive_units');
    } else if (id_vacio != true && nombre_hoja_vacio == true) {
        ctrl_general.goToAndLog(req, res, 'message', 'El id de la hoja no puede estar vacío', '/profile/create_drive_units');
    } else {

        var unidades = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_unidades)).data.values;
        var values_admin = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_administradores)).data.values;
        var values_gestores = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_gestores)).data.values;
        var values_colaboradores = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_colaboradores)).data.values;
        var values_comentadores = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_comentadores)).data.values;
        var values_lectores = (await helpers.obtenerValoresSheet(oauth2, google, sheetId, rg_lectores)).data.values;


        var admins = new Array();
        var gestores = new Array();
        var colaboradores = new Array();
        var comentadores = new Array();
        var lectores = new Array();

        var values = [values_admin,values_gestores, values_colaboradores, values_comentadores, values_lectores];

        var ctrl_admins = await helpersUnidadesCompartidas.controlUndefined(values_admin);
        var ctrl_gestores = await helpersUnidadesCompartidas.controlUndefined(values_gestores);
        var ctrl_comentadores = await helpersUnidadesCompartidas.controlUndefined(values_comentadores);
        var ctrl_colaboradores = await helpersUnidadesCompartidas.controlUndefined(values_colaboradores);
        var ctrl_lectores = await helpersUnidadesCompartidas.controlUndefined(values_lectores);


        /*console.log(ctrl_admins);
        console.log(ctrl_gestores);
        console.log(ctrl_comentadores);
        console.log(ctrl_colaboradores);
        console.log(ctrl_lectores); */

        if (ctrl_admins != true) {console.log(admins.push(await helpersUnidadesCompartidas.splitArray(values[0])))}
         if (ctrl_gestores != true) {await gestores.push(helpersUnidadesCompartidas.splitArray(values[1]));}
         if (ctrl_colaboradores != true) {await colaboradores.push(helpersUnidadesCompartidas.splitArray(values[2]));}
         if (ctrl_comentadores != true) {await comentadores.push(helpersUnidadesCompartidas.splitArray(values[3]));}
         if (ctrl_lectores != true) {await lectores.push(helpersUnidadesCompartidas.splitArray(values[4]));}

        //console.log(admins);
        // console.log(`Gestores: ${gestores}`);
        // console.log(`Comentadores: ${comentadores}`);
        // console.log(`Colaboradores: ${colaboradores}`);
        // console.log(`Lectores: ${lectores}`);

        


        // helpersUnidadesCompartidas.crearUnidadesSheet(oauth2,unidades,values_admin,values_gestores,values_colaboradores,values_comentadores,values_lectores,req, res); 
        //var roles = ['organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'];

        var logsUnits = await helpersUnidadesCompartidas.crearUnidades(oauth2,unidades,req,res);
        var logsAdmin = await helpersUnidadesCompartidas.addRol(oauth2,unidades,'organizer',admins,req,res);
        var logsFileOrganizer = await helpersUnidadesCompartidas.addRol(oauth2,unidades,'fileOrganizer',gestores,req,res);
        var logsWriter = await helpersUnidadesCompartidas.addRol(oauth2,unidades,'writer',colaboradores,req,res);
        var logsCommenter = await helpersUnidadesCompartidas.addRol(oauth2,unidades,'commenter',comentadores,req,res);
        var logsReader = await helpersUnidadesCompartidas.addRol(oauth2,unidades,'reader',lectores,req,res); 

        for (const i in logsUnits) {logs.push(logsUnits[i]);}
        for(const i in logsAdmin){logs.push(logsAdmin[i])}
        for(const i in logsFileOrganizer){logs.push(logsFileOrganizer[i]);}
        for(const i in logsWriter){logs.push(logsWriter[i]);}
        for(const i in logsCommenter){logs.push(logsCommenter[i]);}
        for(const i in logsReader){logs.push(logsReader[i]);}
  
        res.render('logs/main',{logs:logs})
}








});


/* Crear manualmente */
router.post('/profile/create_drive_units/create', (req, res) => {
    var oauth2 = helpers.obtenerAuth(req);
    const { nombre_unidad } = req.body;

    helpersUnidadesCompartidas.crearUnidades(oauth2, nombre_unidad, req, res);

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
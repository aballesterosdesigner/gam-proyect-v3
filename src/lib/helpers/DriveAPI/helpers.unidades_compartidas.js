const bcrypt = require('bcryptjs');
const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../../../credentials.json');
const helpers = {};

helpers.crearUnidades = (oauth2, requestId, unidad,req, res) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });
    service.teamdrives.create({
        resource: {
            name: unidad,
        },
        requestId: requestId,
        fields: '*'
    }).then((success) => {
        req.flash('success',`Se ha creado la unidad correctamente ${unidad}`);
        res.redirect('/profile/create_drive_units');
    }).catch((err) => {
        console.log(err);
    });
}

helpers.crearUnidadesSheet = (oauth2, requestId,unidad,email,req, res) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });
    service.teamdrives.create({
        resource: {
            name: unidad,
        },
        requestId: requestId,
        fields: '*'
    }).then((success) => {
        return success.data.id;
    }).catch((err) => {
        return err;
    });
}
helpers.borrarUnidades = (oauth2, requestId, unidad,req, res) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });
    service.teamdrives.delete({
        teamDriveId:unidad,
        requestId: requestId,
        fields: '*'
    }).then((success) => {
        req.flash('success',`Se ha borrado la unidad correctamente ${unidad}`);
        res.redirect('/profile/create_drive_units');
    }).catch((err) => {
        console.log(err);
    });
}





helpers.obtenerDatosUnidades = async(oauth2,parametro)=>{
    const service = google.drive({ version: 'v3', auth: oauth2 });
    var aux = new Array();
     var data = service.teamdrives.list({
        "fields": parametro
    
    }).then((res)=>{
        for(const i in res.data.teamDrives){
            for(const j in res.data.teamDrives[i]){
               aux.push(res.data.teamDrives[i][j]);
            }
        }
        return aux;   
    });
    return data
}


helpers.addRol = async(oauth2,rol,idUnidad,email,req,res) =>{
    const service = google.drive({ version: 'v3', auth: oauth2 });
    service.permissions.create({
        fileId:idUnidad,
        supportsTeamDrives:true,
        resource:{
            role:rol,
            type:'user',
            emailAddress:email
        }
    }).then((result)=>{
        req.flash('success',`Se insertado a ${email} con rango ${rol}`)
        res.redirect('/profile/create_drive_units')
    })
}







module.exports = helpers;

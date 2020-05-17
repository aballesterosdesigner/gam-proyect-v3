const bcrypt = require('bcryptjs');
const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../../../credentials.json');
const helpers = {};


/* Mostrar usuarios de un dominio */
helpers.dataUsers = async (oauth2, dominio, req, res) => {
    const admin = google.admin({ version: 'directory_v1', auth: oauth2 });

    var users = admin.users.list({
        domain: dominio
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
        return err.code;
    });
    return users;
}


helpers.usersByFields = async(oauth2,domain,fields) =>{
    const service = google.admin({version:'directory_v1',auth:oauth2});
    const dat = await service.users.list({
        domain:domain,
        fields:fields
    });

    return dat.data.users;
}


helpers.isNotEnrolledIn2Sv = async (oauth2, data_users, req, res) => {
    var result = new Array;
    for (key in data_users.data.users) {
        if (data_users.data.users[key].isEnrolledIn2Sv == false) {
            result.push(data_users.data.users[key].primaryEmail);
        }
    }
    return result;
}




helpers.activarDobleVerificacion = async (oauth2, email, req, res) => {
    const admin = google.admin({ version: 'directory_v1', auth: oauth2 });
    admin.users.patch({
        userKey: email,
        fields: '*',
        resource: {
            isEnrolledIn2Sv: true,
            isEnforcedIn2Sv: true,
        }
    }).then((success) => {
        console.log('Ha ido bien')
    }).catch((err) => {

        console.log(err);
    });
}

helpers.addUsersSheet = async (oauth2, nombres, apellidos, correos, alias, req, res) => {
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    var aux_nombres = new Array();
    var err_logs = new Array();
    var aux_alias = new Array();
    for (const i in correos) {
       
        if (alias === undefined) {
            console.log('INDEFINIDO')
            // err_logs.push(correos[i]);
        } else {
            aux_alias.push(alias[i][0].replace(/ /g, "").split(","));
        }
        
        if(nombres === undefined || apellidos == undefined){
            err_logs.push(`${correos[i]} no puede ser creado porque falta el nombre o el apellido`)
        }
        service.users.insert({
            resource: {
                name: {
                    familyName: `${apellidos[i][0]}`,
                    givenName: `${nombres[i][0]}`,
                },
                primaryEmail: correos[i][0],
                password: `${nombres[i]}@2020`,
            },
        }).then((result) => {
            for (const j in aux_alias[i]) {
                console.log(aux_alias[i][j])
                // console.log(aux_alias[i][j]);
                service.users.aliases.insert({
                    userKey: correos[i],
                    resource: {
                        alias: aux_alias[i][j]
                    }
                }).then((result_alias) => {
                    console.log(`Tutto benne`);
                });
            }
        })
    }
   
    
    req.flash('err_logs', 'Hola');
    res.redirect('/profile/create_users');


}

module.exports = helpers;
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


helpers.usersByFields = async (oauth2, domain, fields) => {
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    const dat = await service.users.list({
        domain: domain,
        fields: fields
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
helpers.forzarPass = async(oauth2,users,activado,req,res)=>{
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    let result;
    service.users.update({
        userKey:users,
        resource:{
          changePasswordAtNextLogin:activado
        }
      }).then((res)=>{
        console.log(res);
    }).catch((err)=>{
        console.log(err);
      });

      return "Hola"


}


helpers.addUsersSheet = async (oauth2, nombres, apellidos, correos, alias, telefono, req, res) => {
    var d = new Date();
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    var aux_nombres = new Array();
    var err_logs = new Array();
    var aux_alias = new Array();
    var logs = new Array();
    var domain = "";
    var fecha = `${d.getDay()}/${d.getMonth()}/${d.getFullYear()} ${d.getUTCHours()}: ${d.getMinutes()} : ${d.getSeconds()} `;


    for (const i in correos) {

        //Un poquito de control.
        if(alias!=undefined){
            aux_alias.push(alias[i][0].replace(/ /g, "").split(","));
        }
        if (nombres === undefined || apellidos == undefined) {
            err_logs.push(`[ERROR]${correos[i]} no puede ser creado porque falta el nombre o el apellido`)
        }

        if(telefono[i]===undefined){
            await service.users.insert({
                resource: {
                    name: {
                        familyName: `${apellidos[i][0]}`,
                        givenName: `${nombres[i][0]}`,
                    },
                    primaryEmail: correos[i][0],
                    password: `${nombres[i]}@2020`,
                    recoveryPhone: ``,
                    phones: [{
                        primary: ``,
                        value: ``,
                        type: 'work'
                    }]
                },
            }).then(async(result) => {
                console.log(`[SUCCESS]: Se ha creado correctamente el usuario ${correos[i][0]}`);
                for (const j in aux_alias[i]) {
                    console.log(aux_alias[i][j]);
                    // console.log(aux_alias[i][j]);
                    await service.users.aliases.insert({
                        userKey: correos[i],
                        resource: {
                            alias: aux_alias[i][j]
                        }
                    }).then((result_alias) => {
                        console.log(`[SUCCESS]: Se ha insertado el alias ${aux_alias[i][j]} al usuario ${correos[i][0]}`)
                    });
                }
            }).catch((err)=>{
                if(err.errors[0]["reason"] === "duplicate"){
                    console.log(`[WARNING]: El usuario ${correos[i][0]} ya existe, por tanto no se ha podido crear`)
                }else{
                    console.log(`[ERROR]: ${err.errors[0]["reason"]}`)
                }
            })
        }else{

        }
        
    } 


    req.flash('err_logs', 'Hola');
    res.redirect('/profile/create_users');


}

helpers.userExist=async(user,domain,oauth2)=>{
    console.log(user);
    console.log(`[INFO] Se está comprobando si el usuario ${user} existe en el dominio ${domain}`);
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    const dat = await service.users.list({domain: domain,fields: '*' });
    const users = dat.data.users;
    var user_existe = false;
    for (const key in users) {
        if(users[key].primaryEmail === user[0]){
            user_existe=true;
        }
        

    }

    return user_existe;
};

module.exports = helpers;
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node src/ind
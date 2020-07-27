const bcrypt = require('bcryptjs');
const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../../../credentials.json');
const helpers = {};
const fs = require('fs');


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
   console.log(users);
    await service.users.update({
        userKey:users,
        resource:{
          changePasswordAtNextLogin:activado
        }
      }).then((res)=>{
        console.log('success');
    }).catch((err)=>{
        console.log(err);
      });


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
            fs.appendFile('logsUsersCreate.txt', `[ERROR]${correos[i]} no puede ser creado porque falta el nombre o el apellido\n`, (err) => {});
        }
        if(telefono[i][0]===undefined){
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
                fs.appendFile('logsUsersCreate.txt', `[SUCCESS]: Se ha creado correctamente el usuario ${correos[i][0]}\n`, (err) => {});
                console.log(``);
                for (const j in aux_alias[i]) {
                    console.log(aux_alias[i][j]);
                    // console.log(aux_alias[i][j]);
                    await service.users.aliases.insert({
                        userKey: correos[i],
                        resource: {
                            alias: aux_alias[i][j]
                        }
                    }).then((result_alias) => {
                        fs.appendFile('logsUsersCreate.txt', `[SUCCESS]: Se ha insertado el alias ${aux_alias[i][j]} al usuario ${correos[i][0]}\n`, (err) => {});
                    });
                }
            }).catch((err)=>{
                if(err.errors[0]["reason"] === "duplicate"){
                    fs.appendFile('logsUsersCreate.txt', `[WARNING]: El usuario ${correos[i][0]} ya existe, por tanto no se ha podido crear\n`, (err) => {});
                }else{
                    fs.appendFile('logsUsersCreate.txt', `[ERROR]: ${err.errors[0]["reason"]}\n`, (err) => {});

                    console.log(``)
                }
            })
        }else{

        }
        
    } 

    res.redirect('/profile/create_users');


}

helpers.userExist=async(user,domain,oauth2)=>{
    //console.log(`[INFO] Se está comprobando si el usuario ${user} existe en el dominio ${domain}`);
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    const dat = await service.users.list({domain: domain,fields: '*' });
    const users = dat.data.users;
    var user_existe = false;
    for (const key in users) {
        if(users[key].primaryEmail === user){
            user_existe=true;
        }
        

    }

    return user_existe;
};


helpers.createUsers = async(oauth2,correos,nombres,apellidos,telefonos) =>{
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });

    var checkCorreos = await helpers.checkIsUndefined(correos);
    var checkNombres = await helpers.checkIsUndefined(nombres);
    var checkApellidos = await helpers.checkIsUndefined(apellidos);
    var checkTelefonos = await helpers.checkIsUndefined(telefonos);

    console.log(checkApellidos)
    if(checkCorreos===true && checkNombres===true &&  checkApellidos === true && checkTelefonos ===true){
        for(const i in correos){
            var tlf = ``;
            if(correos[i][0]!=undefined && nombres[i][0]!=undefined && apellidos[i][0]!=undefined){
                var userExist = await helpers.userExist(correos[i][0],'demo.hispacolextech.com',oauth2);
                if(userExist!=true){
                    fs.appendFile('logsUsersCreate.txt', `[INFO]:El usuario ${correos[i][0]} no existe\n`, (err) => {});

                    if(telefonos[i]!=undefined){
                        tlf = telefonos[i][0];
                    }

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
                                primary: `${tlf}`,
                                value: ``,
                                type: 'work'
                            }]
                        },
                    }).then((res)=>{
                        console.log(`Se ha creado ${correos[i][0]}`);
                    }).catch((err)=>{
                        console.log(`error ${correos[i][0]}`);
                    })


                }else{
                    fs.appendFile('logsUsersCreate.txt', `[INFO]: El usuario ${correos[i][0]} Ya existe \n`, (err) => {});


                }
            }else{
                console.log(`Hay algun campo vacio obligatorio para la fila ${parseInt(i)+2}`)
            }    
        }
    }else{
        console.log('Las columnas no pueden estar vacías');
    }
    
}
helpers.insertAlias = async(oauth2,correos,alias)=>{
        const service = google.admin({ version: 'directory_v1', auth: oauth2 });

    for(const i in correos){
        var checkAlias = await helpers.checkIsUndefined(alias);
        if(checkAlias === true){
            if(alias[i]!=undefined){
                var aux_alias = new Array();
                aux_alias = alias[i][0].replace(/ /g, "").split(",");
                for(const j in aux_alias){
                    console.log(aux_alias[j])
                    await service.users.aliases.insert({
                        userKey: correos[i][0],
                        resource: {
                            alias: aux_alias[j]
                        }
                    }).then((result_alias) => {
                        //console.log(`[SUCCESS]: Se ha insertado el alias ${aux_alias[j]} al usuario ${correos[i][0]}\n`)
                        fs.appendFile('logsUsersCreate.txt', `[SUCCESS]: Se ha insertado el alias ${aux_alias[j]} al usuario ${correos[i][0]}\n`, (err) => {});

                    }).catch((err)=>{
                        if(err.errors[0]["reason"]==="duplicate"){
                            fs.appendFile('logsUsersCreate.txt', `[ERROR]: El alias ${aux_alias[j]} ya existe en el usuario ${correos[i][0]}\n`, (err) => {});

                        }
                    });
                }
            }
        }else{
            console.log(`La columna de alias no puede estar vacia en la fila ${parseInt(i)+2}`)
        }

    }
}
helpers.checkIsUndefined=async(array)=>{
    if(array===undefined){
        return false;
    }else{
        return true;
    }
}
module.exports = helpers;

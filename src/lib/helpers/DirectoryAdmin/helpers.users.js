const bcrypt = require('bcryptjs');
const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../../../credentials.json');
const helpers = {};
const hp_logs = require('../../../lib/helpers/LogsAPI/helpers');
const hp_sheets = require('../../../lib/helpers/SheetAPI/hp.sheets');

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


helpers.createUsers = async(oauth2,domain,correos,nombres,apellidos,telefonos,sheetId) =>{
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });    
    var checkCorreos = await helpers.checkIsUndefined(correos);
    var checkNombres = await helpers.checkIsUndefined(nombres);
    var checkApellidos = await helpers.checkIsUndefined(apellidos);
    var checkTelefonos = await helpers.checkIsUndefined(telefonos);
    var d = new Date();
    console.log(correos);
    var fecha = `${d.getUTCDay()}/${d.getUTCMonth()}/${d.getFullYear()}`;
    console.log(fecha);
    var logs = new Array();


    if(checkCorreos===true && checkNombres===true &&  checkApellidos === true && checkTelefonos ===true){
        for(const i in correos){
            var checkCorreo = await helpers.checkIsUndefined(correos[i]);
            var checkNombre = await helpers.checkIsUndefined(nombres[i]);
            var checkApellido = await helpers.checkIsUndefined(apellidos[i]);
            var passAl = await helpers.generatePassword(10);            
            var tlf = ``;
            if(checkCorreo===true && checkNombre===true && checkApellido===true){
                var userExist = await helpers.userExist(correos[i][0],domain,oauth2);
                if(userExist!=true){
                    var domainUndefined = await helpers.unValidDomain(correos[i][0].split('@')[1],domain);
                    if(domainUndefined===true){
                        //el dominio no es válido en la fila cuyo valor suple el de i
                    }else{
                        logs.push(hp_logs.insertLogs('',`[INFO]:El usuario ${correos[i][0]} no existe`,'warning'));
                    }
                    if(telefonos[i]!=undefined){
                        tlf = telefonos[i][0];
                    }            
                    var log = await service.users.insert({
                        resource: {
                            name: {
                                familyName: `${apellidos[i][0]}`,
                                givenName: `${nombres[i][0]}`,
                            },
                            primaryEmail: correos[i][0],
                            password: `${passAl}`,
                            recoveryPhone: ``,
                            phones: [{
                                value: `${tlf}`,
                                type: 'work'
                            }]
                        },
                    }).then(async(res)=>{             
                        /**Escribimos dentro de la hoja Pass */
                        /**   hp_sheets.write(oauth2,sheetId,'A',[[correos[i][0]]],'Pass');
                        hp_sheets.write(oauth2,sheetId,'B',[[passAl]],'Pass');
                        hp_sheets.write(oauth2,sheetId,'C',[[nombres[i][0]]],'Pass');
                        hp_sheets.write(oauth2,sheetId,'D',[[apellidos[i][0]]],'Pass'); */

                        /* Escribimos dentro de la hoja Logs */
                        //await hp_sheets.write(oauth2,sheetId,'A',[[d]],'Logs');
                        await hp_sheets.write(oauth2,sheetId,'A',[['Success']],'Logs');

                        //await hp_sheets.write(oauth2,sheetId,'C',[[`El usuario ${correos[i][0]} ha sido creado con contraseña ${passAl}`]],'Logs');
                        //await hp_sheets.write(oauth2,sheetId,'D',[[`Usuarios`]],'Logs');

                        return hp_logs.insertLogs(res,`El usuario ${correos[i][0]} ha sido creado con contraseña ${passAl}`,'success');

                    }).catch(async(err)=>{
                        await hp_sheets.write(oauth2,sheetId,'A',[['Error']],'Logs');
                        /**await hp_sheets.write(oauth2,sheetId,'A',[[d]],'Logs');
                        await hp_sheets.write(oauth2,sheetId,'B',[['Error']],'Logs');
                        await hp_sheets.write(oauth2,sheetId,'C',[[`El usuario ${correos[i][0]} no ha podido ser creado debido a ${err}`]],'Logs');
                        await hp_sheets.write(oauth2,sheetId,'D',[[`Usuarios`]],'Logs'); */

                        return await hp_logs.insertLogs(err);
                    });
                    
                    await logs.push(log);
                }else{
                    await hp_sheets.write(oauth2,sheetId,'A',[[d]],'Logs');
                    await hp_sheets.write(oauth2,sheetId,'B',[['Warning']],'Logs');
                    await hp_sheets.write(oauth2,sheetId,'C',[[`El usuario ${correos[i][0]} Ya existe`]],'Logs');
                    await hp_sheets.write(oauth2,sheetId,'D',[[`Usuarios`]],'Logs');

                    logs.push(await hp_logs.insertLogs('',`El usuario ${correos[i][0]} Ya existe`,'warning'));
                } 
            }else{

                logs.push(await hp_logs.insertLogs('',`Hay algun campo vacio obligatorio para la fila ${parseInt(i)+2}`));
            }  
        }
    }else{
        console.log(`Hay algun campo vacio obligatorio para la fila ${parseInt(i)+2}`)
        //logs.push(await hp_logs.insertLogs('',`Hay algun campo vacio obligatorio para la fila ${parseInt(i)+2}`));
    }
    return logs;
}


helpers.sendMail = async () =>{
  
}
helpers.insertAlias = async(oauth2,correos,alias,sheetId)=>{
    var logs = new Array();
    var d = new Date();
    const service = google.admin({version: 'directory_v1', auth: oauth2 });
    for(const i in correos){
        var checkAlias = await helpers.checkIsUndefined(alias);
        if(checkAlias === true){
            if(alias[i]!=undefined){
                var aux_alias = new Array();
                if(alias[i][0]!=undefined){
                    aux_alias = alias[i][0].replace(/ /g, "").split(",");
                }
                console.log(aux_alias);
                for(const j in aux_alias){
                    console.log(aux_alias[j])
                    var log = await service.users.aliases.insert({
                        userKey: correos[i][0],
                        resource: {alias: aux_alias[j]}
                    }).then(async(result_alias)=>{

                        await hp_sheets.write(oauth2,sheetId,'A',[[d]],'Logs');
                        await hp_sheets.write(oauth2,sheetId,'B',[['Success']],'Logs');
                        await hp_sheets.write(oauth2,sheetId,'C',[[`Se ha insertado el alias ${aux_alias[j]} al usuario ${correos[i][0]}`]],'Logs');
                        await hp_sheets.write(oauth2,sheetId,'D',[[`Usuarios/Alias`]],'Logs');

                        return hp_logs.insertLogs(result_alias,`[SUCCESS]: Se ha insertado el alias ${aux_alias[j]} al usuario ${correos[i][0]}`,'success');

                    }).catch(async(err)=>{
                        switch (err.errors[0]["reason"]) {
                            case 'duplicate':
                                await hp_sheets.write(oauth2,sheetId,'A',[[d]],'Logs');
                                await hp_sheets.write(oauth2,sheetId,'B',[['Warning']],'Logs');
                                await hp_sheets.write(oauth2,sheetId,'C',[[`El alias ${aux_alias[j]} no ha sido creado para el usuario ${correos[i][0]} ${err.errors[0]["reason"]}`]],'Logs');
                                await hp_sheets.write(oauth2,sheetId,'D',[[`Usuarios/Alias`]],'Logs');
                               return hp_logs.insertLogs('',`[ERROR]: El alias ${aux_alias[j]} no ha sido creado en el usuario ${correos[i][0]} ${err.errors[0]["reason"]}`,'warning');                
                            break;
                        
                            default:
                                await hp_sheets.write(oauth2,sheetId,'A',[[d]],'Logs');
                                await hp_sheets.write(oauth2,sheetId,'B',[['Warning']],'Logs');
                                await hp_sheets.write(oauth2,sheetId,'C',[[`El alias ${aux_alias[j]} no ha sido creado ${err.errors[0]["reason"]} para el usuario ${correos[i][0]}`]],'Logs');
                                await hp_sheets.write(oauth2,sheetId,'D',[[`Usuarios/Alias`]],'Logs');
                                return hp_logs.insertLogs(err,`[ERROR]: El alias ${aux_alias[j]} no ha sido creado ${err.errors[0]["reason"]}`);                
                            break;
                        }

                    });

                    logs.push(log);
                }
            }
        }else{
            logs.push('','La columna de alias no puede estar vacia en la fila ${parseInt(i)+2}');
        }
    }
    return logs;
}
helpers.checkIsUndefined=async(array)=>{
    if(array===undefined){
        return false;
    }else{
        if(array[0]===undefined){
            return false;
        }
        return true;


    }
}

helpers.obtenerFecha=async()=>{
    var d = new Date();
    var fecha = `${d.getUTCDay()}/${d.getUTCMonth()}/${d.getFullYear()}`;
    return fecha;
}

helpers.unValidDomain=async(value,domain)=> {
    if(value === domain){
        return false;
    }else{
        return true;
    }
}

helpers.obtainById=async(id,oauth2,domain)=>{
    const service = google.admin({version:'directory_v1',auth:oauth2});
    var usuario = '';
    const usuarios = await service.users.list({domain:domain});
    for(const i in usuarios.data.users){
        if(usuarios.data.users[i].id === id){
            usuario = usuarios.data.users[i].primaryEmail;
        }
    }

    return usuario;
}

helpers.generatePassword = async(longitud) =>{

  var caracteres = "abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ2346789";
  var contraseña = "";
  for (i=0; i<longitud; i++) contraseña += caracteres.charAt(Math.floor(Math.random()*caracteres.length));
  return contraseña;

}
module.exports = helpers;
